import { motion } from "framer-motion";
import type { Interviewer, Mood } from "../types";

const moodBadge: Record<Mood, string> = {
  neutral: "",
  positive: "👍",
  negative: "😬",
  timeout: "⏰",
};

const mouthPaths: Record<Mood, string> = {
  neutral: "M112,92 Q130,98 148,92",
  positive: "M106,88 Q130,114 154,88",
  negative: "M108,102 Q130,88 152,102",
  timeout: "",
};

const eyebrow = {
  neutral: { leftRotate: -2, rightRotate: 2, y: 0 },
  positive: { leftRotate: -10, rightRotate: 10, y: -3 },
  negative: { leftRotate: 14, rightRotate: -14, y: 3 },
  timeout: { leftRotate: -4, rightRotate: 4, y: -5 },
};

interface Props {
  interviewer: Interviewer;
  mood: Mood;
  size?: "small" | "large";
}

export default function InterviewerCharacter({ interviewer, mood, size = "small" }: Props) {
  const brow = eyebrow[mood];
  const gid = interviewer.id;

  return (
    <svg
      viewBox="0 0 320 220"
      className={`interviewer-svg interviewer-svg--${size}`}
      role="img"
      aria-label={`${interviewer.name}, ${interviewer.title}`}
    >
      <defs>
        <linearGradient id={`desk-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8925c" />
          <stop offset="100%" stopColor="#9c6b3e" />
        </linearGradient>
        <linearGradient id={`sky-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe0f5" />
          <stop offset="100%" stopColor="#e6f4fb" />
        </linearGradient>
        {/* Light-from-upper-left shading — painted as multiply/screen overlays on
            top of the flat color shapes (not baked into the fill itself), so it
            works for any hex color without needing a computed darker/lighter
            variant. Purely static defs + a couple of extra shapes; no per-frame
            cost. */}
        <radialGradient id={`shade-${gid}`} cx="32%" cy="26%" r="78%">
          <stop offset="45%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
        </radialGradient>
        <radialGradient id={`hi-${gid}`} cx="30%" cy="24%" r="42%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`glow-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={interviewer.color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={interviewer.color} stopOpacity="0" />
        </radialGradient>
        <filter id={`charShadow-${gid}`} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#1a1420" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* backdrop */}
      <rect x="0" y="0" width="320" height="220" fill="var(--surface-alt)" />
      <circle cx="130" cy="82" r="72" fill={`url(#glow-${gid})`} />

      {/* window */}
      <rect x="230" y="16" width="70" height="48" rx="8" fill={`url(#sky-${gid})`} stroke="var(--border)" strokeWidth="2" />
      <line x1="265" y1="16" x2="265" y2="64" stroke="var(--border)" strokeWidth="2" />
      <line x1="230" y1="40" x2="300" y2="40" stroke="var(--border)" strokeWidth="2" />

      {/* plant */}
      <path d="M12,150 L38,150 L34,132 L16,132 Z" fill="#8b5e3c" />
      <motion.g
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "25px 132px" }}
      >
        <ellipse cx="16" cy="118" rx="10" ry="16" fill="#5c8a5c" transform="rotate(-18 16 118)" />
        <ellipse cx="26" cy="112" rx="10" ry="17" fill="#6b9b6b" />
        <ellipse cx="34" cy="120" rx="9" ry="15" fill="#4d7c4d" transform="rotate(15 34 120)" />
      </motion.g>

      {/* idle character group */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: `url(#charShadow-${gid})` }}
      >
        {/* contact shadow — grounds the character instead of it floating flat on the desk */}
        <ellipse cx="130" cy="150" rx="58" ry="7" fill="#000000" opacity="0.14" />

        {/* torso */}
        <path d="M68,206 C68,150 92,118 130,118 C168,118 192,150 192,206 Z" fill={interviewer.color} />
        <path
          d="M68,206 C68,150 92,118 130,118 C168,118 192,150 192,206 Z"
          fill={`url(#shade-${gid})`}
          style={{ mixBlendMode: "multiply" }}
        />
        {interviewer.hairStyle !== "short" && (
          <path d="M118,120 L130,136 L142,120 Z" fill="#ffffff" opacity="0.85" />
        )}

        {/* neck */}
        <rect x="118" y="98" width="24" height="26" rx="6" fill={interviewer.skinTone} />
        <rect x="118" y="98" width="24" height="26" rx="6" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />

        {/* hair base (behind head) */}
        <circle cx="130" cy="72" r="36" fill={interviewer.hairColor} />
        <circle cx="130" cy="72" r="36" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />

        {/* head */}
        <circle cx="130" cy="79" r="32" fill={interviewer.skinTone} />
        <circle cx="130" cy="79" r="32" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />
        <circle cx="130" cy="79" r="32" fill={`url(#hi-${gid})`} style={{ mixBlendMode: "soft-light" }} />

        {interviewer.hairStyle === "bob" && (
          <>
            <rect x="87" y="66" width="15" height="52" rx="7.5" fill={interviewer.hairColor} />
            <rect x="158" y="66" width="15" height="52" rx="7.5" fill={interviewer.hairColor} />
            <rect x="87" y="66" width="15" height="52" rx="7.5" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />
            <rect x="158" y="66" width="15" height="52" rx="7.5" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />
          </>
        )}

        {interviewer.hairStyle === "bun" && (
          <>
            <circle cx="156" cy="46" r="11" fill={interviewer.hairColor} />
            <circle cx="156" cy="46" r="11" fill={`url(#shade-${gid})`} style={{ mixBlendMode: "multiply" }} />
            <rect x="150" y="55" width="10" height="6" rx="2" fill={interviewer.color} />
          </>
        )}

        {interviewer.glasses && (
          <g fill="none" stroke="#22252b" strokeWidth="2.5">
            <rect x="103" y="65" width="26" height="21" rx="8" />
            <rect x="131" y="65" width="26" height="21" rx="8" />
            <line x1="129" y1="75" x2="131" y2="75" />
          </g>
        )}

        {/* eyes */}
        <motion.ellipse
          cx="118"
          cy="77"
          rx="4.2"
          ry="5"
          fill="#2a2a2a"
          animate={{ scaleY: [1, 1, 1, 0.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 1.6, times: [0, 0.85, 0.9, 0.95, 1] }}
          style={{ transformOrigin: "118px 77px" }}
        />
        <motion.ellipse
          cx="142"
          cy="77"
          rx="4.2"
          ry="5"
          fill="#2a2a2a"
          animate={{ scaleY: [1, 1, 1, 0.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 1.6, times: [0, 0.85, 0.9, 0.95, 1] }}
          style={{ transformOrigin: "142px 77px" }}
        />

        {/* eyebrows + mouth, react to mood */}
        <motion.g key={mood} initial={{ opacity: 0.4, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}>
          <motion.line
            x1="108"
            y1="64"
            x2="126"
            y2="64"
            stroke="#3b2a20"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ rotate: brow.leftRotate, y: brow.y }}
            style={{ transformOrigin: "117px 64px" }}
          />
          <motion.line
            x1="134"
            y1="64"
            x2="152"
            y2="64"
            stroke="#3b2a20"
            strokeWidth="3"
            strokeLinecap="round"
            animate={{ rotate: brow.rightRotate, y: brow.y }}
            style={{ transformOrigin: "143px 64px" }}
          />
          {mood === "timeout" ? (
            <ellipse cx="130" cy="93" rx="6" ry="8" fill="#2a2a2a" />
          ) : (
            <path d={mouthPaths[mood]} fill="none" stroke="#2a2a2a" strokeWidth="3.4" strokeLinecap="round" />
          )}
        </motion.g>
      </motion.g>

      {/* desk (drawn after character to hide lower body) */}
      <rect x="-6" y="150" width="332" height="76" fill={`url(#desk-${gid})`} />
      <rect x="-6" y="150" width="332" height="5" fill="#ffffff" opacity="0.25" />

      {interviewer.deskProp === "coffee" && (
        <g>
          <rect x="199" y="146" width="22" height="16" rx="2" fill="#fdfdfd" opacity="0.92" />
          <line x1="203" y1="151" x2="217" y2="151" stroke="var(--border)" strokeWidth="1.4" />
          <line x1="203" y1="156" x2="213" y2="156" stroke="var(--border)" strokeWidth="1.4" />
          <path d="M232,138 L256,138 L253,162 L235,162 Z" fill="#f2f2f2" />
          <path d="M256,142 q10,0 10,10 q0,10 -10,8" fill="none" stroke="#f2f2f2" strokeWidth="3.5" />
          {[0, 1].map((i) => (
            <motion.path
              key={i}
              d={`M${240 + i * 10},134 q4,-8 0,-16 q-4,-8 0,-16`}
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
              animate={{ y: [0, -4, 0], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
        </g>
      )}

      {interviewer.deskProp === "monitor" && (
        <g>
          <path d="M214,150 L262,150 L255,158 L221,158 Z" fill="#3a3a42" />
          <rect x="212" y="94" width="52" height="36" rx="3" fill="#15151b" stroke="#0a0a0d" strokeWidth="2" />
          <rect x="218" y="100" width="26" height="3" rx="1.5" fill={interviewer.color} opacity="0.8" />
          <rect x="218" y="107" width="34" height="3" rx="1.5" fill="#6b7280" opacity="0.7" />
          <rect x="218" y="114" width="18" height="3" rx="1.5" fill="#6b7280" opacity="0.5" />
          <motion.rect
            x="238"
            y="114"
            width="4"
            height="3"
            fill={interviewer.color}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.5, 0.51, 1] }}
          />
        </g>
      )}

      {interviewer.deskProp === "nameplate" && (
        <g>
          <rect x="205" y="152" width="66" height="15" rx="3" fill="#3a3a42" />
          <motion.rect
            x="207"
            y="154"
            width="62"
            height="3"
            rx="1.5"
            fill={interviewer.color}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <rect x="212" y="160" width="46" height="3" rx="1.5" fill="#8b8b96" opacity="0.7" />
          <rect x="280" y="140" width="16" height="20" rx="3" fill="#f2f2f2" />
          <line x1="285" y1="140" x2="281" y2="120" stroke="#3b3b44" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="291" y1="140" x2="295" y2="122" stroke={interviewer.color} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {mood !== "neutral" && (
        <motion.g
          key={`badge-${mood}`}
          initial={{ opacity: 0, scale: 0.3, rotate: -20, y: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <circle cx="184" cy="42" r="17" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
          <text x="184" y="49" fontSize="18" textAnchor="middle">
            {moodBadge[mood]}
          </text>
        </motion.g>
      )}
    </svg>
  );
}
