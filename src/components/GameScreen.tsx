import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AnswerOption, Difficulty, Interviewer, Mood, Question, QuestionType, Stats, StatDelta } from "../types";
import StatBars from "./StatBars";
import ProgressBar from "./ProgressBar";
import TimerBar from "./TimerBar";
import SparkleBurst from "./SparkleBurst";
import SpeakButton from "./SpeakButton";
import InterviewerCharacter from "./InterviewerCharacter";
import Tilt3D from "./Tilt3D";
import { statLabels } from "../data/profiles";
import { playClick, playCombo, playCorrect, playTimeout, playWrong } from "../utils/sound";
import { tryUnlock } from "../data/achievements";
import { clearMistake, recordMistake } from "../utils/mistakes";

interface GameScreenProps {
  question: Question;
  interviewer: Interviewer;
  questionIndex: number;
  totalQuestions: number;
  stats: Stats;
  phase: "question" | "feedback";
  lastOption: AnswerOption | null;
  streak: number;
  comboBonusApplied: boolean;
  timedOut: boolean;
  onAnswer: (option: AnswerOption) => void;
  onTimeout: () => void;
  onContinue: () => void;
  onAchievement: (text: string) => void;
}

const difficultyMeta: Record<Difficulty, { label: string; icon: string }> = {
  kolay: { label: "Kolay", icon: "🟢" },
  orta: { label: "Orta", icon: "🟡" },
  zor: { label: "Zor", icon: "🔴" },
  efsane: { label: "Efsane", icon: "🟣" },
};

const typeMeta: Record<QuestionType, { label: string; icon: string }> = {
  teorik: { label: "Teorik", icon: "📘" },
  uygulama: { label: "Uygulama", icon: "🧩" },
};

function DeltaChips({ deltas }: { deltas: StatDelta }) {
  const entries = Object.entries(deltas) as [keyof Stats, number][];
  return (
    <div className="delta-chips">
      {entries.map(([key, value]) => (
        <span key={key} className={`delta-chip ${value >= 0 ? "delta-chip--up" : "delta-chip--down"}`}>
          {value >= 0 ? "+" : ""}
          {value} {statLabels[key]}
        </span>
      ))}
    </div>
  );
}

