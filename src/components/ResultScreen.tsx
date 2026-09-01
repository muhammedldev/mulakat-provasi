import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SectorId, Stats } from "../types";
import { getProfile, overallScore, rankLabels, statLabels, statTips, weakest } from "../data/profiles";
import StatBars from "./StatBars";
import AnimatedNumber from "./AnimatedNumber";
import ConfettiBurst from "./ConfettiBurst";
import { playClick, playVictory } from "../utils/sound";
import { addXP, incrementGamesPlayed, recordDailyPlay, saveBestScoreIfHigher, saveBestStreakIfHigher } from "../utils/storage";
import { tryUnlock, tryUnlockProgressBased } from "../data/achievements";
import { recordClassicStats, recordScoreHistory } from "../utils/insights";
import { downloadShareImage } from "../utils/shareImage";
import { buildChallengeUrl, type ChallengePayload } from "../utils/challenge";

const confettiEmojis = ["🎉", "✨", "🎯", "📎", "💡"];

export default function ResultScreen({
  stats,
  bestStreakThisGame,
  seed,
  sector,
  incomingChallenge,
  onRestart,
  onExitToMenu,
  onAchievement,
}: {
  stats: Stats;
  bestStreakThisGame: number;
  seed: string;
  sector?: SectorId;
  incomingChallenge?: ChallengePayload | null;
  onRestart: () => void;
  onExitToMenu: () => void;
  onAchievement: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const profile = getProfile(stats);
  const score = overallScore(stats);
  const weakStat = weakest(stats);
  const duelResult = incomingChallenge
    ? score > incomingChallenge.score
      ? "win"
      : score < incomingChallenge.score
        ? "lose"
        : "tie"
    : null;

  useEffect(() => {
    playVictory();
    incrementGamesPlayed();
    saveBestStreakIfHigher(bestStreakThisGame);
    addXP(score);
    recordDailyPlay();
    recordClassicStats(stats);
    recordScoreHistory(score);

    tryUnlock("ilk-prova", onAchievement);
    if (Object.values(stats).some((v) => v === 100)) {
      tryUnlock("tam-puan", onAchievement);
    }
    if (profile.rank === "platinum") {
      tryUnlock("mulakat-ustasi", onAchievement);
    }
    if (saveBestScoreIfHigher(score, profile.title)) {
      onAchievement("🏆 Yeni Rekor!");
      tryUnlock("rekor-kirici", onAchievement);
    }
    tryUnlockProgressBased(onAchievement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadImage = async () => {
    playClick();
    setDownloading(true);
    try {
      await downloadShareImage(
        {
          emoji: profile.emoji,
          rank: profile.rank,
          rankLabel: rankLabels[profile.rank].toLocaleUpperCase("tr-TR"),
          title: profile.title,
          score,
          stats: [
            { label: statLabels.hazirlik, icon: "📚", value: stats.hazirlik, color: "#818cf8" },
            { label: statLabels.iletisim, icon: "💬", value: stats.iletisim, color: "#2dd4bf" },
            { label: statLabels.ozguven, icon: "⭐", value: stats.ozguven, color: "#fbbf24" },
          ],
          tipLabel: statLabels[weakStat],
          tip: statTips[weakStat],
          footer: "mulakat-provasi ile hazırlandı",
        },
        "mulakat-provasi-sonuc-raporu.png"
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    playClick();
    const summary = `Mülakat Provası sonucum: ${profile.emoji} ${profile.title} (${score}/100)\nHazırlık ${stats.hazirlik} · İletişim ${stats.iletisim} · Özgüven ${stats.ozguven}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleChallenge = async () => {
    playClick();
    const url = buildChallengeUrl({ seed, score, rank: profile.rank, title: profile.title, sector });
    const shareText = `Mülakat Provası'nda ${score}/100 puan aldım (${profile.title}). Aynı soruları çözüp beni geçebilir misin?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mülakat Provası Meydan Okuması", text: shareText, url });
        tryUnlock("meydan-okuyucu", onAchievement);
        return;
      } catch {
        // kullanıcı paylaşımı iptal etti, panoya kopyalamaya devam et
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      tryUnlock("meydan-okuyucu", onAchievement);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 2500);
    } catch {
      setChallengeCopied(false);
    }
  };

  return (
    <motion.div
      className="screen result-screen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ConfettiBurst />

      <div className="confetti-row" aria-hidden="true">
        {confettiEmojis.map((emoji, i) => (
          <motion.span
            key={emoji}
            className="confetti-emoji"
            initial={{ opacity: 0, y: -10, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 12 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <motion.div
        className={`profile-emoji rank-ring rank-ring--${profile.rank}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.15 }}
      >
        <span>{profile.emoji}</span>
      </motion.div>
      <p className="rank-label">{rankLabels[profile.rank]}</p>

      <h1>{profile.title}</h1>
      <p className="result-score">
        Genel Skor: <AnimatedNumber value={score} /> / 100
      </p>
      <p className="intro-text">{profile.description}</p>

      {incomingChallenge && duelResult && (
        <div className={`tip-card duel-card duel-card--${duelResult}`}>
          <p className="tip-title">
            {duelResult === "win" && "🎉 Meydan okumayı kazandın!"}
            {duelResult === "lose" && "😅 Bu sefer olmadı"}
            {duelResult === "tie" && "🤝 Berabere kaldınız!"}
          </p>
          <p>
            Sen: {score}/100 · Arkadaşın: {incomingChallenge.score}/100 ({incomingChallenge.title})
          </p>
        </div>
      )}

      <StatBars stats={stats} />

      <div className="tip-card">
        <p className="tip-title">İpucu: {statLabels[weakStat]}</p>
        <p>{statTips[weakStat]}</p>
      </div>

      <div className="result-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            playClick();
            onRestart();
          }}
        >
          Tekrar Oyna
        </button>
        <button className="btn btn-secondary" onClick={handleShare}>
          {copied ? "Panoya Kopyalandı ✓" : "Sonucu Kopyala"}
        </button>
        <button className="btn btn-secondary" onClick={handleChallenge}>
          {challengeCopied ? "Link Kopyalandı ✓" : "🎯 Arkadaşını Meydan Oku"}
        </button>
        <button className="btn btn-secondary" onClick={handleDownloadImage} disabled={downloading}>
          {downloading ? "Hazırlanıyor…" : "📄 Sonuç Raporunu İndir"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            playClick();
            onExitToMenu();
          }}
        >
          Ana Menüye Dön
        </button>
      </div>
    </motion.div>
  );
}
