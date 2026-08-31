import { clearAllMistakes } from "./mistakes";
import { clearInsights } from "./insights";
import { clearDailyDone } from "./daily";
import { getReminderEnabled } from "./settings";
import { scheduleStreakReminder } from "./notifications";

const BEST_KEY = "mulakat-provasi-best";
const UNLOCKED_KEY = "mulakat-provasi-unlocked";
const GAMES_PLAYED_KEY = "mulakat-provasi-games-played";
const BEST_STREAK_KEY = "mulakat-provasi-best-streak";
const XP_KEY = "mulakat-provasi-xp";
const DAILY_STREAK_KEY = "mulakat-provasi-daily-streak";
const LAST_PLAYED_KEY = "mulakat-provasi-last-played";

export interface BestScore {
  score: number;
  title: string;
}

export function getBestScore(): BestScore | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.score === "number" && typeof parsed?.title === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveBestScoreIfHigher(score: number, title: string): boolean {
  try {
    const current = getBestScore();
    if (!current || score > current.score) {
      localStorage.setItem(BEST_KEY, JSON.stringify({ score, title }));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): boolean {
  try {
    const current = getUnlockedAchievements();
    if (current.includes(id)) return false;
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...current, id]));
    return true;
  } catch {
    return false;
  }
}

export function getGamesPlayed(): number {
  try {
    return Number(localStorage.getItem(GAMES_PLAYED_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function incrementGamesPlayed(): number {
  try {
    const next = getGamesPlayed() + 1;
    localStorage.setItem(GAMES_PLAYED_KEY, String(next));
    return next;
  } catch {
    return getGamesPlayed();
  }
}

export function getBestStreak(): number {
  try {
    return Number(localStorage.getItem(BEST_STREAK_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestStreakIfHigher(streak: number): void {
  try {
    if (streak > getBestStreak()) {
      localStorage.setItem(BEST_STREAK_KEY, String(streak));
    }
  } catch {
    /* ignore */
  }
}

export function getXP(): number {
  try {
    return Number(localStorage.getItem(XP_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function addXP(amount: number): number {
  try {
    const next = Math.max(0, getXP() + Math.round(amount));
    localStorage.setItem(XP_KEY, String(next));
    return next;
  } catch {
    return getXP();
  }
}

export function levelFromXP(xp: number): { level: number; intoLevel: number; forNextLevel: number } {
  const level = Math.floor(xp / 150) + 1;
  const intoLevel = xp % 150;
  return { level, intoLevel, forNextLevel: 150 };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyStreak(): number {
  try {
    return Number(localStorage.getItem(DAILY_STREAK_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function hasPlayedToday(): boolean {
  try {
    return localStorage.getItem(LAST_PLAYED_KEY) === todayKey();
  } catch {
    return false;
  }
}

export function recordDailyPlay(): number {
  try {
    const today = todayKey();
    const lastPlayed = localStorage.getItem(LAST_PLAYED_KEY);
    if (lastPlayed === today) {
      return getDailyStreak();
    }
    let streak = getDailyStreak();
    if (lastPlayed) {
      const diffDays = Math.round(
        (new Date(today).getTime() - new Date(lastPlayed).getTime()) / (1000 * 60 * 60 * 24)
      );
      streak = diffDays === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(DAILY_STREAK_KEY, String(streak));
    localStorage.setItem(LAST_PLAYED_KEY, today);
    // Bugün oynandığına göre günlük hatırlatıcı (açıksa) yarın akşama
    // ertelenir — aynı gün tekrar rahatsız etmemek için.
    if (getReminderEnabled()) void scheduleStreakReminder(true);
    return streak;
  } catch {
    return getDailyStreak();
  }
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(BEST_KEY);
    localStorage.removeItem(UNLOCKED_KEY);
    localStorage.removeItem(GAMES_PLAYED_KEY);
    localStorage.removeItem(BEST_STREAK_KEY);
    localStorage.removeItem(XP_KEY);
    localStorage.removeItem(DAILY_STREAK_KEY);
    localStorage.removeItem(LAST_PLAYED_KEY);
  } catch {
    /* ignore */
  }
  // "İlerlemeyi sıfırla" kullanıcıya TÜM oyun istatistiklerini temizlediğini
  // vaat ediyor (bkz. Ayarlar'daki açıklama metni) — bu yüzden yukarıdaki
  // temel ilerleme anahtarlarının yanında, diğer modüllerin kendi
  // localStorage anahtarlarını tuttuğu Zayıf Noktalarım listesi, akıllı
  // öneri istatistikleri ve "bugünün sorusu tamamlandı" durumu da sıfırlanmalı.
  clearAllMistakes();
  clearInsights();
  clearDailyDone();
}
