import { beforeEach, describe, expect, it, vi } from "vitest";
import { closeTopModal, popModal, pushModal } from "./modalStack";

// Bu modül, 19. turda bulunan gerçek bir Android bug'ının düzeltmesi: ana menü
// modalları (Ayarlar vb.) açıkken donanım geri tuşu, modalı kapatmak yerine
// uygulamayı doğrudan kapatıyordu. Regresyona karşı en kritik davranış: birden
// fazla modal aynı anda "açık" olabilir, closeTopModal HER ZAMAN en son
// açılanı (üstteki) kapatmalı.
//
// ÖNEMLİ: closeTopModal() kendi başına stack'ten çıkarma yapmaz — gerçek
// kullanımda (Modal.tsx) bu, verilen onClose'un state güncelleyip component'i
// unmount etmesine, o da useEffect cleanup'ının popModal çağırmasına bağlıdır.
// Testte bu zinciri taklit etmek için her mock close fonksiyonu kendini
// popModal ile çıkarmalı — aksi halde closeTopModal() hep aynı elemanı
// kapatmaya çalışır ve onu çağıran bir döngü asla bitmez.
function pushMockModal() {
  const close = vi.fn(() => popModal(close));
  pushModal(close);
  return close;
}

describe("modalStack", () => {
  beforeEach(() => {
    // Stack, önceki testlerden kalan kapatma fonksiyonlarını taşımasın diye
    // her testten önce tamamen boşaltılıyor (her mock kendini popModal ile
    // çıkardığı için bu döngü sonlu).
    while (closeTopModal()) {
      /* boşalt */
    }
  });

  it("açık modal yokken closeTopModal false döner", () => {
    expect(closeTopModal()).toBe(false);
  });

  it("tek bir modal açıkken closeTopModal onu kapatır ve true döner", () => {
    const close = pushMockModal();
    expect(closeTopModal()).toBe(true);
    expect(close).toHaveBeenCalledOnce();
  });

  it("birden fazla modal açıkken closeTopModal yalnızca EN ÜSTTEKİNİ (en son açılanı) kapatır", () => {
    const closeFirst = pushMockModal();
    const closeSecond = pushMockModal();

    expect(closeTopModal()).toBe(true);
    expect(closeSecond).toHaveBeenCalledOnce();
    expect(closeFirst).not.toHaveBeenCalled();

    expect(closeTopModal()).toBe(true);
    expect(closeFirst).toHaveBeenCalledOnce();
  });

  it("popModal, kapatmadan sadece yığından çıkarır — bileşen unmount olduğunda kullanılan yol", () => {
    const close = vi.fn();
    pushModal(close);
    popModal(close);
    expect(closeTopModal()).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });

  it("aynı onClose referansı birden fazla kez push edilirse, popModal yalnızca en son eklenen kopyayı çıkarır", () => {
    const close = vi.fn();
    pushModal(close);
    pushModal(close);
    popModal(close);
    // Bir kopya hâlâ yığında olmalı.
    expect(closeTopModal()).toBe(true);
    expect(close).toHaveBeenCalledOnce();
  });
});
