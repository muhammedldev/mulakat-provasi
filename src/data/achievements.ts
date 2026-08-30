import { getBestStreak, getDailyStreak, getGamesPlayed, getXP, unlockAchievement } from "../utils/storage";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  target?: number;
  progress?: () => number;
}

export const achievements: Achievement[] = [
  {
    id: "ilk-prova",
    icon: "🎬",
    title: "İlk Prova",
    description: "İlk mülakat provanı tamamla.",
  },
  {
    id: "kombo-avcisi",
    icon: "🔥",
    title: "Kombo Avcısı",
    description: "Bir oyunda art arda 3 isabetli cevap ver.",
    target: 3,
    progress: () => getBestStreak(),
  },
  {
    id: "hizli-parmaklar",
    icon: "⚡",
    title: "Hızlı Parmaklar",
    description: "Bir soruyu süresinin yarısından erken ve doğru cevapla.",
  },
  {
    id: "tam-puan",
    icon: "🎯",
    title: "Tam Puan",
    description: "Bir kategoride (Hazırlık, İletişim veya Özgüven) 100 puana ulaş.",
  },
  {
    id: "rekor-kirici",
    icon: "🏆",
    title: "Rekor Kırıcı",
    description: "Kendi en iyi skorunu geç.",
  },
  {
    id: "mulakat-ustasi",
    icon: "👑",
    title: "Mülakat Ustası",
    description: "Platin seviyeye (Mülakat Ustası) ulaş.",
  },
  {
    id: "azimli",
    icon: "🧗",
    title: "Azimli",
    description: "Toplamda 10 oyun tamamla.",
    target: 10,
    progress: () => getGamesPlayed(),
  },
  {
    id: "deneyimli",
    icon: "💼",
    title: "Deneyimli",
    description: "Toplamda 500 XP kazan.",
    target: 500,
    progress: () => getXP(),
  },
  {
    id: "terim-ustasi",
    icon: "🔮",
    title: "Terim Ustası",
    description: "Terim Küresi'nde bir turda tüm terimleri doğru bil.",
  },
  {
    id: "sakin-kaptan",
    icon: "🧊",
    title: "Sakin Kaptan",
    description: "Seri Mülakat'ı hem yüksek doğruluk hem yüksek sakinlikle bitir.",
  },
  {
    id: "meydan-okuyucu",
    icon: "🎯",
    title: "Meydan Okuyucu",
    description: "Bir arkadaşını meydan okumaya davet et.",
  },
  {
    id: "seri-sampiyonu",
    icon: "🔥",
    title: "Seri Şampiyonu",
    description: "7 gün üst üste günlük soruyu çöz.",
    target: 7,
    progress: () => getDailyStreak(),
  },
  {
    id: "efsane-avcisi",
    icon: "🌟",
    title: "Efsane Avcısı",
    description: "Efsane zorlukta bir soruyu veya terimi doğru bil.",
  },
  {
    id: "kaynak-kasifi",
    icon: "📚",
    title: "Kaynak Kâşifi",
    description: "Kaynakça'yı aç, sorular ve terimlerin dayandığı kaynakları incele.",
  },
];

export function tryUnlock(id: string, notify: (text: string) => void): void {
  if (unlockAchievement(id)) {
    const achievement = achievements.find((a) => a.id === id);
    if (achievement) {
      notify(`${achievement.icon} Başarım kazandın: ${achievement.title}`);
    }
  }
}

export function tryUnlockProgressBased(notify: (text: string) => void): void {
  achievements.forEach((a) => {
    if (a.target && a.progress && a.progress() >= a.target) {
      tryUnlock(a.id, notify);
    }
  });
}
