import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { questionPool } from "../data/questions";
import SpeakButton from "./SpeakButton";
import { playClick } from "../utils/sound";
import { isRecordingSupported, startRecording, type ActiveRecording } from "../utils/recording";

const ROUND_SIZE = 8;
// TTS ile dinlerken ya da kayıt yaparken can sıkıcı olmasın diye, bu moda
// sadece kısa/tek cümlelik soruları alıyoruz (havuzdaki 92 sorunun ortalaması
// zaten ~87 karakter, bu eşik neredeyse hepsini kapsıyor, en uzun birkaç
// tanesini eliyor).
const MAX_PROMPT_LENGTH = 150;
const MAX_RECORDING_SECONDS = 90;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPrompts(): string[] {
  const eligible = questionPool.filter((q) => q.interviewerLine.length <= MAX_PROMPT_LENGTH);
  return shuffle(eligible).slice(0, ROUND_SIZE).map((q) => q.interviewerLine);
}

type Phase = "intro" | "practice" | "result";
type RecordPhase = "idle" | "recording" | "recorded";

export default function SpeakingPracticeMode({ onExit }: { onExit: () => void }) {
  const [prompts] = useState<string[]>(buildPrompts);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [recordPhase, setRecordPhase] = useState<RecordPhase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recordingRef = useRef<ActiveRecording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supported = isRecordingSupported();

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const discardAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  useEffect(() => {
    return () => {
      clearTimer();
      recordingRef.current?.stop();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartRecording = async () => {
    playClick();
    setMicError(null);
    discardAudio();
    try {
      recordingRef.current = await startRecording();
    } catch {
      setMicError("Mikrofona erişilemedi — tarayıcı/uygulama izni reddetmiş olabilir.");
      return;
    }
    setSeconds(0);
    setRecordPhase("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_RECORDING_SECONDS) {
          handleStopRecording();
          return s;
        }
        return s + 1;
      });
    }, 1000);
  };

  const handleStopRecording = async () => {
    playClick();
    clearTimer();
    const active = recordingRef.current;
    recordingRef.current = null;
    if (!active) return;
    const blob = await active.stop();
    setAudioUrl(URL.createObjectURL(blob));
    setRecordPhase("recorded");
  };

  const handleNext = () => {
    playClick();
    discardAudio();
    setRecordPhase("idle");
    setSeconds(0);
    const nextIndex = index + 1;
    if (nextIndex >= prompts.length) {
      setPhase("result");
    } else {
      setIndex(nextIndex);
    }
  };

  if (phase === "intro") {
    return (
      <motion.div
        className="screen term-mode-screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="intro-badge">🎙️ Konuşma Pratiği</div>
        <h1>Sesini duy, kendini dinle</h1>
        <p className="intro-text">
          {prompts.length} mülakat sorusu art arda geliyor. Her sorunun cevabını sesli söyleyip
          kaydediyorsun, sonra kendi kaydını dinliyorsun. Puan yok, doğru cevap yok — amaç kendi
          sesini, tonunu ve akıcılığını duymak.
        </p>
        {!supported && (
          <p className="feedback-timeout">
            Bu cihaz/tarayıcı mikrofon kaydını desteklemiyor gibi görünüyor, bu modu kullanamazsın.
          </p>
        )}
        <button
          className="btn btn-primary btn-glow"
          disabled={!supported}
          onClick={() => {
            playClick();
            setPhase("practice");
          }}
        >
          Başla
        </button>
        <button className="btn btn-secondary menu-back-btn" onClick={onExit}>
          ← Ana Menü
        </button>
      </motion.div>
    );
  }

  if (phase === "result") {
    return (
      <motion.div
        className="screen term-mode-screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-emoji">🎙️</div>
        <h1>{prompts.length} soruyu tamamladın</h1>
        <p className="intro-text">
          Kendi sesini dinlemek başlı başına iyi bir alışkanlık — düzenli tekrar ettikçe akıcılığın
          da artar.
        </p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onExit}>
            Ana Menüye Dön
          </button>
        </div>
      </motion.div>
    );
  }

  const prompt = prompts[index];

  return (
    <div className="screen">
      <div className="hud-panel term-hud">
        <span>
          Soru {index + 1}/{prompts.length}
        </span>
      </div>

      <motion.div
        key={index}
        className="scene-card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="speech-bubble">
          <span className="speech-bubble-tail" />
          <p>{prompt}</p>
          <SpeakButton text={prompt} className="speech-bubble-speak" />
        </div>

        {micError && <p className="feedback-timeout">{micError}</p>}

        {recordPhase === "idle" && (
          <button className="btn btn-primary btn-glow" onClick={handleStartRecording}>
            🎙️ Kaydı Başlat
          </button>
        )}

        {recordPhase === "recording" && (
          <div className="record-active">
            <button className="record-btn record-btn--active" onClick={handleStopRecording}>
              ⏹
            </button>
            <p className="record-timer">{seconds}s</p>
            <button className="btn btn-secondary" onClick={handleStopRecording}>
              Durdur
            </button>
          </div>
        )}

        {recordPhase === "recorded" && audioUrl && (
          <motion.div
            className="feedback-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="feedback-text">🔁 Kaydını dinle:</p>
            <audio controls src={audioUrl} className="record-playback" />
            <div className="result-actions">
              <button className="btn btn-secondary" onClick={handleStartRecording}>
                Tekrar Kaydet
              </button>
              <button className="btn btn-primary" onClick={handleNext} autoFocus>
                {index + 1 >= prompts.length ? "Bitir" : "Sıradaki Soru"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
