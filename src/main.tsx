import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applySettings } from './utils/settings.ts'

applySettings()

// Uygulama route/mod bazlı code-splitting (React.lazy) kullanıyor — bir
// ziyaretçinin sekmesi eski bir deploy'un dosyalarını önbellekten (PWA
// service worker) sunmaya devam ederken yeni bir sürüm yayınlanırsa, henüz
// hiç girilmemiş bir modun chunk'ı artık sunucuda o eski hash'le
// bulunmayabilir (404). Vite bu durumda "vite:preloadError" fırlatıyor;
// tek güvenilir çözüm sayfayı yeniden yüklemek (yeni service worker/HTML
// devreye girer, tüm chunk referansları güncel hash'lere döner).
window.addEventListener('vite:preloadError', () => {
  // Gerçekten bozuk bir deploy'da (yenileme de sorunu çözmüyorsa) sonsuz
  // yenileme döngüsüne düşmemek için tek seferlik bir bayrak kullanılıyor.
  const key = 'mulakat-provasi-preload-reload'
  if (sessionStorage.getItem(key)) return
  sessionStorage.setItem(key, '1')
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Uygulama bir süre sorunsuz çalıştıysa, yenilemenin işe yaradığı kabul
// edilip bayrak temizleniyor — aksi halde günler sonra açık kalan bir
// sekmede gerçekten yeni bir deploy sonrası oluşacak bir sonraki
// preloadError'da yenileme hiç tetiklenmez.
setTimeout(() => sessionStorage.removeItem('mulakat-provasi-preload-reload'), 10000)
