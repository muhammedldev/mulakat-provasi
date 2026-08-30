import { questionPool } from "../data/questions";
import { vakaQuestions, psikolojiQuestions } from "../data/rapidQuestions";
import { termCards } from "../data/terms";
import { getMistakeMap } from "./mistakes";

export interface ReviewOption {
  text: string;
  isBest: boolean;
  feedback: string;
}

export interface ReviewItem {
  id: string;
  source: "classic" | "rapid" | "term";
  category: string;
  prompt: string;
  options: ReviewOption[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Bu modül kasıtlı olarak `ReviewMode.tsx` dışında hiçbir yerden import
// edilmiyor — tüm soru/terim havuzlarını (data/questions.ts, rapidQuestions.ts,
// terms.ts) yüklüyor, bu da yalnızca Zayıf Noktalarım moduna girildiğinde
// gerekli. `utils/mistakes.ts`'teki hafif fonksiyonlarla (ana menüdeki rozet
// sayısı gibi) karıştırılmamalı.
export function getReviewItems(): ReviewItem[] {
  const ids = Object.keys(getMistakeMap());
  const items: ReviewItem[] = [];

  ids.forEach((id) => {
    const classic = questionPool.find((q) => q.id === id);
    if (classic) {
      items.push({
        id: classic.id,
        source: "classic",
        category: classic.type === "teorik" ? "Teorik" : "Uygulama",
        prompt: classic.interviewerLine,
        options: shuffle(classic.options.map((o) => ({ text: o.text, isBest: Boolean(o.isBest), feedback: o.feedback }))),
      });
      return;
    }
    const rapid = [...vakaQuestions, ...psikolojiQuestions].find((q) => q.id === id);
    if (rapid) {
      items.push({
        id: rapid.id,
        source: "rapid",
        category: rapid.category === "vaka" ? "Vaka Analizi" : "Öz-Yönetim",
        prompt: rapid.prompt,
        options: shuffle(rapid.options),
      });
      return;
    }
    const term = termCards.find((t) => t.id === id);
    if (term) {
      items.push({
        id: term.id,
        source: "term",
        category: term.category,
        prompt: term.prompt,
        options: shuffle(
          term.options.map((text, i) => ({
            text,
            isBest: i === term.correctIndex,
            feedback: term.explanation,
          }))
        ),
      });
    }
  });

  return items;
}
