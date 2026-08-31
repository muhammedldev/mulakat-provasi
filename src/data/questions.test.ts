import { describe, expect, it } from "vitest";
import { buildGameQuestions, questionPool } from "./questions";
import { interviewers } from "./interviewers";

const interviewerIds = new Set(interviewers.map((i) => i.id));
const DIFFICULTIES = ["kolay", "orta", "zor", "efsane"] as const;

// Bu dosya, 19. turda elle bulunup düzeltilen iki gerçek hata sınıfına karşı
// kalıcı bir koruma: (1) yeni içerik eklerken yanlışlıkla var olan bir id'yi
// tekrar kullanmak, (2) doğru cevabın neredeyse her zaman en uzun şık olması
// (soru havuzunu "en uzunu seç" stratejisiyle bilgi gerektirmeden
// oynanabilir hale getiriyor). Yeni soru eklenirken bu testler kırmızı
// yanarsa, `npx tsx scripts/analyze-length-bias.ts` ile ayrıntılı ölçüm
// yapılmalı.
describe("questionPool veri bütünlüğü", () => {
  it("tüm soru id'leri benzersizdir", () => {
    const ids = questionPool.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("her sorunun interviewerId'si gerçek bir mülakatçıya karşılık gelir", () => {
    for (const q of questionPool) {
      expect(interviewerIds.has(q.interviewerId), `${q.id} bilinmeyen mülakatçı: ${q.interviewerId}`).toBe(true);
    }
  });

  it("her sorunun tam olarak bir 'isBest: true' şıkkı vardır", () => {
    for (const q of questionPool) {
      const bestCount = q.options.filter((o) => o.isBest).length;
      expect(bestCount, `${q.id} için isBest sayısı 1 olmalı, ${bestCount} bulundu`).toBe(1);
    }
  });

  it("her soru tam olarak 4 şıkka sahiptir", () => {
    for (const q of questionPool) {
      expect(q.options, `${q.id}`).toHaveLength(4);
    }
  });

  it("her sorunun şık id'leri kendi içinde benzersizdir", () => {
    for (const q of questionPool) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size, q.id).toBe(ids.length);
    }
  });

  it("her mülakatçı, her zorluk seviyesinde buildGameQuestions'ın çekeceği miktardan (kolay/orta:2, zor/efsane:1) az soruya sahip değildir", () => {
    const need: Record<(typeof DIFFICULTIES)[number], number> = { kolay: 2, orta: 2, zor: 1, efsane: 1 };
    for (const interviewer of interviewers) {
      for (const difficulty of DIFFICULTIES) {
        const count = questionPool.filter(
          (q) => q.interviewerId === interviewer.id && q.difficulty === difficulty
        ).length;
        expect(
          count,
          `${interviewer.id}/${difficulty} havuzu ${count} soru içeriyor, en az ${need[difficulty]} olmalı`
        ).toBeGreaterThanOrEqual(need[difficulty]);
      }
    }
  });

  it("doğru cevap, şıkların çoğunda TEK BAŞINA en uzun metin değildir (uzunluk-önyargısı) — hedef bant: %35-45", () => {
    let uniquelyLongestCount = 0;
    for (const q of questionPool) {
      const lens = q.options.map((o) => o.text.length);
      const maxLen = Math.max(...lens);
      const tie = lens.filter((l) => l === maxLen).length > 1;
      const best = q.options.find((o) => o.isBest);
      if (best && best.text.length === maxLen && !tie) uniquelyLongestCount++;
    }
    const ratio = uniquelyLongestCount / questionPool.length;
    // Katı bir eşik yerine geniş bir üst sınır: tek bir yeni soru eklemek
    // testi kırmasın, ama havuz belirgin şekilde "en uzunu seç"e kayarsa
    // (ör. %60+) test kırmızı yanmalı.
    expect(ratio, `${uniquelyLongestCount}/${questionPool.length} soruda doğru cevap tek başına en uzun`).toBeLessThan(0.55);
  });
});

describe("buildGameQuestions", () => {
  it("her zaman tam olarak 18 soru döner (3 mülakatçı × 6 soru)", () => {
    const { questions } = buildGameQuestions("test-seed-1");
    expect(questions).toHaveLength(18);
  });

  it("aynı seed her zaman aynı soru dizisini (id sırasına göre) üretir", () => {
    const a = buildGameQuestions("belirleyici-seed");
    const b = buildGameQuestions("belirleyici-seed");
    expect(a.questions.map((q) => q.id)).toEqual(b.questions.map((q) => q.id));
  });

  it("her mülakatçıdan tam olarak 6 soru gelir (2 kolay + 2 orta + 1 zor + 1 efsane)", () => {
    const { questions } = buildGameQuestions("dagilim-seed");
    for (const interviewer of interviewers) {
      const fromThisInterviewer = questions.filter((q) => q.interviewerId === interviewer.id);
      expect(fromThisInterviewer, interviewer.id).toHaveLength(6);
      const byDifficulty = { kolay: 0, orta: 0, zor: 0, efsane: 0 };
      fromThisInterviewer.forEach((q) => byDifficulty[q.difficulty]++);
      expect(byDifficulty).toEqual({ kolay: 2, orta: 2, zor: 1, efsane: 1 });
    }
  });

  it("seed belirtilmezse her çağrıda rastgele farklı bir seed üretir", () => {
    const a = buildGameQuestions();
    const b = buildGameQuestions();
    expect(a.seed).not.toBe(b.seed);
  });
});
