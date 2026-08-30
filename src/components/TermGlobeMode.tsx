import { useState } from "react";
import { motion } from "framer-motion";
import { termCards, type TermCard } from "../data/terms";
import type { Difficulty } from "../types";
import TermOrb from "./TermOrb";
import ProgressBar from "./ProgressBar";
import SparkleBurst from "./SparkleBurst";
import SpeakButton from "./SpeakButton";
import { playClick, playCombo, playCorrect, playVictory, playWrong } from "../utils/sound";
import { addXP, incrementGamesPlayed, recordDailyPlay } from "../utils/storage";
import { tryUnlock, tryUnlockProgressBased } from "../data/achievements";
import { clearMistake, recordMistake } from "../utils/mistakes";

const ROUND_SIZE = 10;

const difficultyMeta: Record<Difficulty, { label: string; icon: string }> = {
  kolay: { label: "Kolay", icon: "🟢" },
  orta: { label: "Orta", icon: "🟡" },
  zor: { label: "Zor", icon: "🔴" },
  efsane: { label: "Efsane", icon: "🟣" },
};

type Phase = "intro" | "idle" | "question" | "feedback" | "result";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Terim verisinde doğru cevap hep aynı konumda/en uzun seçenekte yazılmış
// olabilir — bu, sırayı karıştırmadan render edilirse terimi bilmeden de
// "en uzun/ikinci seçeneği işaretle" gibi bir örüntüyle çözülebilir hale
// getirir. Her terim çekildiğinde seçenekleri (ve doğru cevabın yeni
// index'ini) yeniden karıştırıyoruz.
function shuffleTermOptions(term: TermCard): TermCard {
  const order = shuffle(term.options.map((_, i) => i));
  return {
    ...term,
    options: order.map((i) => term.options[i]),
    correctIndex: order.indexOf(term.correctIndex),
  };
}

function buildDeck(): TermCard[] {
  const pick = (difficulty: Difficulty, n: number) =>
    shuffle(termCards.filter((t) => t.difficulty === difficulty)).slice(0, n);
  return [...pick("kolay", 3), ...pick("orta", 3), ...pick("zor", 3), ...pick("efsane", 1)].map(shuffleTermOptions);
}

