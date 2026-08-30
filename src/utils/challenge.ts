import type { Rank, SectorId } from "../types";

export interface ChallengePayload {
  seed: string;
  score: number;
  rank: Rank;
  title: string;
  sector?: SectorId;
}

const PARAM = "duel";
const VALID_RANKS: Rank[] = ["bronze", "silver", "gold", "platinum"];
const VALID_SECTORS: SectorId[] = ["yazilim", "satis-pazarlama"];
const MAX_TITLE_LENGTH = 60;

export function encodeChallenge(payload: ChallengePayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeChallenge(code: string): ChallengePayload | null {
  try {
    const data = JSON.parse(decodeURIComponent(atob(code)));
    if (
      typeof data.seed === "string" &&
      data.seed.length > 0 &&
      typeof data.score === "number" &&
      Number.isFinite(data.score) &&
      data.score >= 0 &&
      data.score <= 100 &&
      typeof data.title === "string" &&
      data.title.length > 0 &&
      data.title.length <= MAX_TITLE_LENGTH &&
      VALID_RANKS.includes(data.rank) &&
      (data.sector === undefined || VALID_SECTORS.includes(data.sector))
    ) {
      return data as ChallengePayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildChallengeUrl(payload: ChallengePayload): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set(PARAM, encodeChallenge(payload));
  return url.toString();
}

export function readChallengeFromLocation(): ChallengePayload | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get(PARAM);
  if (!code) return null;
  return decodeChallenge(code);
}

export function clearChallengeFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PARAM)) return;
  url.searchParams.delete(PARAM);
  window.history.replaceState({}, "", url.toString());
}
