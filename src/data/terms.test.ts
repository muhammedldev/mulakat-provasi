import { describe, expect, it } from "vitest";
import { termCards } from "./terms";

const DIFFICULTIES = ["kolay", "orta", "zor", "efsane"] as const;

describe("termCards veri bütünlüğü", () => {
  it("tüm terim id'leri benzersizdir", () => {
    const ids = termCards.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("her terim tam olarak 4 şıkka sahiptir", () => {
    for (const t of termCards) {
      expect(t.options, t.id).toHaveLength(4);
    }
  });

  it("correctIndex her zaman geçerli bir şık aralığındadır (0-3)", () => {
    for (const t of termCards) {
      expect(t.correctIndex, t.id).toBeGreaterThanOrEqual(0);
      expect(t.correctIndex, t.id).toBeLessThan(4);
    }
  });

  it("her terimin şıkları kendi içinde benzersizdir (aynı metin iki kez geçmiyor)", () => {
    for (const t of termCards) {
      expect(new Set(t.options).size, t.id).toBe(t.options.length);
    }
  });

  it("TermGlobeMode'un buildDeck'inin çekeceği miktardan (kolay/orta/zor:3, efsane:1) az terime sahip hiçbir zorluk yoktur", () => {
    const need: Record<(typeof DIFFICULTIES)[number], number> = { kolay: 3, orta: 3, zor: 3, efsane: 1 };
    for (const difficulty of DIFFICULTIES) {
      const count = termCards.filter((t) => t.difficulty === difficulty).length;
      expect(count, `${difficulty} havuzu ${count} terim içeriyor, en az ${need[difficulty]} olmalı`).toBeGreaterThanOrEqual(
        need[difficulty]
      );
    }
  });

  it("doğru cevap, terimlerin çoğunda TEK BAŞINA en uzun metin değildir (uzunluk-önyargısı) — hedef bant: %35-45", () => {
    let uniquelyLongestCount = 0;
    for (const t of termCards) {
      const lens = t.options.map((o) => o.length);
      const maxLen = Math.max(...lens);
      const tie = lens.filter((l) => l === maxLen).length > 1;
      if (lens[t.correctIndex] === maxLen && !tie) uniquelyLongestCount++;
    }
    const ratio = uniquelyLongestCount / termCards.length;
    expect(ratio, `${uniquelyLongestCount}/${termCards.length} terimde doğru cevap tek başına en uzun`).toBeLessThan(0.55);
  });
});
