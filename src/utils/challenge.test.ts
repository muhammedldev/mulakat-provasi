import { beforeEach, describe, expect, it } from "vitest";
import {
  buildChallengeUrl,
  clearChallengeFromUrl,
  decodeChallenge,
  encodeChallenge,
  readChallengeFromLocation,
  readChallengeFromUrlString,
  type ChallengePayload,
} from "./challenge";

const validPayload: ChallengePayload = {
  seed: "abc123",
  score: 75,
  rank: "gold",
  title: "Test Oyuncu",
};

describe("encodeChallenge / decodeChallenge", () => {
  it("bir payload'ı encode edip geri decode edince aynı veriyi verir", () => {
    const code = encodeChallenge(validPayload);
    expect(decodeChallenge(code)).toEqual(validPayload);
  });

  it("sektör alanı olan bir payload'ı da doğru round-trip eder", () => {
    const withSector: ChallengePayload = { ...validPayload, sector: "yazilim" };
    const code = encodeChallenge(withSector);
    expect(decodeChallenge(code)).toEqual(withSector);
  });

  it("bozuk/rastgele bir string'i null olarak reddeder", () => {
    expect(decodeChallenge("bu-gecerli-bir-base64-degil-%%%")).toBeNull();
  });

  it("geçersiz bir rank değerini reddeder — elle bozulmuş bir link Rank enum'ında olmayan bir değer taşıyabilir", () => {
    const tampered = btoa(encodeURIComponent(JSON.stringify({ ...validPayload, rank: "diamond" })));
    expect(decodeChallenge(tampered)).toBeNull();
  });

  it("geçersiz bir sektör değerini reddeder", () => {
    const tampered = btoa(encodeURIComponent(JSON.stringify({ ...validPayload, sector: "finans" })));
    expect(decodeChallenge(tampered)).toBeNull();
  });

  it("skor 0-100 aralığının dışındaysa reddeder", () => {
    const tooHigh = btoa(encodeURIComponent(JSON.stringify({ ...validPayload, score: 150 })));
    const negative = btoa(encodeURIComponent(JSON.stringify({ ...validPayload, score: -5 })));
    expect(decodeChallenge(tooHigh)).toBeNull();
    expect(decodeChallenge(negative)).toBeNull();
  });

  it("boş title'ı reddeder", () => {
    const tampered = btoa(encodeURIComponent(JSON.stringify({ ...validPayload, title: "" })));
    expect(decodeChallenge(tampered)).toBeNull();
  });
});

describe("readChallengeFromUrlString", () => {
  it("Android App Links üzerinden gelen tam bir URL'den meydan okuma verisini doğru çıkarır", () => {
    const code = encodeChallenge(validPayload);
    const url = `https://mulakat-provasi.vercel.app/?duel=${encodeURIComponent(code)}`;
    expect(readChallengeFromUrlString(url)).toEqual(validPayload);
  });

  it("duel parametresi olmayan bir URL için null döner", () => {
    expect(readChallengeFromUrlString("https://mulakat-provasi.vercel.app/")).toBeNull();
  });

  it("geçersiz bir URL string'inde çökmeden null döner", () => {
    expect(readChallengeFromUrlString("bu-hic-bir-url-degil")).toBeNull();
  });
});

describe("buildChallengeUrl / readChallengeFromLocation / clearChallengeFromUrl (window.location üzerinden)", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("üretilen URL'i window.location'a koyunca aynı payload okunabiliyor", () => {
    const url = buildChallengeUrl(validPayload);
    const parsed = new URL(url);
    window.history.replaceState({}, "", parsed.pathname + parsed.search);
    expect(readChallengeFromLocation()).toEqual(validPayload);
  });

  it("clearChallengeFromUrl duel parametresini temizler, sonraki okuma null döner", () => {
    const url = buildChallengeUrl(validPayload);
    const parsed = new URL(url);
    window.history.replaceState({}, "", parsed.pathname + parsed.search);
    clearChallengeFromUrl();
    expect(readChallengeFromLocation()).toBeNull();
    expect(window.location.search).toBe("");
  });
});
