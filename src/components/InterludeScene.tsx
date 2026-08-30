import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Interlude, Interviewer } from "../types";
import InterviewerCharacter from "./InterviewerCharacter";
import { playClick } from "../utils/sound";

export default function InterludeScene({
  interlude,
  fromInterviewer,
  toInterviewer,
  onDone,
}: {
  interlude: Interlude;
  fromInterviewer: Interviewer;
  toInterviewer: Interviewer;
  onDone: () => void;
}) {
  const [replyIndex, setReplyIndex] = useState<number | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (replyIndex === null) {
        const num = Number(e.key);
        if (num >= 1 && num <= interlude.replies.length) {
          playClick();
          setReplyIndex(num - 1);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        playClick();
        onDone();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [replyIndex, interlude.replies.length, onDone]);

  return (
    <motion.div
      className="screen interlude-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="intro-badge">☕ Ara Sahne</div>

      <div className="interlude-characters">
        <div className="interlude-character">
          <InterviewerCharacter interviewer={fromInterviewer} mood="positive" />
          <p className="interview-room-caption" style={{ color: fromInterviewer.color }}>
            {fromInterviewer.name}
          </p>
        </div>
        <span className="interlude-arrow">→</span>
        <div className="interlude-character interlude-character--next">
          <InterviewerCharacter interviewer={toInterviewer} mood="neutral" />
          <p className="interview-room-caption" style={{ color: toInterviewer.color }}>
            {toInterviewer.name}
          </p>
        </div>
      </div>

      <div className="speech-bubble">
        <span className="speech-bubble-tail" />
        {interlude.lines.map((line, i) => (
          <p key={i} style={{ marginBottom: i < interlude.lines.length - 1 ? 8 : 0 }}>
            {line}
          </p>
        ))}
      </div>

      {replyIndex === null ? (
        <div className="options-list">
          {interlude.replies.map((reply, i) => (
            <motion.button
              key={i}
              className="option-btn"
              onClick={() => {
                playClick();
                setReplyIndex(i);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.3 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="option-index">{i + 1}</span>
              {reply.text}
            </motion.button>
          ))}
        </div>
      ) : (
        <motion.div
          className="feedback-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="feedback-text">{interlude.replies[replyIndex].response}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              playClick();
              onDone();
            }}
            autoFocus
          >
            Devam Et
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
