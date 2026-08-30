import { useState } from "react";
import { motion } from "framer-motion";
import { questionPool } from "../data/questions";
import type { Question } from "../types";
import { dailySeedIndex, hasCompletedDailyToday, markDailyCompletedToday } from "../utils/daily";
import { addXP, getDailyStreak, recordDailyPlay } from "../utils/storage";
import { clearMistake, recordMistake } from "../utils/mistakes";
import { playClick, playCorrect, playVictory, playWrong } from "../utils/sound";
import SparkleBurst from "./SparkleBurst";
import SpeakButton from "./SpeakButton";

const DAILY_XP_BONUS = 25;

// Kaynak havuzundaki seçenekler sabit sırada tutuluyor (doğru cevap her
// zaman aynı pozisyonda olabiliyor) — diğer tüm modlar (Klasik, Terim
// Küresi, Seri Mülakat, Zayıf Noktalarım) render öncesi seçenekleri
// karıştırıyor, Günün Sorusu da aynı deseni izlemeli, yoksa o günün tek
// sorusunda herkes için aynı sabit pozisyon "bilgisiz doğru cevap"
// stratejisine açık kalır.
function shuffleOptions(question: Question): Question {
  const options = [...question.options];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { ...question, options };
}

export default function DailyChallengeMode({ onExit }: { onExit: () => void }) {
  const [alreadyDone] = useState(hasCompletedDailyToday);
  const [phase, setPhase] = useState<"question" | "feedback" | "done">(alreadyDone ? "done" : "question");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [question] = useState<Question>(() =>
    shuffleOptions(questionPool[dailySeedIndex(questionPool.length)])
  );
  const selected = question.options.find((o) => o.id === selectedId) ?? null;

  const handleAnswer = (optionId: string) => {
    playClick();
    setSelectedId(optionId);
    const option = question.options.find((o) => o.id === optionId)!;
    if (option.isBest) {
      playCorrect();
      clearMistake(question.id);
    } else {
      playWrong();
      recordMistake(question.id);
    }
    setPhase("feedback");
  };

  const finish = () => {
    playClick();
    playVictory();
    addXP(DAILY_XP_BONUS);
    const streak = recordDailyPlay();
    markDailyCompletedToday();
    setPhase("done");
    return streak;
  };

  if (phase === "done") {
    return (
      <motion.div className="screen" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="intro-badge">📅 Günün Sorusu</div>
        <div className="profile-emoji">🔥</div>
        <h1>{getDailyStreak()} günlük seri!</h1>
        <p className="intro-text">
          {alreadyDone
            ? "Bugünün sorusunu zaten çözdün. Yarın yeni bir soru seni bekliyor — serini kaybetme!"
            : `Harika! +${DAILY_XP_BONUS} XP kazandın. Yarın tekrar gel, serini büyüt.`}
        </p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onExit}>
            Ana Menüye Dön
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="screen">
      <div className="intro-badge">📅 Günün Sorusu</div>
      <motion.div
        className="scene-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="scene-text">{question.scene}</p>
        <div className="term-question-row">
          <h2 className="term-question-title">{question.interviewerLine}</h2>
          <SpeakButton text={question.interviewerLine} />
        </div>

        {phase === "question" && (
          <div className="options-list">
            {question.options.map((opt, i) => (
              <motion.button
                key={opt.id}
                className="option-btn"
                onClick={() => handleAnswer(opt.id)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="option-index">{i + 1}</span>
                {opt.text}
              </motion.button>
            ))}
          </div>
        )}

        {phase === "feedback" && selected && (
          <motion.div
            className={`feedback-panel${selected.isBest ? "" : " shake-on-wrong"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selected.isBest && <SparkleBurst />}
            <p className="feedback-text">
              {selected.isBest ? "✅ " : "💡 "}
              {selected.feedback}
            </p>
            <button className="btn btn-primary" onClick={finish} autoFocus>
              Bitir
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
