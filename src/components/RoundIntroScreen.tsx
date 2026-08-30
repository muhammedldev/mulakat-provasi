import { useEffect } from "react";
import { motion } from "framer-motion";
import type { Interviewer } from "../types";
import InterviewerCharacter from "./InterviewerCharacter";
import { playClick } from "../utils/sound";

export default function RoundIntroScreen({
  interviewer,
  roundNumber,
  onReady,
}: {
  interviewer: Interviewer;
  roundNumber: number;
  onReady: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        playClick();
        onReady();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onReady]);

  return (
    <motion.div
      className="screen round-intro-screen"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ borderColor: interviewer.color }}
    >
      <div className="round-badge" style={{ background: interviewer.color }}>
        Bölüm {roundNumber} / 3
      </div>

      <motion.div
        className="round-avatar"
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 13, delay: 0.15 }}
      >
        <InterviewerCharacter interviewer={interviewer} mood="neutral" size="large" />
      </motion.div>

      <h1>{interviewer.roundTitle}</h1>
      <p className="round-person">
        {interviewer.name} · <span>{interviewer.title}</span>
      </p>
      <p className="intro-text">{interviewer.introLine}</p>
      <button
        className="btn btn-primary"
        onClick={() => {
          playClick();
          onReady();
        }}
        style={{ background: interviewer.color }}
      >
        Hazırım
      </button>
    </motion.div>
  );
}
