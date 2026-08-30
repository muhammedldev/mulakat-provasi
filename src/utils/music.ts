import { getSharedContext, getMasterChain } from "./sound";

const MUSIC_KEY = "mulakat-provasi-music-enabled";
const CYCLE_SECONDS = 16;
const FADE_SECONDS = 1.2;

// A calm-but-not-sleepy four-chord loop (Am7 → Fmaj7 → Cmaj7 → Gsus4) — warm
// and a little wistful without being sad, corporate-appropriate rather than
// game-arcade. Frequencies in Hz, one octave layer per chord tone.
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
  [196.0, 246.94, 293.66, 392.0], // Gsus4
];

// A quarter-note walking-bass shape (root–fifth–third–fifth), one octave
// above the pad — deliberately NOT a symmetric up/down run, which is what
// reads as a cutesy toy-piano bounce. Paired with a light swing (odd steps
// nudged later) for a lo-fi/chill groove instead of a mechanical beat.
const ARPEGGIO_PATTERN = [0, 2, 1, 2];
const SWING_RATIO = 0.16; // fraction of a step's duration to delay odd steps by

// A sparse, two-note melodic fragment (one octave above the pad, not two —
// keeping it in a mid register instead of a thin music-box register) played
// on every OTHER chord only. Leaving space on the chords in between reads as
// a deliberate, moody phrase rather than a chirpy repeating jingle. Values
// are chord-tone indices, so it's always diatonic to whatever chord is
// playing and can never clash.
const MELODY_PATTERN = [2, 0];

let musicGain: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let playing = false;
let generation = 0;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function getBus(context: AudioContext): { gain: GainNode; filter: BiquadFilterNode; reverbSend: GainNode } {
  const { input, reverbSend } = getMasterChain(context);
  if (!musicGain || !filterNode) {
    filterNode = context.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.value = 1900;
    filterNode.Q.value = 0.4;

    musicGain = context.createGain();
    musicGain.gain.value = 0;

    filterNode.connect(musicGain);
    musicGain.connect(input);
  }
  return { gain: musicGain, filter: filterNode, reverbSend };
}

export function isMusicEnabled(): boolean {
  try {
    return localStorage.getItem(MUSIC_KEY) === "1";
  } catch {
    return false;
  }
}

function persistEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MUSIC_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function playShimmerNote(
  context: AudioContext,
  filter: BiquadFilterNode,
  reverbSend: GainNode,
  opts: {
    freq: number;
    startTime: number;
    duration: number;
    attack: number;
    release: number;
    peak: number;
    type: OscillatorType;
    reverb: number;
    shimmerAmount?: number;
  }
) {
  const { freq, startTime, duration, attack, release, peak, type, reverb, shimmerAmount = 0.25 } = opts;
  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(peak, startTime + attack);
  if (duration - release > attack) {
    gainNode.gain.setValueAtTime(peak, startTime + duration - release);
  }
  gainNode.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);
  gainNode.connect(filter);

  if (reverb > 0) {
    const send = context.createGain();
    send.gain.value = reverb;
    gainNode.connect(send);
    send.connect(reverbSend);
  }

  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.connect(gainNode);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  // The same octave-up shimmer partial used by the game's own SFX (see
  // playCorrect/playCombo in sound.ts) — this is what ties the music's
  // timbre to the rest of the app's sound instead of feeling like a
  // separate, bolted-on audio source.
  if (shimmerAmount <= 0) return;
  const shimmerGain = context.createGain();
  shimmerGain.gain.setValueAtTime(0, startTime);
  shimmerGain.gain.linearRampToValueAtTime(peak * shimmerAmount, startTime + attack * 0.6);
  shimmerGain.gain.exponentialRampToValueAtTime(0.0006, startTime + duration * 0.85);
  shimmerGain.connect(filter);

  const shimmerOsc = context.createOscillator();
  shimmerOsc.type = "sine";
  shimmerOsc.frequency.setValueAtTime(freq * 2.003, startTime);
  shimmerOsc.connect(shimmerGain);
  shimmerOsc.start(startTime);
  shimmerOsc.stop(startTime + duration + 0.05);
}

function playPadChord(context: AudioContext, filter: BiquadFilterNode, reverbSend: GainNode, freqs: number[], startTime: number, duration: number) {
  freqs.forEach((freq) => {
    // Sine throughout — a triangle wave's extra odd harmonics read as a
    // recorder/kazoo tone, which is a big part of what pushes a synth pad
    // toward "kids' app" territory. Plain sine reads as a mellow Rhodes/pad
    // instead, which sits better with a young-adult/corporate audience.
    playShimmerNote(context, filter, reverbSend, {
      freq,
      startTime,
      duration,
      attack: 0.8,
      release: 0.9,
      peak: 0.05 / Math.sqrt(freqs.length),
      type: "sine",
      reverb: 0.1,
      shimmerAmount: 0.16,
    });
  });
}

