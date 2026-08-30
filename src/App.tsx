import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import MainMenu from "./components/MainMenu";
import SoundToggle from "./components/SoundToggle";
import ExitConfirmButton from "./components/ExitConfirmButton";
import ToastStack, { type ToastItem } from "./components/ToastStack";
import { playToast } from "./utils/sound";
import { isMusicEnabled, startMusic } from "./utils/music";
import { clearChallengeFromUrl, readChallengeFromLocation, type ChallengePayload } from "./utils/challenge";
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
const ReviewMode = lazy(() => import("./components/ReviewMode"));
const DailyChallengeMode = lazy(() => import("./components/DailyChallengeMode"));

type AppMode =
  | "menu"
  | "select"
  | "sector-select"
  | "classic"
  | "terms"
  | "rapid"
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
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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

  return (
    <div className="app-shell">
      <div className="bg-blob bg-blob--1" aria-hidden="true" />
      <div className="bg-blob bg-blob--2" aria-hidden="true" />
      <div className="bg-blob bg-blob--3" aria-hidden="true" />

      <SoundToggle />
      {mode !== "menu" && mode !== "select" && mode !== "sector-select" && mode !== "challenge-intro" && (
        <ExitConfirmButton onExit={backToMenu} />
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
              if (selected === "classic") setMode("sector-select");
              else setMode(selected);
            }}
          />
        )}

        {mode === "sector-select" && (
          <SectorSelectScreen
            onBack={() => setMode("select")}
            onSelect={(sector) => startClassic(undefined, sector)}
          />
        )}

        {mode === "terms" && <TermGlobeMode onExit={backToMenu} onAchievement={pushToast} />}

        {mode === "rapid" && <RapidInterviewMode onExit={backToMenu} onAchievement={pushToast} />}

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
    </div>
  );
}
