import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { questionPool } from "../data/questions";
import SpeakButton from "./SpeakButton";
import { playClick } from "../utils/sound";
import {
  isRecordingSupported,
  startRecording,
  type ActiveRecording,
  type RecordingStats,
} from "../utils/recording";

const ROUND_SIZE = 8;

// Kaydını dinlerken bakılacak öz-değerlendirme maddeleri — biz hiçbir otomatik
// yargı vermiyoruz, kullanıcı kendi kaydını bu sorularla kendi değerlendiriyor.
const SELF_CHECK_ITEMS = [
  "Somut bir örnek ya da deneyim verdin mi?",
  "Sonucu ya da öğrendiğini net söyledin mi?",
  "Çok uzatmadan, toparlayarak bitirdin mi?",
  "'Şey', 'yani', 'ıı' gibi dolgu kelimeleri azaltabildin mi?",
];

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1).replace(".0", "");
}
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
type RecordPhase = "idle" | "requesting" | "recording" | "recorded";

export default function SpeakingPracticeMode({ onExit }: { onExit: () => void }) {
  const [prompts] = useState<string[]>(buildPrompts);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [recordPhase, setRecordPhase] = useState<RecordPhase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<RecordingStats | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => SELF_CHECK_ITEMS.map(() => false));
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
    setStats(null);
    setChecked(SELF_CHECK_ITEMS.map(() => false));
  };

  useEffect(() => {
    return () => {
      clearTimer();
      recordingRef.current?.stop();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maksimum kayıt süresine ulaşınca otomatik durdur — setInterval'ın
  // callback'i içinde doğrudan çağırmak yerine ayrı bir effect'te tutmak,
  // state updater'ların içine yan etki sızdırmaktan kaçınıyor (bkz.
  // TermGlobeMode'daki aynı desenin daha önce yol açtığı React uyarısı).
  useEffect(() => {
    if (recordPhase === "recording" && seconds >= MAX_RECORDING_SECONDS) {
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, recordPhase]);

  const handleStartRecording = async () => {
    // İzin diyaloğu ekranda beklerken buton hâlâ "idle" görünüp tekrar
    // tıklanabilir olurdu — hızlı çift tıklama iki ayrı mikrofon akışı açıp
    // birini sızdırabilirdi. "requesting" ara durumu bunu engelliyor.
    if (recordPhase === "requesting") return;
    playClick();
    setMicError(null);
    discardAudio();
    setRecordPhase("requesting");
    try {
      recordingRef.current = await startRecording();
    } catch {
      setRecordPhase("idle");
      setMicError("Mikrofona erişilemedi — tarayıcı/uygulama izni reddetmiş olabilir.");
      return;
    }
    setSeconds(0);
    setRecordPhase("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const handleStopRecording = async () => {
    playClick();
    clearTimer();
    const active = recordingRef.current;
    recordingRef.current = null;
    if (!active) return;
    const { blob, stats: recordingStats } = await active.stop();
    setAudioUrl(URL.createObjectURL(blob));
    setStats(recordingStats);
    setRecordPhase("recorded");
  };

  const toggleCheck = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
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
          <SpeakButton
            text={prompt}
            className="speech-bubble-speak"
            disabled={recordPhase === "recording" || recordPhase === "requesting"}
          />
        </div>

        {micError && <p className="feedback-timeout">{micError}</p>}

        {(recordPhase === "idle" || recordPhase === "requesting") && (
          <button
            className="btn btn-primary btn-glow"
            onClick={handleStartRecording}
            disabled={recordPhase === "requesting"}
          >
            {recordPhase === "requesting" ? "Mikrofon isteniyor…" : "🎙️ Kaydı Başlat"}
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

            {stats && (
              <p className="record-stats">
                {formatSeconds(stats.durationMs)}sn konuştun
                {stats.pauseAnalysis &&
                  (stats.pauseAnalysis.silenceCount > 0
                    ? ` · ${stats.pauseAnalysis.silenceCount} kez duraksadın (en uzunu ${formatSeconds(stats.pauseAnalysis.longestSilenceMs)}sn)`
                    : " · göze çarpan bir duraksama yok")}
              </p>
            )}

            <div className="self-check">
              <p className="self-check-title">Dinlerken kendine sor:</p>
              {SELF_CHECK_ITEMS.map((item, i) => (
                <label className="self-check-item" key={item}>
                  <input type="checkbox" checked={checked[i]} onChange={() => toggleCheck(i)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>

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