export default function GameScreen({
  question,
  interviewer,
  questionIndex,
  totalQuestions,
  stats,
  phase,
  lastOption,
  streak,
  comboBonusApplied,
  timedOut,
  onAnswer,
  onTimeout,
  onContinue,
  onAchievement,
}: GameScreenProps) {
  const mood: Mood =
    phase === "question" ? "neutral" : timedOut ? "timeout" : lastOption?.isBest ? "positive" : "negative";
  const diff = difficultyMeta[question.difficulty];
  const typeInfo = typeMeta[question.type];
  const questionStartRef = useRef(Date.now());
  const [wasFast, setWasFast] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setPaused(false);
  }, [question.id]);

  useEffect(() => {
    if (phase !== "feedback") return;
    if (timedOut) {
      playTimeout();
      recordMistake(question.id);
    } else if (lastOption?.isBest) {
      playCorrect();
      clearMistake(question.id);
    } else {
      playWrong();
      recordMistake(question.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, phase]);

  useEffect(() => {
    if (phase === "feedback" && comboBonusApplied) {
      playCombo();
      onAchievement(`🔥 Kombo! Art arda ${streak} doğru cevap`);
      tryUnlock("kombo-avcisi", onAchievement);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, phase, comboBonusApplied]);

  useEffect(() => {
    const halfway = Math.floor(totalQuestions / 2);
    if (phase === "question" && questionIndex === halfway) {
      onAchievement("🏁 Yarı yoldasın, böyle devam!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, phase]);

  const handleAnswerClick = (option: AnswerOption) => {
    playClick();
    const elapsedMs = Date.now() - questionStartRef.current;
    const isFast = Boolean(option.isBest) && elapsedMs < question.timeLimit * 1000 * 0.5;
    setWasFast(isFast);
    if (isFast) tryUnlock("hizli-parmaklar", onAchievement);
    if (option.isBest && question.difficulty === "efsane") tryUnlock("efsane-avcisi", onAchievement);
    onAnswer(option);
  };

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (paused) return;
      if (phase === "question") {
        const num = Number(e.key);
        if (num >= 1 && num <= question.options.length) {
          handleAnswerClick(question.options[num - 1]);
        }
      } else if (phase === "feedback" && e.key === "Enter") {
        // The "Devam Et" button is autoFocus'd, so without this the native
        // Enter-activates-focused-button behavior would ALSO fire its onClick,
        // double-advancing the question.
        e.preventDefault();
        playClick();
        onContinue();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question, paused]);

  const togglePause = () => {
    playClick();
    setPaused((p) => !p);
  };

  return (
    <div className="screen game-screen">
      <div className="hud-panel">
        <ProgressBar current={questionIndex} total={totalQuestions} />
        <div className="stats-row">
          <StatBars stats={stats} compact />
          {streak >= 2 && (
            <motion.span
              key={streak}
              className="streak-chip"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              🔥 x{streak}
            </motion.span>
          )}
        </div>
      </div>

      <div className="game-play-layout">
        <motion.div
          key={question.id}
          className="scene-card game-play-main"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="scene-top-row">
            <p className="scene-text">{question.scene}</p>
            <div className="pill-group">
              <span className={`type-pill type-pill--${question.type}`}>
                {typeInfo.icon} {typeInfo.label}
              </span>
              <span className={`difficulty-pill difficulty-pill--${question.difficulty}`}>
                {diff.icon} {diff.label}
              </span>
            </div>
          </div>

          {phase === "question" && (
            <div className="timer-row">
              <TimerBar questionId={question.id} seconds={question.timeLimit} onExpire={onTimeout} paused={paused} />
              <button className="pause-button" onClick={togglePause} aria-label={paused ? "Devam et" : "Duraklat"}>
                {paused ? "▶️" : "⏸️"}
              </button>
            </div>
          )}

          <div className="speech-bubble">
            <span className="speech-bubble-tail" />
            <p>{question.interviewerLine}</p>
            <SpeakButton text={question.interviewerLine} className="speech-bubble-speak" />
          </div>

          {phase === "question" && paused && (
            <div className="paused-overlay">
              <p>⏸️ Duraklatıldı</p>
              <button className="btn btn-primary" onClick={togglePause}>
                Devam Et
              </button>
            </div>
          )}

          {phase === "question" && !paused && (
            <div className="options-list">
              {question.options.map((option, i) => (
                <motion.button
                  key={option.id}
                  className="option-btn"
                  onClick={() => handleAnswerClick(option)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.3 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-index">{i + 1}</span>
                  {option.text}
                </motion.button>
              ))}
            </div>
          )}

          {phase === "feedback" && lastOption && (
            <motion.div
              className={`feedback-panel ${lastOption.isBest ? "feedback-panel--best" : "shake-on-wrong"}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {lastOption.isBest && <SparkleBurst />}
              {timedOut && <p className="feedback-timeout">⏰ Süre doldu! Otomatik bir seçim yapıldı.</p>}
              {wasFast && !timedOut && <p className="feedback-fast">⚡ Hızlı ve doğru!</p>}
              {!timedOut && (
                <p className="feedback-chosen">
                  Seçimin: <em>{lastOption.text}</em>
                </p>
              )}
              <DeltaChips deltas={lastOption.deltas} />
              <p className="feedback-text">
                {lastOption.isBest ? "✅ " : "💡 "}
                {lastOption.feedback}
              </p>
              {comboBonusApplied && (
                <motion.p
                  className="combo-banner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 220 }}
                >
                  🔥 Kombo! Art arda {streak} isabetli cevap — tüm istatistiklere bonus.
                </motion.p>
              )}
              <button
                className="btn btn-primary"
                onClick={() => {
                  playClick();
                  onContinue();
                }}
                autoFocus
              >
                Devam Et
              </button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="interview-room game-play-side"
          style={{ borderColor: interviewer.color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tilt3D className="interview-room-tilt">
            <InterviewerCharacter interviewer={interviewer} mood={mood} />
          </Tilt3D>
          <p className="interview-room-caption" style={{ color: interviewer.color }}>
            {interviewer.name} · {interviewer.title}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
