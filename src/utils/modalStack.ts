// Android donanım/gesture geri tuşu, App.tsx'teki tek bir merkezi listener
// üzerinden yönetiliyor (bkz. App.tsx) — ama MainMenu içindeki modallar
// (Ayarlar, Başarımlar, İstatistiklerim, Kaynakça, Nasıl Oynanır) App'in
// `mode` state'inden bağımsız kendi local state'leriyle açılıp kapanıyor.
// Bu modül, açık bir modal varken geri tuşunun App'in mode-bazlı mantığına
// (örn. ana menüdeyken doğrudan uygulamadan çıkma) düşmeden önce en üstteki
// modalı kapatabilmesi için basit bir yığın (stack) tutar.
type CloseFn = () => void;

// `window` üzerinde tutuluyor: bu modül App.tsx'in eager ana paketiyle
// MainMenu içindeki modalların (Ayarlar vb.) lazy-loaded chunk'larına ayrı
// ayrı dahil edilebiliyor — modül düzeyinde bir dizi kullanılırsa her chunk
// kendi kopyasını alıp iki farklı yığın oluşabilir, push ve pop birbirini
// hiç göremez. Tek bir gerçek `window` her zaman paylaşıldığı için bu riski
// ortadan kaldırıyor.
const globalTarget = window as unknown as { __mulakatModalStack?: CloseFn[] };
if (!globalTarget.__mulakatModalStack) globalTarget.__mulakatModalStack = [];
const stack = globalTarget.__mulakatModalStack;

export function pushModal(close: CloseFn): void {
  stack.push(close);
}

export function popModal(close: CloseFn): void {
  const index = stack.lastIndexOf(close);
  if (index !== -1) stack.splice(index, 1);
}

// En üstteki (en son açılan) modalı kapatır. Kapatılacak bir modal varsa
// true döner — çağıran taraf bu durumda kendi geri tuşu mantığını atlamalı.
export function closeTopModal(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top();
  return true;
}
