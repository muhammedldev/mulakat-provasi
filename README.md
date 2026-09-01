# Mülakat Provası

Üniversite öğrencileri ve yeni mezunlar için bir mülakat pratiği oyunu. React + TypeScript + Vite ile yazıldı, tamamen istemci tarafında çalışıyor — backend yok, hiçbir veri sunucuya gitmiyor.

Canlı: [mulakat-provasi.vercel.app](https://mulakat-provasi.vercel.app/)

## Ne var içinde

Üç ana mod var. **Klasik Mülakat**, üç mülakatçıyla (İK, ekip lideri, işe alım müdürü) sırayla görüşüldüğü 18 soruluk hikâyeli bir prova — kolaydan zora ilerliyor, Hazırlık/İletişim/Özgüven puanları ve sonunda bir rütbe (Bronz'dan Platin'e) veriyor. İsteğe bağlı sektöre özel sorular da (Yazılım, Satış) eklenebiliyor. **Terim Küresi**, süre baskısı olmadan güncel İK terimlerini öğrenme modu. **Seri Mülakat** ise karışık sorularla, azalan sürede, hem doğruluğu hem sakinliği ölçüyor.

Bunların yanında: yanlış cevapladığın soruların biriktiği bir "Zayıf Noktalarım" listesi, günde bir kez sorulan "Günün Sorusu" (streak takibiyle), arkadaşını link üzerinden meydan okumaya davet etme (hiçbir sunucu kullanmadan — her şey URL'ye kodlanıyor), 17 başarım + XP/seviye sistemi, skor geçmişini gösteren bir grafik, kaynakça ekranı (sorular gerçek akademik kaynaklara dayanıyor), sesli okuma, indirilebilir bir PNG sonuç kartı, ve PWA desteği.

## Teknoloji

React 19 + TypeScript, Vite, Capacitor (Android sarmalı için). UI kütüphanesi yok, tasarım elle yazılmış CSS custom properties ile. Sesler (SFX + müzik) Web Audio API ile prosedürel üretiliyor, dış ses dosyası kullanılmıyor. State yönetimi `useReducer` + `useState`, ekstra kütüphane gerekmedi. Her mod `React.lazy()` ile ayrı chunk'a bölünüyor.

## Kurulum

```bash
git clone https://github.com/muhammedldev/mulakat-provasi.git
cd mulakat-provasi
npm install
npm run dev
```

`http://localhost:5173`'ü tarayıcıda aç.

Diğer komutlar:

```bash
npm run build     # dist/ üretir, tsc kontrolü de burada çalışır
npm run preview   # build çıktısını yerelde önizler
npm run lint      # oxlint
npm run test      # vitest
```

Yeni bir soru/terim eklerken `npx tsx scripts/analyze-length-bias.ts` çalıştır — doğru cevabın metin uzunluğuyla ele vermediğini kontrol ediyor. Yazarken fark etmeden en uzun/detaylı şıkkı doğru yapma eğilimi oluyor, script bunu yakalıyor.

## Android

`android/` klasörü tam bir Android Studio projesi olarak repoda duruyor.

```bash
npm run android:sync   # web'i derler + android projesine kopyalar
npm run android:open   # yukarıdakini yapıp Android Studio'yu açar
```

Android Studio'da bir emülatörde çalıştırabilir ya da **Build → Generate Signed App Bundle/APK** ile Play Store için imzalı bir `.aab` üretebilirsin.

İkon/splash `assets/` klasöründeki kaynak görsellerden `@capacitor/assets` ile üretildi; görseller değişirse:

```bash
npx @capacitor/assets generate --android
```

## Yapı

```
public/            PWA ve sosyal paylaşım varlıkları
android/            Capacitor'ın ürettiği Android Studio projesi
assets/             Android ikon/splash kaynak görselleri
scripts/            analyze-length-bias.ts — şık uzunluğu kontrolü

src/
  types.ts          paylaşılan tipler
  data/             soru/terim havuzları, mülakatçılar, rütbeler, başarımlar
  state/            gameReducer.ts — Klasik Mülakat'ın state mantığı
  utils/            localStorage, meydan okuma linki, ses, RNG, PNG üretimi
  components/       ekranlar ve modallar
  index.css         tasarım tokenleri + tüm stiller
```

## Gizlilik

Sunucu tarafı bileşen yok. İlerleme (skor, başarımlar, XP, ayarlar) sadece tarayıcının `localStorage`'ında duruyor. Meydan okuma linki bile sunucu kullanmıyor, her şey URL'ye kodlanıyor.

## Lisans

[MIT](LICENSE)