// Percussive, short-envelope notes — the "instrumental" layer (bass pulse,
// arpeggio, melody hook) that gives the loop actual rhythm and movement
// instead of only slow harmonic pads. Sine-based (see note above) with only
// a faint shimmer, so it reads as a soft mallet/Rhodes pluck rather than a
// bright toy xylophone twinkle.
function playPluck(context: AudioContext, filter: BiquadFilterNode, reverbSend: GainNode, freq: number, startTime: number, velocity: number, duration: number, reverb: number) {
  playShimmerNote(context, filter, reverbSend, {
    freq,
    startTime,
    duration,
    attack: 0.012,
    release: duration * 0.6,
    peak: 0.05 * velocity,
    type: "sine",
    reverb,
    shimmerAmount: 0.14,
  });
}

function scheduleCycle(context: AudioContext, filter: BiquadFilterNode, reverbSend: GainNode, cycleStart: number, myGeneration: number) {
  const chordDuration = CYCLE_SECONDS / CHORDS.length;

  CHORDS.forEach((chord, chordIndex) => {
    const chordStart = cycleStart + chordIndex * chordDuration;
    playPadChord(context, filter, reverbSend, chord, chordStart, chordDuration + 0.3);

    // Rhythm section: a quarter-note walking-bass shape, one octave up, with
    // a light swing (odd steps nudged later) for a chill/lo-fi groove rather
    // than a mechanical, bouncy beat.
    const stepDuration = chordDuration / ARPEGGIO_PATTERN.length;
    ARPEGGIO_PATTERN.forEach((toneIndex, step) => {
      const swingOffset = step % 2 === 1 ? stepDuration * SWING_RATIO : 0;
      const velocity = step === 0 ? 0.95 : 0.65;
      playPluck(
        context,
        filter,
        reverbSend,
        chord[toneIndex] * 2,
        chordStart + step * stepDuration + swingOffset,
        velocity,
        stepDuration * 0.85,
        0.08
      );
    });

    // The melodic fragment only plays on every other chord, leaving the rest
    // open — a couple of spaced-out notes reads as a moody phrase, whereas a
    // busy line repeated on every single chord reads as a chirpy jingle.
    if (chordIndex % 2 === 1) {
      const melodyStep = chordDuration / MELODY_PATTERN.length;
      MELODY_PATTERN.forEach((toneIndex, step) => {
        playPluck(context, filter, reverbSend, chord[toneIndex] * 2, chordStart + step * melodyStep, 0.5, melodyStep * 0.8, 0.18);
      });
    }
  });

  const nextCycleStart = cycleStart + CYCLE_SECONDS;
  const msUntilNext = (nextCycleStart - context.currentTime - 1) * 1000;
  pendingTimer = setTimeout(
    () => {
      if (generation !== myGeneration) return;

      // A backgrounded/throttled tab can suspend the AudioContext or delay this
      // timer well past its target time. Scheduling a fresh cycle in either case
      // without a guard would (a) pile up nodes that never audibly play while
      // suspended, or (b) fire a burst of overdue cycles back-to-back while
      // catching up. Instead: while suspended, just retry resuming periodically
      // without creating any notes; once running again (or if only mildly
      // delayed), resync to "now" rather than the stale scheduled time.
      if (context.state !== "running") {
        void context.resume();
        pendingTimer = setTimeout(() => {
          if (generation !== myGeneration) return;
          scheduleCycle(context, filter, reverbSend, context.currentTime + 0.1, myGeneration);
        }, 2000);
        return;
      }

      const start = nextCycleStart < context.currentTime ? context.currentTime + 0.1 : nextCycleStart;
      scheduleCycle(context, filter, reverbSend, start, myGeneration);
    },
    Math.max(0, msUntilNext)
  );
}

export function startMusic(): void {
  if (playing) return;
  const context = getSharedContext();
  if (!context) return;
  const { gain, filter, reverbSend } = getBus(context);

  playing = true;
  generation += 1;
  const myGeneration = generation;

  gain.gain.cancelScheduledValues(context.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, context.currentTime);
  gain.gain.linearRampToValueAtTime(1, context.currentTime + FADE_SECONDS);

  scheduleCycle(context, filter, reverbSend, context.currentTime + 0.1, myGeneration);
}

export function stopMusic(): void {
  playing = false;
  generation += 1;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  const context = getSharedContext();
  if (context && musicGain) {
    musicGain.gain.cancelScheduledValues(context.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, context.currentTime);
    musicGain.gain.linearRampToValueAtTime(0, context.currentTime + FADE_SECONDS);
  }
}

export function setMusicEnabled(enabled: boolean): void {
  persistEnabled(enabled);
  if (enabled) startMusic();
  else stopMusic();
}
