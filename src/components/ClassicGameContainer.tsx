import { useReducer } from "react";
import { interviewers } from "../data/interviewers";
import { interludes } from "../data/interludes";
import { gameReducer, createInitialGameState } from "../state/gameReducer";
import RoundIntroScreen from "./RoundIntroScreen";
import InterludeScene from "./InterludeScene";
import GameScreen from "./GameScreen";
import ResultScreen from "./ResultScreen";
import type { AnswerOption, SectorId } from "../types";
import type { ChallengePayload } from "../utils/challenge";

// Klasik Mülakat, en ağır veri dosyasını (data/questions.ts — 70+ soru, her
// biri uzun metinlerle) kullanan tek mod. Bu bileşen App.tsx'te React.lazy
// ile dinamik import edildiği için, o veri artık yalnızca kullanıcı gerçekten
// Klasik Mülakat'a girdiğinde indiriliyor — ana menüde veya diğer modlarda
// hiç indirilmiyor.

export default function ClassicGameContainer({
  initialSeed,
  initialSector,
  activeChallenge,
  onExitToMenu,
  onAchievement,
  onRestart,
}: {
  initialSeed?: string;
  initialSector?: SectorId;
  activeChallenge: ChallengePayload | null;
  onExitToMenu: () => void;
  onAchievement: (text: string) => void;
  onRestart: () => void;
}) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { seed: initialSeed, sector: initialSector },
    (init) => createInitialGameState(init.seed, init.sector)
  );

  const handleAnswer = (option: AnswerOption) => dispatch({ type: "ANSWER", option });
  const handleContinue = () => dispatch({ type: "CONTINUE" });
  const handleTimeout = () => dispatch({ type: "TIMEOUT" });
  const handleRestart = () => {
    onRestart();
    dispatch({ type: "RESTART" });
  };

  const totalQuestions = state.questions.length;
  const currentQuestion = state.questions[state.questionIndex];
  const currentInterviewer = interviewers.find((p) => p.id === currentQuestion.interviewerId)!;
  const roundNumber = interviewers.findIndex((p) => p.id === currentQuestion.interviewerId) + 1;

  const activeInterlude =
    state.phase === "interlude"
      ? interludes.find((i) => i.afterInterviewerId === currentQuestion.interviewerId)
      : undefined;

  return (
    <>
      {state.phase === "interlude" && activeInterlude && (
        <InterludeScene
          interlude={activeInterlude}
          fromInterviewer={interviewers.find((p) => p.id === activeInterlude.fromInterviewerId)!}
          toInterviewer={interviewers.find((p) => p.id === activeInterlude.toInterviewerId)!}
          onDone={() => dispatch({ type: "INTERLUDE_DONE" })}
        />
      )}

      {state.phase === "round-intro" && (
        <RoundIntroScreen
          interviewer={currentInterviewer}
          roundNumber={roundNumber}
          onReady={() => dispatch({ type: "ROUND_READY" })}
        />
      )}

      {(state.phase === "question" || state.phase === "feedback") && (
        <GameScreen
          question={currentQuestion}
          interviewer={currentInterviewer}
          questionIndex={state.questionIndex}
          totalQuestions={totalQuestions}
          stats={state.stats}
          phase={state.phase}
          lastOption={state.lastOption}
          streak={state.streak}
          comboBonusApplied={state.comboBonusApplied}
          timedOut={state.timedOut}
          onAnswer={handleAnswer}
          onTimeout={handleTimeout}
          onContinue={handleContinue}
          onAchievement={onAchievement}
        />
      )}

      {state.phase === "result" && (
        <ResultScreen
          stats={state.stats}
          bestStreakThisGame={state.maxStreak}
          seed={state.seed}
          sector={state.sector}
          incomingChallenge={activeChallenge}
          onRestart={handleRestart}
          onExitToMenu={onExitToMenu}
          onAchievement={onAchievement}
        />
      )}
    </>
  );
}
