import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { App as CapacitorApp, type URLOpenListenerEvent } from "@capacitor/app";
import MainMenu from "./components/MainMenu";
import SoundToggle from "./components/SoundToggle";
import ExitConfirmButton from "./components/ExitConfirmButton";
import ToastStack, { type ToastItem } from "./components/ToastStack";
import { playToast } from "./utils/sound";
import { isMusicEnabled, startMusic } from "./utils/music";
import {
  clearChallengeFromUrl,
  readChallengeFromLocation,
  readChallengeFromUrlString,
  type ChallengePayload,
} from "./utils/challenge";
import { closeTopModal } from "./utils/modalStack";
import type { SectorId } from "./types";

// Ana menü dışındaki her şey dinamik import ile ayrı chunk'lara bölünüyor —
// özellikle Klasik Mülakat (`ClassicGameContainer`) en ağır veri dosyasını
// (data/questions.ts) yüklüyor; bu artık yalnızca kullanıcı gerçekten o moda
// girdiğinde indiriliyor, ana menüye her girişte değil.
const ModeSelectScreen = lazy(() => import("./components/ModeSelectScreen"));
const SectorSelectScreen = lazy(() => import("./components/SectorSelectScreen"));
const ChallengeIntroScreen = lazy(() => import("./components/ChallengeIntroScreen"));
const ClassicGameContainer = lazy(() => import("./components/ClassicGameContainer"));
const TermGlobeMode = lazy(() => import("./components/TermGlobeMode"));
const RapidInterviewMode = lazy(() => import("./components/RapidInterviewMode"));
const SpeakingPracticeMode = lazy(() => import("./components/SpeakingPracticeMode"));
const ReviewMode = lazy(() => import("./components/ReviewMode"));
const DailyChallengeMode = lazy(() => import("./components/DailyChallengeMode"));

type AppMode =
  | "menu"
  | "select"
  | "sector-select"
  | "classic"
  | "terms"
  | "rapid"
  | "speaking"
  | "review"
  | "daily"
  | "challenge-intro";

function initialChallenge(): ChallengePayload | null {
  return readChallengeFromLocation();
}

