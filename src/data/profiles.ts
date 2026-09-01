import type { Profile, Rank, StatKey, Stats } from "../types";

export const rankLabels: Record<Rank, string> = {
  bronze: "Bronz Seviye",
  silver: "Gümüş Seviye",
  gold: "Altın Seviye",
  platinum: "Platin Seviye",
};

export const statLabels: Record<StatKey, string> = {
  hazirlik: "Hazırlık",
  iletisim: "İletişim",
  ozguven: "Özgüven",
};

export const statTips: Record<StatKey, string[]> = {
  hazirlik: [
    "Bir sonraki mülakattan önce şirketi, rolü ve olası soruları araştırmaya 30 dakika ayır. STAR yöntemiyle anlatabileceğin 3 hikâye hazırla.",
    "LinkedIn'den şirketin son 1 yıldaki haberlerine göz at, mülakatta bir tanesine değinmek seni diğer adaylardan ayırır.",
    "Kendi CV'ndeki her satır için 'bunu nasıl 2 cümlede anlatırım' diye düşün — hazırlıksız yakalanmak en çok burada oluyor.",
  ],
  iletisim: [
    "Cevaplarını 60-90 saniyede toparlamayı hedefle. Aynanın karşısında ya da bir arkadaşınla prova yapmak büyük fark yaratır.",
    "Bir cevabı bitirdikten sonra 'bu kadar' de ve sustur kendini — dolgu cümlelerle uzatmak, net konuşmaktan daha zayıf bir izlenim bırakır.",
    "Cevabına önce sonucu söyleyerek başla, detayları sonra ekle — dinleyen kişi seni takip etmekte zorlanmaz.",
  ],
  ozguven: [
    "Hazırladığın hikâyeleri yüksek sesle tekrar et. Küçük başarılarını yazılı bir listeye dökmek, mülakat öncesi özgüveni tazeler.",
    "Mülakattan önce son bir haftada iyi yaptığın 3 şeyi hatırla — kafanı doğru yere hazırlamanın en hızlı yolu bu.",
    "Bilmediğin bir soruyla karşılaşırsan panik yapmak yerine 'buna şöyle yaklaşırdım' de — dürüstlük, sahte bir kesinlikten daha güven verici.",
  ],
};

export function pickStatTip(key: StatKey): string {
  const options = statTips[key];
  return options[Math.floor(Math.random() * options.length)];
}

function tierOf(overall: number): "mukemmel" | "iyi" | "orta" | "gelisim" {
  if (overall >= 78) return "mukemmel";
  if (overall >= 62) return "iyi";
  if (overall >= 45) return "orta";
  return "gelisim";
}

function strongest(stats: Stats): StatKey {
  return (Object.keys(stats) as StatKey[]).reduce((a, b) => (stats[a] >= stats[b] ? a : b));
}

export function weakest(stats: Stats): StatKey {
  return (Object.keys(stats) as StatKey[]).reduce((a, b) => (stats[a] <= stats[b] ? a : b));
}

export function overallScore(stats: Stats): number {
  const values = Object.values(stats);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function getProfile(stats: Stats): Profile {
  const tier = tierOf(overallScore(stats));
  const top = strongest(stats);

  if (tier === "mukemmel") {
    return {
      title: "Mülakat Ustası",
      emoji: "🏆",
      rank: "platinum",
      description:
        "Hazırlık, iletişim ve özgüven üçü de yerinde. Bu formda gerçek bir mülakata girsen karşı taraf seni not almakla geçirir.",
    };
  }

  if (tier === "iyi") {
    const byTop: Record<StatKey, Profile> = {
      hazirlik: {
        title: "Ödevini Yapan Aday",
        emoji: "📚",
        rank: "gold",
        description:
          "Araştırman ve hazırlığın gerçekten güçlü. Bu temeli biraz daha rahat, akıcı bir anlatımla birleştirdiğinde fark ortaya çıkar.",
      },
      iletisim: {
        title: "Doğal Anlatıcı",
        emoji: "🎙️",
        rank: "gold",
        description:
          "Kendini anlatmakta rahatsın, karşı tarafı dinlerken de zorlanmıyorsun. Hazırlığını biraz daha derinleştirirsen zirve senin.",
      },
      ozguven: {
        title: "Sahne Işıltısı",
        emoji: "✨",
        rank: "gold",
        description:
          "Odaya girdiğinde fark ediliyorsun, özgüvenin doğal duruyor, zorlama değil. Biraz daha somut hazırlıkla bu ışıltının arkasını doldurursun.",
      },
    };
    return byTop[top];
  }

  if (tier === "orta") {
    return {
      title: "Ham Elmas",
      emoji: "💎",
      rank: "silver",
      description:
        "Potansiyelin belli ama parçalar henüz tam oturmamış. Birkaç prova daha yaparsan fark hemen görülür.",
    };
  }

  return {
    title: "İlk Prova",
    emoji: "🌱",
    rank: "bronze",
    description:
      "Bu daha ilk provan, henüz ısınmadın bile. Aşağıdaki ipucuna bir göz at, tekrar dene.",
  };
}
