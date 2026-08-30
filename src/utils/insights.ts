import type { Stats } from "../types";
import type { RapidCategory } from "../data/rapidQuestions";
import { statLabels } from "../data/profiles";

const STAT_TOTALS_KEY = "mulakat-provasi-stat-totals";
const CATEGORY_TOTALS_KEY = "mulakat-provasi-category-totals";
const SCORE_HISTORY_KEY = "mulakat-provasi-score-history";
const SCORE_HISTORY_LIMIT = 30;

interface StatTotals {
  hazirlik: number;
  iletisim: number;
  ozguven: number;
  count: number;
}

type CategoryTotals = Record<RapidCategory, { correct: number; total: number }>;

const emptyCategoryTotals: CategoryTotals = {
  uygulama: { correct: 0, total: 0 },
  teorik: { correct: 0, total: 0 },
  vaka: { correct: 0, total: 0 },
  psikoloji: { correct: 0, total: 0 },
};

const emptyStatTotals: StatTotals = { hazirlik: 0, iletisim: 0, ozguven: 0, count: 0 };

function isStatTotals(value: unknown): value is StatTotals {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.hazirlik === "number" &&
    typeof v.iletisim === "number" &&
    typeof v.ozguven === "number" &&
    typeof v.count === "number"
  );
}

function getStatTotals(): StatTotals {
  try {
    const raw = localStorage.getItem(STAT_TOTALS_KEY);
    if (!raw) return { ...emptyStatTotals };
    const parsed: unknown = JSON.parse(raw);
    return isStatTotals(parsed) ? parsed : { ...emptyStatTotals };
  } catch {
    return { ...emptyStatTotals };
  }
}

export function recordClassicStats(stats: Stats): void {
  try {
    const totals = getStatTotals();
    totals.hazirlik += stats.hazirlik;
    totals.iletisim += stats.iletisim;
    totals.ozguven += stats.ozguven;
    totals.count += 1;
    localStorage.setItem(STAT_TOTALS_KEY, JSON.stringify(totals));
  } catch {
    /* ignore */
  }
}

function isCategoryEntry(value: unknown): value is { correct: number; total: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.correct === "number" && typeof v.total === "number";
}

function getCategoryTotals(): CategoryTotals {
  try {
    const raw = localStorage.getItem(CATEGORY_TOTALS_KEY);
    if (!raw) return { ...emptyCategoryTotals };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...emptyCategoryTotals };
    const result = { ...emptyCategoryTotals };
    (Object.keys(emptyCategoryTotals) as RapidCategory[]).forEach((cat) => {
      const entry = (parsed as Record<string, unknown>)[cat];
      if (isCategoryEntry(entry)) result[cat] = entry;
    });
    return result;
  } catch {
    return { ...emptyCategoryTotals };
  }
}

export function recordCategoryResult(category: RapidCategory, correct: boolean): void {
  try {
    const totals = getCategoryTotals();
    totals[category].total += 1;
    if (correct) totals[category].correct += 1;
    localStorage.setItem(CATEGORY_TOTALS_KEY, JSON.stringify(totals));
  } catch {
    /* ignore */
  }
}

export interface ScoreHistoryEntry {
  date: string;
  score: number;
}

function isScoreHistoryEntry(value: unknown): value is ScoreHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.date === "string" && typeof v.score === "number" && Number.isFinite(v.score);
}

export function getScoreHistory(): ScoreHistoryEntry[] {
  try {
    const raw = localStorage.getItem(SCORE_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isScoreHistoryEntry);
  } catch {
    return [];
  }
}

// Klasik Mülakat'ı her bitirişte genel skoru tarihiyle birlikte kaydeder —
// İstatistiklerim ekranındaki "zaman içinde ilerleme" grafiğinin verisi.
// Depoyu sınırsız büyütmemek için yalnızca son SCORE_HISTORY_LIMIT oyun tutulur.
export function recordScoreHistory(score: number): void {
  try {
    const history = getScoreHistory();
    history.push({ date: new Date().toISOString().slice(0, 10), score });
    const trimmed = history.slice(-SCORE_HISTORY_LIMIT);
    localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function clearInsights(): void {
  try {
    localStorage.removeItem(STAT_TOTALS_KEY);
    localStorage.removeItem(CATEGORY_TOTALS_KEY);
    localStorage.removeItem(SCORE_HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

const categoryModeTip: Record<RapidCategory, string> = {
  uygulama: "Klasik Mülakat modunda uygulamalı senaryo sorularına odaklanmayı dene.",
  teorik: "Terim Küresi'nde güncel İK kavramlarını gözden geçirmek işine yarayabilir.",
  vaka: "Seri Mülakat'ta vaka analizi sorularına biraz daha ağırlık ver.",
  psikoloji: "Seri Mülakat'ta öz-yönetim sorularında pratik yapmayı sürdür.",
};

const categoryLabel: Record<RapidCategory, string> = {
  uygulama: "uygulama",
  teorik: "teorik",
  vaka: "vaka analizi",
  psikoloji: "öz-yönetim",
};

export interface Insight {
  text: string;
}

export function getWeaknessInsight(): Insight | null {
  const stats = getStatTotals();
  if (stats.count >= 2) {
    const averages: Record<keyof Omit<StatTotals, "count">, number> = {
      hazirlik: stats.hazirlik / stats.count,
      iletisim: stats.iletisim / stats.count,
      ozguven: stats.ozguven / stats.count,
    };
    const weakestKey = (Object.keys(averages) as (keyof typeof averages)[]).reduce((a, b) =>
      averages[a] <= averages[b] ? a : b
    );
    if (averages[weakestKey] < 62) {
      return {
        text: `Klasik Mülakat'ta ortalama ${statLabels[weakestKey]} puanın diğerlerine göre düşük kalıyor (${Math.round(averages[weakestKey])}/100). Terim Küresi'nde ilgili kavramları tazelemek fark yaratabilir.`,
      };
    }
  }

  const categories = getCategoryTotals();
  let weakestCategory: RapidCategory | null = null;
  let weakestRate = 1;
  (Object.keys(categories) as RapidCategory[]).forEach((cat) => {
    const t = categories[cat];
    if (t.total >= 3) {
      const rate = t.correct / t.total;
      if (rate < weakestRate) {
        weakestRate = rate;
        weakestCategory = cat;
      }
    }
  });
  if (weakestCategory && weakestRate < 0.6) {
    return {
      text: `Seri Mülakat'ta ${categoryLabel[weakestCategory]} sorularında doğruluğun %${Math.round(weakestRate * 100)} civarında. ${categoryModeTip[weakestCategory]}`,
    };
  }

  return null;
}
