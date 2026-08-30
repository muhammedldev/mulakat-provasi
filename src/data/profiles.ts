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

export const statTips: Record<StatKey, string> = {
  hazirlik:
    "Bir sonraki mülakattan önce şirketi, rolü ve olası soruları araştırmaya 30 dakika ayır. STAR yöntemiyle anlatabileceğin 3 hikâye hazırla.",
  iletisim:
    "Cevaplarını 60-90 saniyede toparlamayı hedefle. Aynanın karşısında ya da bir arkadaşınla prova yapmak büyük fark yaratır.",
  ozguven:
    "Hazırladığın hikâyeleri yüksek sesle tekrar et. Küçük başarılarını yazılı bir listeye dökmek, mülakat öncesi özgüveni tazeler.",
};

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
        "Hazırlık, iletişim ve özgüveni dengeli biçimde harmanladın. Bu formda gerçek bir mülakata girsen, karşı taraf notlarını almakla meşgul olurdu.",
    };
  }

  if (tier === "iyi") {
    const byTop: Record<StatKey, Profile> = {
      hazirlik: {
        title: "Ödevini Yapan Aday",
        emoji: "📚",
        rank: "gold",
        description:
          "Araştırman ve hazırlığın gözle görülür seviyede güçlü. Bu temeli biraz daha rahat ve akıcı bir anlatımla birleştirirsen fark yaratırsın.",
      },
      iletisim: {
        title: "Doğal Anlatıcı",
        emoji: "🎙️",
        rank: "gold",
        description:
          "Kendini anlatmakta oldukça rahatsın ve karşı tarafı dinlerken zorlamıyorsun. Hazırlığını biraz daha derinleştirmen seni zirveye taşır.",
      },
      ozguven: {
        title: "Sahne Işıltısı",
        emoji: "✨",
        rank: "gold",
        description:
          "Odaya girdiğinde fark ediliyorsun; özgüvenin doğal ve rahatsız edici değil. Biraz daha somut hazırlıkla bu ışıltıyı destekleyebilirsin.",
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
        "Potansiyelin açıkça belli oluyor ama henüz tüm parçalar birbirine tam oturmamış. Birkaç prova daha yapman, seni bambaşka bir seviyeye taşıyacak.",
    };
  }

  return {
    title: "İlk Prova",
    emoji: "🌱",
    rank: "bronze",
    description:
      "Herkes bir yerden başlar — bu daha ilk provan. Aşağıdaki ipucunu not al, bir kez daha dene; her turda fark yaratacağını göreceksin.",
  };
}
