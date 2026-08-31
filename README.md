# 🎤 Mülakat Provası

Üniversite öğrencileri ve yeni mezunlar için **akademik kaynaklara dayanan**, gamified bir mülakat pratiği oyunu. **React + TypeScript + Vite** ile yazıldı, tamamen istemci taraflı (client-side) çalışır — hiçbir backend'e ihtiyaç duymaz, hiçbir veri sunucuya gitmez.

**Canlı:** [mulakat-provasi.vercel.app](https://mulakat-provasi.vercel.app/)

## Özellikler

### 3 ana oyun modu

- **🎭 Klasik Mülakat** — 3 farklı mülakatçı (İK Uzmanı, Ekip Lideri, İşe Alım Müdürü) ile sırayla görüşülen, hikâyeli 18 soruluk bir prova. Her bölüm kolaydan zora ilerler; Hazırlık/İletişim/Özgüven istatistikleri, kombo bonusu ve sonunda bir rütbe (Bronz → Platin) kazandırır. İsteğe bağlı olarak **sektöre özel sorularla** (Yazılım & Teknoloji, Satış & Pazarlama) zenginleştirilebilir.
- **🔮 Terim Küresi** — süre baskısı olmadan, güncel İK/iş dünyası terimlerini (Quiet Quitting, Skills-Based Hiring, Pay Transparency gibi) öğrenme modu.
- **⚡ Seri Mülakat** — karışık sorular (uygulama, teorik, vaka analizi, öz-yönetim), her soruda azalan süre; hem doğruluk hem "sakinlik" (composure) birlikte değerlendirilip 4 farklı performans profilinden biri veriliyor.

### Ek modlar ve özellikler

- **🔁 Zayıf Noktalarım** — herhangi bir modda yanlış cevaplanan her soru/terim otomatik birikir, doğru cevaplanınca listeden çıkar.
- **📅 Günün Sorusu** — tarihe göre deterministik seçilen, günde bir kez sorulan tek soru; günlük seri (streak) takibi.
- **🎯 Arkadaşını Meydan Oku** — seed'lenmiş (deterministik) bir RNG ile, paylaşılan bir link üzerinden arkadaşınıza *birebir aynı* soru setini çözdürüp skorları karşılaştırabilirsiniz — hiçbir veri sunucuya gitmeden, tamamen URL üzerinden.
- **🏆 Başarımlar, seviye ve XP** — 14 başarım, XP tabanlı seviye sistemi, kural tabanlı (yapay zeka kullanmayan) kişiselleştirilmiş gelişim önerileri.
- **📊 İstatistiklerim** — zaman içindeki skor ilerlemesini gösteren, bağımlılıksız bir SVG çizgi grafik.
- **📚 Kaynakça** — teorik/efsane içeriklerin dayandığı gerçek akademik kaynaklar (yazar + yıl), ayrı bir ekranda listeleniyor.
- **🔊 Sesli okuma** — sorular Web Speech API ile sesli okunabilir.
- **📄 Paylaşılabilir sonuç raporu** — Canvas ile üretilen, indirilebilir bir PNG özet kartı.
- **PWA desteği** — ana ekrana eklenebilir, service worker ile temel çevrimdışı önbellekleme.
- **Koyu/açık tema, büyük yazı ve azaltılmış hareket** ayarları; tüm veriler yalnızca `localStorage`'da tutulur.

## Teknoloji yığını

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) (build & dev server) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Framer Motion](https://motion.dev/) — animasyonlar
- Harici bir UI kütüphanesi veya CSS framework yok — tasarım sistemi elle yazılmış CSS custom properties ile kurulu
- Ses (SFX + arka plan müziği) tamamen Web Audio API ile prosedürel olarak üretiliyor, dış ses dosyası yok
- State yönetimi: `useReducer` (Klasik Mülakat) + bileşen bazlı `useState` (diğer modlar) — ek bir kütüphane gerekmiyor
- Mod bazlı `React.lazy()` code-splitting: ana menü dışındaki her ekran/modal ayrı bir chunk'ta, yalnızca gerçekten girildiğinde indiriliyor

## Başlarken

Gereksinimler: [Node.js](https://nodejs.org/) 18 veya üzeri (LTS önerilir) ve npm.

```bash
git clone https://github.com/muhammedldev/mulakat-provasi.git
cd mulakat-provasi
npm install
npm run dev
```

Terminalde görünen adresi (varsayılan `http://localhost:5173`) tarayıcınızda açın.

### Diğer komutlar

```bash
npm run build     # Üretim için derler (dist/ klasörü), TypeScript tip kontrolü de burada çalışır
npm run preview   # build çıktısını yerelde önizler
npm run lint      # oxlint ile statik analiz
```

### Kalite kontrol script'i

```bash
npx tsx scripts/analyze-length-bias.ts
```

Yeni bir soru/terim eklendiğinde, doğru cevabın metin uzunluğu bakımından şıklar arasında öne çıkmadığını (bilgiye gerek kalmadan tahmin edilebilir olmadığını) doğrular.

## Proje yapısı

```
public/
  favicon.svg, pwa-*.png, og-image.jpg     PWA ve sosyal paylaşım varlıkları

scripts/
  analyze-length-bias.ts                   soru/terim şıklarında uzunluk önyargısı kontrolü

src/
  types.ts                        Soru, terim, istatistik vb. paylaşılan tipler
  data/
    questions.ts                   Klasik Mülakat soru havuzu + buildGameQuestions()
    sectorQuestions.ts             Sektöre özel (Yazılım/Satış) sorular
    sectors.ts                     Sektör meta verisi
    rapidQuestions.ts              Seri Mülakat soru havuzu + buildRapidQuestions()
    terms.ts                       Terim Küresi terimleri
    achievements.ts                14 başarımın tanımı ve kilit açma mantığı
    interviewers.ts, interludes.ts, profiles.ts   Mülakatçı/ara sahne/rütbe verisi
  state/
    gameReducer.ts                  Klasik Mülakat'ın tüm state mantığı (useReducer)
  utils/
    storage.ts, insights.ts, mistakes.ts, reviewItems.ts   localStorage ve ilerleme mantığı
    challenge.ts                    Arkadaşını Meydan Oku linki encode/decode
    sound.ts, music.ts, speech.ts   Web Audio API ses efektleri, müzik, sesli okuma
    rng.ts                          Seed'lenmiş deterministik RNG
    shareImage.ts                    Canvas ile PNG sonuç raporu üretimi
  components/
    App.tsx (kök), MainMenu, ModeSelectScreen, SectorSelectScreen   gezinme ekranları
    ClassicGameContainer, GameScreen, RoundIntroScreen, InterludeScene, ResultScreen
    TermGlobeMode, RapidInterviewMode, ReviewMode, DailyChallengeMode, ChallengeIntroScreen
    HowToPlayModal, AchievementsModal, StatsModal, SettingsModal, ReferencesModal   modallar
    InterviewerCharacter.tsx        el yapımı SVG mülakatçı karakterleri
  index.css                        tasarım tokenleri + tüm bileşen stilleri
```

## Gizlilik notu

Bu proje sunucu tarafı bir bileşen içermez. Hiçbir kullanıcı verisi ağ üzerinden gönderilmez;
ilerleme durumu (skor, başarımlar, XP, ayarlar) yalnızca tarayıcının `localStorage`'ında tutulur.
"Arkadaşını Meydan Oku" özelliği bile bir sunucu kullanmaz — tüm bilgi paylaşılan linkin
içine (URL) kodlanır.

## Lisans

[MIT](LICENSE) — dilediğiniz gibi kullanabilir, değiştirebilir ve dağıtabilirsiniz.