export default function App() {
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengePayload | null>(initialChallenge);
  const [activeChallenge, setActiveChallenge] = useState<ChallengePayload | null>(null);
  const [mode, setMode] = useState<AppMode>(() => (initialChallenge() ? "challenge-intro" : "menu"));
  const [classicStart, setClassicStart] = useState<{ seed?: string; sector?: SectorId }>({});
  const [rapidSector, setRapidSector] = useState<SectorId | undefined>(undefined);
  // "classic" veya "rapid" seçildiğinde araya giren Sektör Seç ekranının hangi
  // moda geri döneceğini takip eder.
  const [pendingSectorMode, setPendingSectorMode] = useState<"classic" | "rapid" | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [exitConfirming, setExitConfirming] = useState(false);

  useEffect(() => {
    if (!isMusicEnabled()) return;
    // Browsers require a real user gesture before an AudioContext can produce
    // sound, so the loop only starts on the first click/keypress rather than
    // on mount.
    const start = () => {
      startMusic();
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  const pushToast = useCallback((text: string) => {
    playToast();
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const backToMenu = () => {
    setActiveChallenge(null);
    setIncomingChallenge(null);
    clearChallengeFromUrl();
    setMode("menu");
  };

  const startClassic = (seed?: string, sector?: SectorId) => {
    setClassicStart({ seed, sector });
    setMode("classic");
  };

  const acceptChallenge = () => {
    if (!incomingChallenge) return;
    clearChallengeFromUrl();
    setActiveChallenge(incomingChallenge);
    startClassic(incomingChallenge.seed, incomingChallenge.sector);
  };

  const declineChallenge = () => {
    clearChallengeFromUrl();
    setIncomingChallenge(null);
    setMode("menu");
  };

  // Android donanım/gesture geri tuşu için: Capacitor'ın varsayılan davranışı
  // (WebView geçmişinde gidilecek yer yoksa uygulamayı doğrudan kapatmak) bu
  // SPA'da hiç URL değişmediği için her zaman tetikleniyordu — oyunun
  // ortasında bile onay sormadan uygulamadan çıkılıyordu. Geri tuşunu ekrana
  // göre aynı "Geri"/"🚪 Çıkış Onayı" akışlarına yönlendiriyoruz.
  useEffect(() => {
    const listenerPromise = CapacitorApp.addListener("backButton", () => {
      // MainMenu içindeki modallar (Ayarlar, Başarımlar, İstatistiklerim,
      // Kaynakça, Nasıl Oynanır) App'in `mode`'undan bağımsız kendi local
      // state'leriyle açılıyor — bu yüzden mode-bazlı switch'ten önce açık
      // bir modal varsa onu kapatmak yeterli, aksi halde örn. ana menüde
      // bir modal açıkken geri tuşu doğrudan uygulamadan çıkardı.
      if (closeTopModal()) return;
      if (exitConfirming) {
        setExitConfirming(false);
        return;
      }
      switch (mode) {
        case "menu":
          CapacitorApp.exitApp();
          return;
        case "select":
          backToMenu();
          return;
        case "sector-select":
          setMode("select");
          return;
        case "challenge-intro":
          declineChallenge();
          return;
        default:
          setExitConfirming(true);
      }
    });
    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, [mode, exitConfirming]);

  // Android App Links: bir arkadaş "Arkadaşını Meydan Oku" linkine
  // (https://mulakat-provasi.vercel.app/?duel=...) tıklayıp bu uygulama
  // yüklüyse, link tarayıcıda değil doğrudan uygulamada açılır. WebView
  // gerçek domaini hiç yüklemediği (her zaman https://localhost) için
  // `window.location`'dan okuma çalışmaz — Capacitor'ın `appUrlOpen`
  // event'i native tarafın yakaladığı gerçek URL'i JS'e taşıyor, meydan
  // okuma verisi buradan elle çıkarılıyor. Bu event yalnızca uygulama ZATEN
  // çalışırken ("warm" — Activity `onNewIntent` alır) tetikleniyor; uygulama
  // linkle SIFIRDAN açıldığında ("cold start") `appUrlOpen` hiç ateşlenmiyor
  // — native taraf o durumda URL'i yalnızca `getLaunchUrl()` ile senkron
  // olmayan bir çağrı sonucunda veriyor, bu yüzden ayrıca kontrol ediliyor.
  useEffect(() => {
    const listenerPromise = CapacitorApp.addListener("appUrlOpen", (data: URLOpenListenerEvent) => {
      const challenge = readChallengeFromUrlString(data.url);
      if (!challenge) return;
      setIncomingChallenge(challenge);
      setMode("challenge-intro");
    });
    CapacitorApp.getLaunchUrl().then((result) => {
      if (!result?.url) return;
      const challenge = readChallengeFromUrlString(result.url);
      if (!challenge) return;
      setIncomingChallenge(challenge);
      setMode("challenge-intro");
    });
    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, []);

  return (
    <main className="app-shell">
      <div className="bg-blob bg-blob--1" aria-hidden="true" />
      <div className="bg-blob bg-blob--2" aria-hidden="true" />
      <div className="bg-blob bg-blob--3" aria-hidden="true" />

      <SoundToggle />
      {mode !== "menu" && mode !== "select" && mode !== "sector-select" && mode !== "challenge-intro" && (
        <ExitConfirmButton
          confirming={exitConfirming}
          onRequestConfirm={() => setExitConfirming(true)}
          onCancel={() => setExitConfirming(false)}
          onExit={() => {
            setExitConfirming(false);
            backToMenu();
          }}
        />
      )}
      <ToastStack toasts={toasts} />

      {mode === "menu" && (
        <MainMenu
          onStart={() => setMode("select")}
          onOpenReview={() => setMode("review")}
          onOpenDaily={() => setMode("daily")}
          onAchievement={pushToast}
        />
      )}

      <Suspense fallback={null}>
        {mode === "challenge-intro" && incomingChallenge && (
          <ChallengeIntroScreen challenge={incomingChallenge} onAccept={acceptChallenge} onDecline={declineChallenge} />
        )}

        {mode === "review" && <ReviewMode onExit={backToMenu} />}

        {mode === "daily" && <DailyChallengeMode onExit={backToMenu} />}

        {mode === "select" && (
          <ModeSelectScreen
            onBack={backToMenu}
            onSelect={(selected) => {
              if (selected === "classic" || selected === "rapid") {
                setPendingSectorMode(selected);
                setMode("sector-select");
              } else {
                setMode(selected);
              }
            }}
          />
        )}

        {mode === "sector-select" && (
          <SectorSelectScreen
            badge={pendingSectorMode === "rapid" ? "⚡ Seri Mülakat" : "🎭 Klasik Mülakat"}
            onBack={() => setMode("select")}
            onSelect={(sector) => {
              if (pendingSectorMode === "rapid") {
                setRapidSector(sector);
                setMode("rapid");
              } else {
                startClassic(undefined, sector);
              }
            }}
          />
        )}

        {mode === "terms" && <TermGlobeMode onExit={backToMenu} onAchievement={pushToast} />}

        {mode === "rapid" && <RapidInterviewMode sector={rapidSector} onExit={backToMenu} onAchievement={pushToast} />}

        {mode === "speaking" && <SpeakingPracticeMode onExit={backToMenu} />}

        {mode === "classic" && (
          <ClassicGameContainer
            initialSeed={classicStart.seed}
            initialSector={classicStart.sector}
            activeChallenge={activeChallenge}
            onExitToMenu={backToMenu}
            onAchievement={pushToast}
            onRestart={() => setActiveChallenge(null)}
          />
        )}
      </Suspense>
    </main>
  );
}
