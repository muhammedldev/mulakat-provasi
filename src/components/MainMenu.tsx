import { Suspense, lazy, useState } from "react";
import { motion } from "framer-motion";
import { interviewers } from "../data/interviewers";
import InterviewerCharacter from "./InterviewerCharacter";
import Tilt3D from "./Tilt3D";
import { achievements } from "../data/achievements";
import { getBestScore, getDailyStreak, getUnlockedAchievements, getXP, levelFromXP } from "../utils/storage";
import { getMistakeCount } from "../utils/mistakes";
import { hasCompletedDailyToday } from "../utils/daily";
import { getWeaknessInsight } from "../utils/insights";
import { playClick } from "../utils/sound";
import { tryUnlock } from "../data/achievements";

// Ana menü ilk açılışta indirilen tek ekran — bu modallar yalnızca kullanıcı
// gerçekten tıkladığında yükleniyor. "Kaynakça" özellikle önemli: tüm
// soru/terim havuzunu (kaynaklı olanları filtrelemek için) import ediyor.
const HowToPlayModal = lazy(() => import("./HowToPlayModal"));
const AchievementsModal = lazy(() => import("./AchievementsModal"));
const StatsModal = lazy(() => import("./StatsModal"));
const SettingsModal = lazy(() => import("./SettingsModal"));
const ReferencesModal = lazy(() => import("./ReferencesModal"));

type ModalKind = "howto" | "achievements" | "stats" | "settings" | "references" | null;

export default function MainMenu({
  onStart,
  onOpenReview,
  onOpenDaily,
  onAchievement,
}: {
  onStart: () => void;
  onOpenReview: () => void;
  onOpenDaily: () => void;
  onAchievement: (text: string) => void;
}) {
  const [modal, setModal] = useState<ModalKind>(null);
  const best = getBestScore();
  const unlockedCount = getUnlockedAchievements().length;
  const xp = getXP();
  const { level, intoLevel, forNextLevel } = levelFromXP(xp);
  const dailyStreak = getDailyStreak();
  const mistakeCount = getMistakeCount();
  const dailyDone = hasCompletedDailyToday();
  const insight = getWeaknessInsight();

  const openModal = (kind: ModalKind) => {
    playClick();
    setModal(kind);
    if (kind === "references") tryUnlock("kaynak-kasifi", onAchievement);
  };

  return (
    <>
      <motion.div
        className="screen intro-screen intro-screen--rich"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="intro-badge">
          <img src="/mika.svg" alt="" className="intro-badge-icon" aria-hidden="true" />
          Mika · Mülakat Provası
        </div>
        <h1 className="intro-title-gradient">Mülakat odasına hazır mısın?</h1>

        <div className="player-status-row">
          <div className="level-badge">
            <span className="level-badge-num">Sv. {level}</span>
            <div className="level-badge-track">
              <motion.div
                className="level-badge-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(intoLevel / forNextLevel) * 100}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 20, delay: 0.2 }}
              />
            </div>
          </div>
          {dailyStreak > 0 && <span className="daily-streak-chip">🔥 {dailyStreak} gün</span>}
        </div>

        {best && (
          <motion.p
            className="best-score-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            🏆 En iyi skorun: {best.score}/100 — {best.title}
          </motion.p>
        )}

        {insight && (
          <motion.div
            className="insight-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="insight-icon" aria-hidden="true">💡</span>
            <p>{insight.text}</p>
          </motion.div>
        )}

        <div className="intro-cast">
          {interviewers.map((p, i) => (
            <motion.div
              key={p.id}
              className="intro-cast-card"
              style={{ borderColor: p.color }}
              initial={{ opacity: 0, y: 14, rotate: i === 1 ? 0 : i === 0 ? -4 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4, type: "spring", stiffness: 140 }}
            >
              <Tilt3D className="intro-cast-tilt">
                <InterviewerCharacter interviewer={p} mood="neutral" />
              </Tilt3D>
              <p className="intro-cast-name" style={{ color: p.color }}>
                {p.name}
              </p>
              <p className="intro-cast-title">{p.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          className="btn btn-primary btn-glow menu-play-btn"
          onClick={() => {
            playClick();
            onStart();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          ▶ Oyna
        </motion.button>

        <div className="quick-action-row">
          <button
            className="quick-action-btn"
            onClick={() => {
              playClick();
              onOpenDaily();
            }}
          >
            📅 Günün Sorusu {dailyDone && <span className="quick-action-check">✓</span>}
          </button>
          <button
            className="quick-action-btn"
            onClick={() => {
              playClick();
              onOpenReview();
            }}
          >
            🔁 Zayıf Noktalarım {mistakeCount > 0 && <span className="menu-item-badge">{mistakeCount}</span>}
          </button>
        </div>

        <div className="menu-list">
          {(
            [
              { kind: "howto", icon: "📖", label: "Nasıl Oynanır", badge: null },
              { kind: "achievements", icon: "🏆", label: "Başarımlar", badge: `${unlockedCount}/${achievements.length}` },
              { kind: "stats", icon: "📊", label: "İstatistiklerim", badge: null },
              { kind: "references", icon: "📚", label: "Kaynakça", badge: null },
              { kind: "settings", icon: "⚙️", label: "Ayarlar", badge: null },
            ] as const
          ).map((item, i) => (
            <motion.button
              key={item.kind}
              className="menu-item"
              onClick={() => openModal(item.kind)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
            >
              <span className="menu-item-label">
                <span className="menu-item-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge ? <span className="menu-item-badge">{item.badge}</span> : <span className="menu-item-arrow">›</span>}
            </motion.button>
          ))}
        </div>

        <p className="intro-footnote">
          İlerlemen sadece bu telefonda/tarayıcıda tutulur, hiçbir yere gönderilmez.
        </p>
        <p className="app-credit">Dev by Muhammed</p>
      </motion.div>

      <Suspense fallback={null}>
        {modal === "howto" && <HowToPlayModal onClose={() => setModal(null)} />}
        {modal === "achievements" && <AchievementsModal onClose={() => setModal(null)} />}
        {modal === "stats" && <StatsModal onClose={() => setModal(null)} />}
        {modal === "settings" && <SettingsModal onClose={() => setModal(null)} />}
        {modal === "references" && <ReferencesModal onClose={() => setModal(null)} />}
      </Suspense>
    </>
  );
}
