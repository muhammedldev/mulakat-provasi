import { describe, expect, it } from "vitest";
import { createSeed, rngFromSeed, shuffleSeeded } from "./rng";

describe("rngFromSeed", () => {
  it("aynı seed her zaman aynı sayı dizisini üretir", () => {
    const a = rngFromSeed("abc123");
    const b = rngFromSeed("abc123");
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("farklı seed'ler (neredeyse her zaman) farklı diziler üretir", () => {
    const a = rngFromSeed("seed-one");
    const b = rngFromSeed("seed-two");
    expect(a()).not.toBe(b());
  });

  it("her çağrı 0 (dahil) ile 1 (hariç) arasında bir sayı döner", () => {
    const rng = rngFromSeed("range-test");
    for (let i = 0; i < 50; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("shuffleSeeded", () => {
  it("aynı seed ile aynı karıştırma sırasını üretir — meydan okuma linkinin belirleyiciliği buna dayanıyor", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffledA = shuffleSeeded(arr, rngFromSeed("duel-seed"));
    const shuffledB = shuffleSeeded(arr, rngFromSeed("duel-seed"));
    expect(shuffledA).toEqual(shuffledB);
  });

  it("orijinal diziyi mutasyona uğratmaz", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleSeeded(arr, rngFromSeed("no-mutate"));
    expect(arr).toEqual(original);
  });

  it("aynı elemanların hepsini (sadece sırası değişmiş olarak) korur", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const shuffled = shuffleSeeded(arr, rngFromSeed("preserve"));
    expect(shuffled.slice().sort()).toEqual(arr.slice().sort());
    expect(shuffled).toHaveLength(arr.length);
  });
});

describe("createSeed", () => {
  it("her çağrıda farklı bir seed üretir", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => createSeed()));
    expect(seeds.size).toBe(20);
  });
});
