import { useState } from "react";
import { motion } from "framer-motion";
import { buildRapidQuestions, type RapidCategory, type RapidOption, type RapidQuestion } from "../data/rapidQuestions";
import type { Difficulty, SectorId } from "../types";
import TimerBar from "./TimerBar";
import SparkleBurst from "./SparkleBurst";
import SpeakButton from "./SpeakButton";
import { playClick, playCombo, playCorrect, playTimeout, playVictory, playWrong } from "../utils/sound";
import { addXP, incrementGamesPlayed, recordDailyPlay } from "../utils/storage";
import { tryUnlock, tryUnlockProgressBased } from "../data/achievements";
import { clearMistake, recordMistake } from "../utils/mistakes";
import { recordCategoryResult } from "../utils/insights";
import { splitPromptEmphasis } from "../utils/text";

type Phase = "intro" | "question" | "feedback" | "result";

const categoryMeta: Record<RapidCategory, { label: string; icon: string }> = {
  uygulama: { label: "Uygulama", icon: "🧩" },
  teorik: { label: "Teorik", icon: "📘" },
  vaka: { label: "Vaka Analizi", icon: "🗂️" },
  psikoloji: { label: "Öz-Yönetim", icon: "🧠" },
};

const difficultyMeta: Record<Difficulty, { label: string; icon: string }> = {
  kolay: { label: "Kolay", icon: "🟢" },
  orta: { label: "Orta", icon: "🟡" },
  zor: { label: "Zor", icon: "🔴" },
  efsane: { label: "Efsane", icon: "🟣" },
};

const START_TIME = 15;
const MIN_TIME = 7;

