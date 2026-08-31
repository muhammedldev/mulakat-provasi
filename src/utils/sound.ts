import { hapticError, hapticLight, hapticMedium, hapticSuccess } from "./haptics";

const MUTE_KEY = "mulakat-provasi-muted";

let audioCtx: AudioContext | null = null;
let masterChain: { input: GainNode; reverbSend: GainNode } | null = null;
let reverbBuffer: AudioBuffer | null = null;

// Exported so `music.ts` can share this exact context + master bus (same
// compressor/reverb) instead of standing up a second, differently-voiced
// audio graph — SFX and background music should sound like they live in the
// same room.
export function getSharedContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// A short, soft impulse response gives every sound a faint sense of space
// instead of the dry, boxed-in feel of a raw oscillator hitting the speakers.
function getReverbBuffer(ctx: AudioContext): AudioBuffer {
  if (reverbBuffer) return reverbBuffer;
  const duration = 1.1;
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
    }
  }
  reverbBuffer = buffer;
  return buffer;
}

// Master bus: everything runs through a gentle compressor so layered notes
// glue together instead of clipping, plus a shared reverb send.
export function getMasterChain(ctx: AudioContext): { input: GainNode; reverbSend: GainNode } {
  if (masterChain) return masterChain;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 24;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressor.connect(ctx.destination);

  const input = ctx.createGain();
  input.gain.value = 1;
  input.connect(compressor);

  const convolver = ctx.createConvolver();
  convolver.buffer = getReverbBuffer(ctx);
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0;
  reverbSend.connect(convolver);
  convolver.connect(compressor);

  masterChain = { input, reverbSend };
  return masterChain;
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

interface Note {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  /** Detuned partial one octave up, mixed quietly, adds warmth instead of a bare single tone. */
  shimmer?: boolean;
  /** Send level into the shared reverb bus (0-1). */
  reverb?: number;
  /** Optional pitch glide to this frequency by the end of the note. */
  glideTo?: number;
}

function playNotes(notes: Note[]) {
  if (isMuted()) return;
  const ctx = getSharedContext();
  if (!ctx) return;
  const { input, reverbSend } = getMasterChain(ctx);
  const now = ctx.currentTime;

  notes.forEach(({ freq, start, duration, type = "sine", gain = 0.16, shimmer, reverb = 0.08, glideTo }) => {
    const t0 = now + start;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = Math.min(freq * 5, 9000);
    filter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, t0);
    gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0008, t0 + duration);

    filter.connect(gainNode);
    gainNode.connect(input);
    if (reverb > 0) {
      const send = ctx.createGain();
      send.gain.value = reverb;
      gainNode.connect(send);
      send.connect(reverbSend);
    }

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    osc.connect(filter);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);

    if (shimmer) {
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(0, t0);
      shimmerGain.gain.linearRampToValueAtTime(gain * 0.22, t0 + 0.02);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0006, t0 + duration * 0.85);
      shimmerGain.connect(input);

      const shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(freq * 2.003, t0);
      shimmerOsc.connect(shimmerGain);
      shimmerOsc.start(t0);
      shimmerOsc.stop(t0 + duration + 0.03);
    }
  });
}

// Short filtered noise burst — the soft "tap" sound modern app UIs use instead
// of a retro square-wave beep for taps/clicks.
function playTap({ start = 0, freq = 2200, duration = 0.05, gain = 0.05 } = {}) {
  if (isMuted()) return;
  const ctx = getSharedContext();
  if (!ctx) return;
  const { input } = getMasterChain(ctx);
  const now = ctx.currentTime;
  const t0 = now + start;

  const bufferSize = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = freq;
  bandpass.Q.value = 1.1;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain, t0);
  gainNode.gain.exponentialRampToValueAtTime(0.0005, t0 + duration);

  noise.connect(bandpass);
  bandpass.connect(gainNode);
  gainNode.connect(input);
  noise.start(t0);
  noise.stop(t0 + duration + 0.01);
}

export function playClick() {
  playTap({ freq: 2400, duration: 0.045, gain: 0.05 });
  hapticLight();
}

export function playCorrect() {
  // Warm major triad arpeggio, like a soft marimba/bell pluck.
  playNotes([
    { freq: 523.25, start: 0, duration: 0.16, type: "triangle", shimmer: true, reverb: 0.1 },
    { freq: 659.25, start: 0.07, duration: 0.18, type: "triangle", shimmer: true, reverb: 0.12 },
    { freq: 783.99, start: 0.14, duration: 0.3, type: "triangle", shimmer: true, gain: 0.18, reverb: 0.16 },
  ]);
  hapticSuccess();
}

export function playWrong() {
  // A soft, muted low thud rather than a harsh sawtooth buzz.
  playNotes([
    { freq: 196, start: 0, duration: 0.22, type: "sine", glideTo: 130, gain: 0.16, reverb: 0.04 },
  ]);
  playTap({ start: 0.01, freq: 400, duration: 0.09, gain: 0.045 });
  hapticError();
}

export function playTimeout() {
  playNotes([
    { freq: 349.23, start: 0, duration: 0.14, type: "triangle", gain: 0.12, reverb: 0.06 },
    { freq: 261.63, start: 0.13, duration: 0.22, type: "triangle", gain: 0.12, reverb: 0.06 },
  ]);
  hapticError();
}

export function playCombo() {
  // Quick ascending sparkle with a shimmering top end.
  playNotes([
    { freq: 659.25, start: 0, duration: 0.13, type: "sine", shimmer: true, reverb: 0.14 },
    { freq: 830.61, start: 0.07, duration: 0.13, type: "sine", shimmer: true, reverb: 0.16 },
    { freq: 1046.5, start: 0.14, duration: 0.16, type: "sine", shimmer: true, gain: 0.14, reverb: 0.2 },
    { freq: 1318.5, start: 0.21, duration: 0.24, type: "sine", shimmer: true, gain: 0.12, reverb: 0.24 },
  ]);
  hapticMedium();
}

export function playVictory() {
  // A short chord swell followed by a bright arpeggio — a fuller, warmer
  // fanfare than a bare four-note chiptune run.
  playNotes([
    { freq: 261.63, start: 0, duration: 0.5, type: "triangle", gain: 0.1, reverb: 0.18 },
    { freq: 329.63, start: 0, duration: 0.5, type: "triangle", gain: 0.09, reverb: 0.18 },
    { freq: 392.0, start: 0, duration: 0.5, type: "triangle", gain: 0.09, reverb: 0.18 },
    { freq: 523.25, start: 0.18, duration: 0.16, type: "sine", shimmer: true, reverb: 0.2 },
    { freq: 659.25, start: 0.32, duration: 0.16, type: "sine", shimmer: true, reverb: 0.22 },
    { freq: 783.99, start: 0.46, duration: 0.18, type: "sine", shimmer: true, reverb: 0.24 },
    { freq: 1046.5, start: 0.6, duration: 0.4, type: "sine", shimmer: true, gain: 0.16, reverb: 0.3 },
  ]);
  hapticSuccess();
}

export function playToast() {
  playNotes([{ freq: 987.77, start: 0, duration: 0.12, type: "sine", gain: 0.1, shimmer: true, reverb: 0.14 }]);
}
