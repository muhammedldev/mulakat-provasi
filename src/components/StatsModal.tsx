import Modal from "./Modal";
import ProgressChart from "./ProgressChart";
import { achievements } from "../data/achievements";
import {
  getBestScore,
  getBestStreak,
  getDailyStreak,
  getGamesPlayed,
  getUnlockedAchievements,
  getXP,
  levelFromXP,
} from "../utils/storage";
import { getScoreHistory } from "../utils/insights";

export default function StatsModal({ onClose }: { onClose: () => void }) {
  const best = getBestScore();
  const gamesPlayed = getGamesPlayed();
  const bestStreak = getBestStreak();
  const unlockedCount = getUnlockedAchievements().length;
  const xp = getXP();
  const { level } = levelFromXP(xp);
  const dailyStreak = getDailyStreak();
  const scoreHistory = getScoreHistory();

  const rows = [
    { label: "Seviye", value: `Sv. ${level} (${xp} XP)` },
    { label: "Günlük Seri", value: dailyStreak > 0 ? `🔥 ${dailyStreak} gün` : "Henüz yok" },
    { label: "Oynanan Oyun", value: gamesPlayed },
    { label: "En İyi Skor", value: best ? `${best.score}/100 (${best.title})` : "Henüz yok" },
    { label: "En Uzun Kombo Serisi", value: bestStreak > 0 ? `${bestStreak} isabetli cevap` : "Henüz yok" },
    { label: "Kazanılan Başarım", value: `${unlockedCount}/${achievements.length}` },
  ];

  return (
    <Modal title="📊 İstatistiklerim" onClose={onClose}>
      <div className="stats-list">
        {rows.map((r) => (
          <div className="stats-list-row" key={r.label}>
            <span>{r.label}</span>
            <strong>{r.value}</strong>
          </div>
        ))}
      </div>

      <p className="reference-section-title">İlerleme (Klasik Mülakat skorları)</p>
      <ProgressChart data={scoreHistory} />
    </Modal>
  );
}
