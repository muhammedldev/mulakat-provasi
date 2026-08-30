import { motion } from "framer-motion";
import { rankLabels } from "../data/profiles";
import { playClick } from "../utils/sound";
import type { ChallengePayload } from "../utils/challenge";

export default function ChallengeIntroScreen({
  challenge,
  onAccept,
  onDecline,
}: {
  challenge: ChallengePayload;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      className="screen round-intro-screen"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="round-badge">Meydan Okuma</div>

      <motion.div
        className="profile-emoji"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
      >
        <span>🎯</span>
      </motion.div>

      <h1>Bir arkadaşın seni meydan okuyor!</h1>
      <p className="intro-text">
        Skoru: <strong>{challenge.score}/100</strong> — {challenge.title} ({rankLabels[challenge.rank]})
        <br />
        Aynı 18 soruyu çözüp onu geçebilecek misin?
      </p>

      <div className="result-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            playClick();
            onAccept();
          }}
        >
          Kabul Et
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            playClick();
            onDecline();
          }}
        >
          Ana Menüye Dön
        </button>
      </div>
    </motion.div>
  );
}
