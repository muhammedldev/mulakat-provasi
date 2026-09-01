import { useState } from "react";
import { motion } from "framer-motion";
import { clearMistake, recordMistake } from "../utils/mistakes";
import { getReviewItems, type ReviewItem } from "../utils/reviewItems";
import { playClick, playCorrect, playVictory, playWrong } from "../utils/sound";
import SparkleBurst from "./SparkleBurst";
import SpeakButton from "./SpeakButton";
import { splitPromptEmphasis } from "../utils/text";

type Phase = "intro" | "question" | "feedback" | "result";

const sourceLabel: Record<ReviewItem["source"], string> = {
  classic: "Klasik Mülakat",
  rapid: "Seri Mülakat",
  term: "Terim Küresi",
};

export default function ReviewMode({ onExit }: { onExit: () => void }) {
  const [items] = useState<ReviewItem[]>(getReviewItems);
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fixedCount, setFixedCount] = useState(0);

  const current = items[index];

  const handleAnswer = (i: number) => {
    playClick();
    setSelected(i);
    if (current.options[i].isBest) {
      playCorrect();
      clearMistake(current.id);
      setFixedCount((c) => c + 1);
    } else {
      playWrong();
      recordMistake(current.id);
    }
    setPhase("feedback");
  };

  const next = () => {
    playClick();
    const nextIndex = index + 1;
    if (nextIndex >= items.length) {
      playVictory();
      setPhase("result");
    } else {
      setIndex(nextIndex);
      setSelected(null);
      setPhase("question");
    }
  };

  if (items.length === 0 || phase === "intro") {
    return (
      <motion.div className="screen" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="intro-badge">🔁 Zayıf Noktalarım</div>
        <h1>{items.length === 0 ? "Şu an zayıf noktan yok!" : "Tekrar zamanı"}</h1>
        <p className="intro-text">
          {items.length === 0
            ? "Yanlış cevapladığın sorular burada birikir. Şu an listen boş, temizsin."
            : `Daha önce yanlış cevapladığın ${items.length} soru/terim burada. Doğru cevaplarsan listeden çıkar, yine yanlış yaparsan kalır.`}
        </p>
        {items.length > 0 && (
          <button
            className="btn btn-primary btn-glow"
            onClick={() => {
              playClick();
              setPhase("question");
            }}
          >
            Tekrara Başla
          </button>
        )}
        <button className="btn btn-secondary menu-back-btn" onClick={onExit}>
          ← Ana Menü
        </button>
      </motion.div>
    );
  }

  if (phase === "result") {
    return (
      <motion.div className="screen" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="profile-emoji">{fixedCount === items.length ? "🌟" : "💪"}</div>
        <h1>{fixedCount}/{items.length} güçlendirildi</h1>
        <p className="intro-text">
          {fixedCount === items.length
            ? "Listedeki her şeyi doğru bildin, zayıf noktaların temizlendi."
            : "Bazıları hâlâ listede duruyor, bir dahaki sefere tekrar karşına çıkacaklar."}
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
      <div className="hud-panel term-hud">
        <span>Güçlendirilen: {fixedCount}</span>
        <span>Soru: {index + 1}/{items.length}</span>
      </div>

      <motion.div
        key={current.id}
        className="scene-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="type-pill type-pill--teorik">
          {sourceLabel[current.source]} · {current.category}
        </span>
        {(() => {
          const { context, question } = splitPromptEmphasis(current.prompt);
          return (
            <>
              {context && <p className="scene-text">{context}</p>}
              <div className="speech-bubble">
                <span className="speech-bubble-tail" />
                <p>{question}</p>
                <SpeakButton text={current.prompt} className="speech-bubble-speak" />
              </div>
            </>
          );
        })()}

        {phase === "question" && (
          <div className="options-list">
            {current.options.map((opt, i) => (
              <motion.button
                key={i}
                className="option-btn"
                onClick={() => handleAnswer(i)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="option-index">{i + 1}</span>
                {opt.text}
              </motion.button>
            ))}
          </div>
        )}

        {phase === "feedback" && selected !== null && (
          <motion.div
            className={`feedback-panel${current.options[selected].isBest ? "" : " shake-on-wrong"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {current.options[selected].isBest && <SparkleBurst />}
            <p className="feedback-text">
              {current.options[selected].isBest ? "✅ " : "💡 "}
              {current.options[selected].feedback}
            </p>
            <button className="btn btn-primary" onClick={next} autoFocus>
              {index + 1 >= items.length ? "Sonucu Gör" : "Sıradaki"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
