import { useEffect } from "react";
import { motion } from "framer-motion";
import { getReducedMotion } from "../utils/settings";

const AUTO_DISMISS_MS = 1400;

// Uygulama ilk açıldığında bir kerelik gösterilen kısa marka anı — Mika'yı
// tanıtıyor. Azaltılmış hareket açıksa hiç beklemeden direkt menüye geçiyor.
export default function IntroSplash({ onDone }: { onDone: () => void }) {
  const reducedMotion = getReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }
    const timer = setTimeout(onDone, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reducedMotion) return null;

  return (
    <motion.div
      className="intro-splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onDone}
      role="presentation"
    >
      <motion.img
        src="/mika.svg"
        alt=""
        className="intro-splash-mascot"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.p
        className="intro-splash-name"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        Mika
      </motion.p>
    </motion.div>
  );
}
