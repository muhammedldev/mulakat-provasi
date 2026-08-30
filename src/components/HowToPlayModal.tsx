import Modal from "./Modal";

export default function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="📖 Nasıl Oynanır" onClose={onClose}>
      <p className="reference-section-title">🎭 Klasik Mülakat</p>
      <ul className="howto-list">
        <li>
          <strong>3 mülakatçı, 3 bölüm.</strong> Elif (İK Uzmanı), Can (Ekip Lideri) ve Zeynep
          (İşe Alım Müdürü) ile sırayla görüşürsün. Her bölüm kendi içinde kolaydan zora ilerler.
        </li>
        <li>
          <strong>İstersen bir sektör seç.</strong> Başlamadan önce Genel, Yazılım & Teknoloji veya
          Satış & Pazarlama seçebilirsin — seçtiğin sektöre özel birkaç soru genel havuza karışır.
        </li>
        <li>
          <strong>Süreni yönet.</strong> Her sorunun bir zamanlayıcısı var; süre dolarsa otomatik
          olarak en zayıf seçenek işlenir.
        </li>
        <li>
          <strong>3 istatistik.</strong> Her seçimin <em>Hazırlık</em>, <em>İletişim</em> ve{" "}
          <em>Özgüven</em> puanlarını farklı yönde etkiler — bazen ikisi arasında seçim yapman
          gerekir.
        </li>
        <li>
          <strong>Kombo yakala.</strong> Art arda 3 isabetli cevap, tüm istatistiklere bonus
          kazandırır.
        </li>
        <li>
          <strong>1-4 tuşları ve Enter.</strong> Klavyeyle de oynayabilirsin: seçenek için sayı
          tuşları, devam etmek için Enter.
        </li>
        <li>
          <strong>Sonunda</strong> genel skoruna göre bir rütbe (Bronz → Platin) ve kişiselleştirilmiş
          bir gelişim ipucu kazanırsın. Sonuç ekranından bir arkadaşını "aynı soruları çöz, beni geç"
          diye meydan okumaya davet edebilir, ya da özet raporunu indirebilirsin.
        </li>
      </ul>

      <p className="reference-section-title">🔮 Terim Küresi</p>
      <ul className="howto-list">
        <li>
          Süre ve baskı yok — küreye dokunup sırayla 10 İK/iş dünyası terimi çekiyorsun, her
          cevaptan sonra (doğru ya da yanlış) açıklamasını görüyorsun. Amaç öğrenmek.
        </li>
      </ul>

      <p className="reference-section-title">⚡ Seri Mülakat</p>
      <ul className="howto-list">
        <li>
          16 karışık soru (uygulama, teorik, vaka analizi, öz-yönetim) art arda geliyor, her
          sorunun süresi bir öncekinden biraz daha kısa. Amaç mükemmel olmak değil, baskı arttıkça
          hem doğruluğunu hem sakinliğini koruyabilmek.
        </li>
      </ul>

      <p className="reference-section-title">Diğer özellikler</p>
      <ul className="howto-list">
        <li>
          <strong>🔁 Zayıf Noktalarım.</strong> Herhangi bir modda yanlış cevapladığın her soru/terim
          burada birikir; doğru cevaplarsan listeden çıkar.
        </li>
        <li>
          <strong>📅 Günün Sorusu.</strong> Günde bir kez, herkese aynı gün aynı tek soru — düzenli
          oynayarak günlük serini büyütebilirsin.
        </li>
        <li>
          <strong>🔊 Sesli oku.</strong> Soruların yanındaki hoparlör simgesi, metni senin için
          sesli okur.
        </li>
        <li>
          <strong>🏆 Başarımlar, seviye ve XP.</strong> Oynadıkça XP kazanır, seviye atlarsın;
          belirli hedefleri tutturunca başarımların açılır — hepsi ana menüden takip edilebilir.
        </li>
      </ul>
    </Modal>
  );
}
