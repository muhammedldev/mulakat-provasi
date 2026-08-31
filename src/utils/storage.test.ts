import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addXP, getDailyStreak, getXP, hasPlayedToday, levelFromXP, recordDailyPlay } from "./storage";

describe("recordDailyPlay / getDailyStreak / hasPlayedToday", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ilk oynanışta seriyi 1 yapar", () => {
    vi.setSystemTime(new Date("2026-01-10T10:00:00Z"));
    expect(recordDailyPlay()).toBe(1);
    expect(getDailyStreak()).toBe(1);
    expect(hasPlayedToday()).toBe(true);
  });

  it("aynı gün içinde tekrar tekrar çağrılırsa seriyi artırmaz", () => {
    vi.setSystemTime(new Date("2026-01-10T10:00:00Z"));
    recordDailyPlay();
    vi.setSystemTime(new Date("2026-01-10T23:59:00Z"));
    expect(recordDailyPlay()).toBe(1);
    expect(getDailyStreak()).toBe(1);
  });

  it("ardışık bir sonraki gün oynanırsa seriyi 1 artırır", () => {
    vi.setSystemTime(new Date("2026-01-10T10:00:00Z"));
    recordDailyPlay();
    vi.setSystemTime(new Date("2026-01-11T09:00:00Z"));
    expect(recordDailyPlay()).toBe(2);
    expect(getDailyStreak()).toBe(2);
  });

  it("bir gün atlanırsa seri 1'e sıfırlanır — düzeltmez, baştan başlar", () => {
    vi.setSystemTime(new Date("2026-01-10T10:00:00Z"));
    recordDailyPlay();
    vi.setSystemTime(new Date("2026-01-13T10:00:00Z")); // 3 gün sonra, arada boşluk var
    expect(recordDailyPlay()).toBe(1);
    expect(getDailyStreak()).toBe(1);
  });

  it("hiç oynanmadıysa hasPlayedToday false, getDailyStreak 0 döner", () => {
    vi.setSystemTime(new Date("2026-01-10T10:00:00Z"));
    expect(hasPlayedToday()).toBe(false);
    expect(getDailyStreak()).toBe(0);
  });
});

describe("XP / seviye hesaplama", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("addXP birikimli olarak artar ve negatife düşmez", () => {
    expect(addXP(100)).toBe(100);
    expect(addXP(80)).toBe(180);
    expect(addXP(-1000)).toBe(0);
    expect(getXP()).toBe(0);
  });

  it("levelFromXP her 150 XP'de bir seviye atlatır", () => {
    expect(levelFromXP(0)).toEqual({ level: 1, intoLevel: 0, forNextLevel: 150 });
    expect(levelFromXP(149)).toEqual({ level: 1, intoLevel: 149, forNextLevel: 150 });
    expect(levelFromXP(150)).toEqual({ level: 2, intoLevel: 0, forNextLevel: 150 });
    expect(levelFromXP(301)).toEqual({ level: 3, intoLevel: 1, forNextLevel: 150 });
  });
});