export default function TermGlobeMode({
  onExit,
  onAchievement,
}: {
  onExit: () => void;
  onAchievement: (text: string) => void;
}) {
  const [deck] = useState<TermCard[]>(buildDeck);
  const [phase, setPhase] = useState<Phase>("intro");
  const [drawnCount, setDrawnCount] = useState(0);
  const [current, setCurrent] = useState<TermCard | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<TermCard[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(0);

  const draw = () => {
    setSpinning(true);
    playClick();
    setTimeout(() => {
      const term = deck[drawnCount];
      setCurrent(term);
      setSelected(null);
      setSpinning(false);
      setPhase("question");
    }, 500);
  };

  const handleAnswer = (index: number) => {
    if (!current) return;
    playClick();
    setSelected(index);
    const isCorrect = index === current.correctIndex;
    if (isCorrect) {
      playCorrect();
      setScore((s) => s + 1);
      clearMistake(current.id);
      if (current.difficulty === "efsane") tryUnlock("efsane-avcisi", onAchievement);
      setStreak((s) => {
        const next = s + 1;
        if (next > 0 && next % 3 === 0) {
          playCombo();
          onAchievement(`🔥 Kombo! Art arda ${next} doğru terim`);
          tryUnlock("kombo-avcisi", onAchievement);
        }
        return next;
      });
    } else {
      playWrong();
      recordMistake(current.id);
      setStreak(0);
      setWrongFlash((f) => f + 1);
    }
    setHistory((h) => [...h, current]);
    setPhase("feedback");
  };

  const next = () => {
    playClick();
    const nextCount = drawnCount + 1;
    setDrawnCount(nextCount);
    if (nextCount >= deck.length) {
      playVictory();
      addXP(score * 10);
      recordDailyPlay();
      incrementGamesPlayed();
      if (score >= deck.length) tryUnlock("terim-ustasi", onAchievement);
      tryUnlockProgressBased(onAchievement);
      setPhase("result");
    } else {
      setPhase("idle");
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
        <div className="intro-badge">🔮 Terim Küresi</div>
        <h1>Kelime & Terim Öğrenme Modu</h1>
        <p className="intro-text">
          Küreden sırayla {ROUND_SIZE} terim çekeceksin. Her terim için doğru tanımı seç; doğru ya
          da yanlış fark etmeksizin açıklamasını göreceksin. Süre yok, baskı yok — amaç öğrenmek.
          Sonunda kendi kişisel terim sözlüğün oluşacak.
        </p>
        <button
          className="btn btn-primary btn-glow"
          onClick={() => {
            playClick();
            setPhase("idle");
          }}
        >
          Küreyi Aç
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
        <div className="profile-emoji">{score >= ROUND_SIZE * 0.8 ? "🎓" : score >= ROUND_SIZE * 0.5 ? "📘" : "🌱"}</div>
        <h1>{score} / {ROUND_SIZE} doğru</h1>
        <p className="intro-text">
          {score >= ROUND_SIZE * 0.8
            ? "Etkileyici bir terim bilgisi! Bu kavramları gerçek bir mülakatta rahatlıkla kullanabilirsin."
            : score >= ROUND_SIZE * 0.5
              ? "İyi bir başlangıç — bazı terimler henüz oturmamış, aşağıdaki sözlüğü tekrar gözden geçir."
              : "Herkes bir yerden başlar — aşağıdaki sözlükle terimleri tazele, tekrar dene."}
        </p>

        <div className="term-glossary">
          {history.map((t) => (
            <div className="term-glossary-item" key={t.id}>
              <p className="term-glossary-term">{t.term}</p>
              <p className="term-glossary-def">{t.explanation}</p>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              playClick();
              onExit();
            }}
          >
            Ana Menüye Dön
          </button>
        </div>
      </motion.div>
    );
  }

  const isAnswerCorrect = phase === "feedback" && selected === current?.correctIndex;

  return (
    <div className="screen term-mode-screen">
      <div className="hud-panel term-hud">
        {phase !== "idle" ? (
          <ProgressBar current={drawnCount} total={ROUND_SIZE} label="Terim" />
        ) : (
          <span>
            Terim: {drawnCount}/{ROUND_SIZE}
          </span>
        )}
        <div className="term-hud-row">
          <span>Skor: {score}</span>
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

      {phase === "idle" && (
        <TermOrb remaining={deck.length - drawnCount} total={deck.length} spinning={spinning} onDraw={draw} />
      )}

      {(phase === "question" || phase === "feedback") && current && (
        <motion.div
          key={current.id}
          className="scene-card"
          style={{ perspective: 800 }}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          <div className="pill-group">
            <span className="type-pill type-pill--teorik">{current.category}</span>
            <span className={`difficulty-pill difficulty-pill--${current.difficulty}`}>
              {difficultyMeta[current.difficulty].icon} {difficultyMeta[current.difficulty].label}
            </span>
          </div>
          <div className="term-question-row">
            <h2 className="term-question-title">{current.prompt}</h2>
            <SpeakButton text={current.prompt} />
          </div>

          <div
            className={`options-list${phase === "feedback" && !isAnswerCorrect ? " shake-on-wrong" : ""}`}
            key={`options-${current.id}-${wrongFlash}`}
          >
            {current.options.map((opt, i) => {
              let cls = "option-btn";
              if (phase === "feedback") {
                if (i === current.correctIndex) cls += " option-btn--correct";
                else if (i === selected) cls += " option-btn--wrong";
              }
              return (
                <motion.button
                  key={i}
                  className={cls}
                  onClick={() => phase === "question" && handleAnswer(i)}
                  whileHover={phase === "question" ? { scale: 1.015 } : {}}
                  whileTap={phase === "question" ? { scale: 0.98 } : {}}
                >
                  <span className="option-index">{i + 1}</span>
                  {opt}
                  {phase === "feedback" && i === current.correctIndex && (
                    <>
                      <motion.span
                        className="option-badge option-badge--correct"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        ✓
                      </motion.span>
                      {isAnswerCorrect && <SparkleBurst />}
                    </>
                  )}
                  {phase === "feedback" && i === selected && i !== current.correctIndex && (
                    <motion.span
                      className="option-badge option-badge--wrong"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      ✕
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {phase === "feedback" && (
            <motion.div
              className="feedback-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="feedback-text">
                {isAnswerCorrect ? "✅ " : "📘 "}
                {current.explanation}
              </p>
              <button className="btn btn-primary" onClick={next} autoFocus>
                {drawnCount + 1 >= deck.length ? "Sonucu Gör" : "Sıradaki Terim"}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
