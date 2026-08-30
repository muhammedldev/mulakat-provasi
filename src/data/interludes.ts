import type { Interlude } from "../types";

export const interludes: Interlude[] = [
  {
    id: "elif-to-can",
    afterInterviewerId: "elif",
    fromInterviewerId: "elif",
    toInterviewerId: "can",
    lines: [
      "Elif dizüstü bilgisayarını kapatıp gülümsüyor: “Harika gidiyorsun! Şimdi seni ekip liderimiz Can ile buluşturayım.”",
      "Koridorda yürürken Can'ın masasından kahve kokusu ve klavye sesleri geliyor.",
    ],
    replies: [
      {
        text: "“Teşekkürler, açıkçası biraz rahatladım.”",
        response: "Elif gülümser: “Bu tamamen normal, ilk bölüm herkesi biraz gerer.”",
      },
      {
        text: "“Süreç genelde ne kadar sürüyor?”",
        response: "Elif: “Genelde tüm görüşmeler bir hafta içinde tamamlanıyor, merak etme.”",
      },
    ],
  },
  {
    id: "can-to-zeynep",
    afterInterviewerId: "can",
    fromInterviewerId: "can",
    toInterviewerId: "zeynep",
    lines: [
      "Can sandalyesinden kalkıp gülümsüyor: “Gayet iyi düşünüyorsun. Son bölüm için seni Zeynep'e yönlendireyim.”",
      "Ofis mutfağından geçerken bir çalışan sana göz kırpıp fısıldıyor: “Zeynep'in maaş sorusuna hazır ol.”",
    ],
    replies: [
      {
        text: "“Uyardığın için sağ ol.”",
        response: "Çalışan gülümser: “Ne demek, hepimiz bir yerden geçtik.”",
      },
      {
        text: "“Zeynep nasıl biridir?”",
        response: "Can: “Doğrudan ama adil biridir — hazırlıklı olan herkesle iyi anlaşır.”",
      },
    ],
  },
];