function timeLimitFor(index: number): number {
  return Math.max(MIN_TIME, START_TIME - index);
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function resultProfile(accuracy: number, composure: number) {
  if (accuracy >= 70 && composure >= 70) {
    return { emoji: "🧊", title: "Sakin Kaptan", desc: "Baskı arttıkça sen de netleştin, hem doğru hem sakin kaldın. Gerçek bir mülakatta aranan tam bu." };
  }
  if (accuracy >= 70 && composure < 70) {
    return { emoji: "⚡", title: "Performans Canavarı ama Gergin", desc: "Cevapları buluyorsun ama süreç seni geriyor. Cevaplamadan önce bir nefes alman işe yarayabilir." };
  }
  if (accuracy < 70 && composure >= 70) {
    return { emoji: "🌊", title: "Sakin ama Temkinli", desc: "Baskı seni hiç bozmuyor, bu iyi bir şey. Şimdi sırada bu sakinliği daha isabetli kararlarla birleştirmek var." };
  }
  return { emoji: "🌱", title: "Toparlanma Zamanı", desc: "Bu tur zorlayıcıydı, olur böyle şeyler. Kısa bir mola sonrası tekrar dene." };
}

export default function RapidInterviewMode({
  sector,
  onExit,
  onAchievement,
}: {
  sector?: SectorId;
  onExit: () => void;
  onAchievement: (text: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions] = useState<RapidQuestion[]>(() => buildRapidQuestions(sector));
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [composure, setComposure] = useState(100);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState<RapidOption | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const question = questions[index];

  const start = () => {
    playClick();
    setPhase("question");
  };

  const finishGame = () => {
    playVictory();
    addXP(correctCount * 15);
    recordDailyPlay();
    incrementGamesPlayed();
    const accuracy = Math.round((correctCount / questions.length) * 100);
    if (accuracy >= 70 && composure >= 70) tryUnlock("sakin-kaptan", onAchievement);
    tryUnlockProgressBased(onAchievement);
    setPhase("result");
  };

  const handleAnswer = (option: RapidOption) => {
    playClick();
    setSelected(option);
    setTimedOut(false);
    if (option.isBest) {
      setCorrectCount((c) => c + 1);
      setComposure((c) => clamp(c + 3));
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak % 3 === 0) playCombo();
      else playCorrect();
      clearMistake(question.id);
      recordCategoryResult(question.category, true);
      if (question.difficulty === "efsane") tryUnlock("efsane-avcisi", onAchievement);
    } else {
      setComposure((c) => clamp(c - 12));
      setStreak(0);
      playWrong();
      recordMistake(question.id);
      recordCategoryResult(question.category, false);
    }
    setPhase("feedback");
  };

  const handleTimeout = () => {
    setSelected(null);
    setTimedOut(true);
    setComposure((c) => clamp(c - 18));
    setStreak(0);
    playTimeout();
    recordMistake(question.id);
    recordCategoryResult(question.category, false);
    setPhase("feedback");
  };

  const handleContinue = () => {
    playClick();
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      finishGame();
    } else {
      setIndex(nextIndex);
      setSelected(null);
      setTimedOut(false);
      setPhase("question");
    }
  };

  if (phase === "intro") {
    return (
      <motion.div
        className="screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="intro-badge">⚡ Seri Mülakat</div>
        <h1>Baskı Altında Performans</h1>
        <p className="intro-text">
          {questions.length} karışık soru seni bekliyor: uygulama, teorik, vaka analizi ve
          öz-yönetim (durumsal yargı) soruları art arda geliyor. Her sorunun süresi bir öncekinden
          biraz daha kısa, ama {MIN_TIME} saniyenin altına inmiyor. Amaç mükemmel olmak değil,
          baskı büyüdükçe kendini kaybetmemek.
        </p>
        <button className="btn btn-primary btn-glow" onClick={start}>
          Başla
        </button>
        <button className="btn btn-secondary menu-back-btn" onClick={onExit}>
          ← Ana Menü
        </button>
      </motion.div>
    );
  }

  if (phase === "result") {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const profile = resultProfile(accuracy, composure);
    return (
      <motion.div
        className="screen"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-emoji">{profile.emoji}</div>
        <h1>{profile.title}</h1>
        <p className="intro-text">{profile.desc}</p>

        <div className="rapid-result-grid">
          <div className="rapid-result-stat">
            <span className="rapid-result-value">{correctCount}/{questions.length}</span>
            <span className="rapid-result-label">Doğru Cevap</span>
          </div>
          <div className="rapid-result-stat">
            <span className="rapid-result-value">%{accuracy}</span>
            <span className="rapid-result-label">Doğruluk</span>
          </div>
          <div className="rapid-result-stat">
            <span className="rapid-result-value">{composure}</span>
            <span className="rapid-result-label">Sakinlik</span>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn btn-primary" onClick={onExit}>
            Ana Menüye Dön
          </button>
        </div>
      </motion.div>
    );
  }

  const meta = categoryMeta[question.category];

  return (
    <div className="screen">
      <div className="hud-panel rapid-hud">
        <div className="rapid-hud-row">
          <span>Soru {index + 1}/{questions.length}</span>
          <div className="pill-group">
            <span className={`type-pill type-pill--${question.category}`}>
              {meta.icon} {meta.label}
            </span>
            <span className={`difficulty-pill difficulty-pill--${question.difficulty}`}>
              {difficultyMeta[question.difficulty].icon} {difficultyMeta[question.difficulty].label}
            </span>
          </div>
        </div>
        <div className="rapid-composure-track">
          <motion.div
            className="rapid-composure-fill"
            animate={{ width: `${composure}%` }}
            transition={{ type: "spring", stiffness: 120 }}
          />
        </div>
        <span className="rapid-composure-label">Sakinlik: {composure}</span>
      </div>

      <motion.div
        key={question.id}
        className="scene-card"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {phase === "question" && (
          <TimerBar questionId={question.id} seconds={timeLimitFor(index)} onExpire={handleTimeout} />
        )}

        {(() => {
          const { context, question: q } = splitPromptEmphasis(question.prompt);
          return (
            <>
              {context && <p className="scene-text">{context}</p>}
              <div className="speech-bubble">
                <span className="speech-bubble-tail" />
                <p>{q}</p>
                <SpeakButton text={question.prompt} className="speech-bubble-speak" />
              </div>
            </>
          );
        })()}

        {phase === "question" && (
          <div className="options-list">
            {question.options.map((opt, i) => (
              <motion.button
                key={i}
                className="option-btn"
                onClick={() => handleAnswer(opt)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="option-index">{i + 1}</span>
                {opt.text}
              </motion.button>
            ))}
          </div>
        )}

        {phase === "feedback" && (
          <motion.div
            className={`feedback-panel${!timedOut && selected?.isBest ? "" : " shake-on-wrong"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!timedOut && selected?.isBest && <SparkleBurst />}
            {timedOut && <p className="feedback-timeout">⏰ Süre doldu! Sakinliğin bir miktar düştü.</p>}
            {!timedOut && selected && (
              <p className="feedback-text">
                {selected.isBest ? "✅ " : "💡 "}
                {selected.feedback}
              </p>
            )}
            <button className="btn btn-primary" onClick={handleContinue} autoFocus>
              {index + 1 >= questions.length ? "Sonucu Gör" : "Sıradaki Soru"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
