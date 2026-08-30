const DAILY_DONE_KEY = "mulakat-provasi-daily-done";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function dailySeedIndex(poolLength: number): number {
  return hashString(todayKey()) % poolLength;
}

export function hasCompletedDailyToday(): boolean {
  try {
    return localStorage.getItem(DAILY_DONE_KEY) === todayKey();
  } catch {
    return false;
  }
}

export function markDailyCompletedToday(): void {
  try {
    localStorage.setItem(DAILY_DONE_KEY, todayKey());
  } catch {
    /* ignore */
  }
}

export function clearDailyDone(): void {
  try {
    localStorage.removeItem(DAILY_DONE_KEY);
  } catch {
    /* ignore */
  }
}
