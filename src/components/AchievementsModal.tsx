import Modal from "./Modal";
import { achievements } from "../data/achievements";
import { getUnlockedAchievements } from "../utils/storage";

export default function AchievementsModal({ onClose }: { onClose: () => void }) {
  const unlocked = new Set(getUnlockedAchievements());

  return (
    <Modal title={`🏆 Başarımlar (${unlocked.size}/${achievements.length})`} onClose={onClose}>
      <div className="achievement-list">
        {achievements.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          const current = !isUnlocked && a.progress ? Math.min(a.progress(), a.target ?? 0) : null;
          return (
            <div key={a.id} className={`achievement-item ${isUnlocked ? "achievement-item--unlocked" : ""}`}>
              <span className="achievement-icon">{isUnlocked ? a.icon : "🔒"}</span>
              <div className="achievement-body">
                <p className="achievement-title">{a.title}</p>
                <p className="achievement-desc">{a.description}</p>
                {current !== null && a.target && (
                  <div className="achievement-progress">
                    <div className="achievement-progress-track">
                      <div
                        className="achievement-progress-fill"
                        style={{ width: `${(current / a.target) * 100}%` }}
                      />
                    </div>
                    <span className="achievement-progress-label">
                      {current}/{a.target}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
