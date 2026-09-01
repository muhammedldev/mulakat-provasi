const MISTAKES_KEY = "mulakat-provasi-mistakes";
const FIXED_COUNT_KEY = "mulakat-provasi-mistakes-fixed";

// Bilerek hafif tutuldu — soru/terim havuzlarına (data/questions.ts vb.) hiç
// import yapmıyor. `getMistakeCount()` ana menüde her render'da çağrılıyor;
// buraya ağır veri importu eklemek, sadece rozet sayısını göstermek için tüm
// soru bankasının ana menü paketine sürüklenmesine yol açar. Havuzlara ihtiyaç
// duyan asıl "Zayıf Noktalarım" içerik dönüşümü `utils/reviewItems.ts`'te.
export function getMistakeMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const sanitized: Record<string, number> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([id, count]) => {
      if (typeof count === "number" && Number.isFinite(count)) sanitized[id] = count;
    });
    return sanitized;
  } catch {
    return {};
  }
}

function saveMistakeMap(map: Record<string, number>): void {
  try {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function recordMistake(id: string): void {
  const map = getMistakeMap();
  map[id] = (map[id] ?? 0) + 1;
  saveMistakeMap(map);
}

export function clearMistake(id: string): void {
  const map = getMistakeMap();
  if (id in map) {
    delete map[id];
    saveMistakeMap(map);
    try {
      localStorage.setItem(FIXED_COUNT_KEY, String(getFixedCount() + 1));
    } catch {
      /* ignore */
    }
  }
}

export function getMistakeCount(): number {
  return Object.keys(getMistakeMap()).length;
}

// "Zayıf Noktalarım" listesinden ömür boyu doğru cevaplanarak çıkarılan
// soru/terim sayısı — mevcut anlık listeden farklı olarak hiç azalmaz,
// başarım ilerlemesini takip etmek için kullanılıyor.
export function getFixedCount(): number {
  try {
    return Number(localStorage.getItem(FIXED_COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function clearAllMistakes(): void {
  try {
    localStorage.removeItem(MISTAKES_KEY);
    localStorage.removeItem(FIXED_COUNT_KEY);
  } catch {
    /* ignore */
  }
}
