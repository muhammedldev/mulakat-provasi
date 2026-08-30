import { buildGameQuestions } from "../data/questions";
import { interludes } from "../data/interludes";
import type { AnswerOption, Question, SectorId, Stats } from "../types";

export type Phase = "interlude" | "round-intro" | "question" | "feedback" | "result";

export interface GameState {
  phase: Phase;
  questions: Question[];
  seed: string;
  questionIndex: number;
  pendingIndex: number;
  stats: Stats;
  selectedOptionId: string | null;
  lastOption: AnswerOption | null;
  streak: number;
  maxStreak: number;
  comboBonusApplied: boolean;
  timedOut: boolean;
  sector?: SectorId;
}

export type GameAction =
  | { type: "ROUND_READY" }
  | { type: "ANSWER"; option: AnswerOption }
  | { type: "TIMEOUT" }
  | { type: "CONTINUE" }
  | { type: "INTERLUDE_DONE" }
  | { type: "RESTART" };

export const initialStats: Stats = { hazirlik: 50, iletisim: 50, ozguven: 50 };

// Bir oyunu seed/sektöre göre sıfırdan kurar — hem ilk mount'ta (bkz.
// ClassicGameContainer'ın useReducer lazy initializer'ı) hem RESTART
// action'ında kullanılıyor. Önceden bu deste modül yüklenir yüklenmez
// (App.tsx her zaman eager import ettiği için) eagerly hesaplanıyordu; artık
// yalnızca gerçekten bir Klasik Mülakat oyunu başlatıldığında çalışıyor.
export function createInitialGameState(seed: string | undefined, sector: SectorId | undefined): GameState {
  const deck = buildGameQuestions(seed, sector);
  return {
    phase: "round-intro",
    questions: deck.questions,
    seed: deck.seed,
    questionIndex: 0,
    pendingIndex: 0,
    stats: { ...initialStats },
    selectedOptionId: null,
    lastOption: null,
    streak: 0,
    maxStreak: 0,
    comboBonusApplied: false,
    timedOut: false,
    sector,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function applyOption(stats: Stats, option: AnswerOption): Stats {
  const next: Stats = { ...stats };
  (Object.keys(option.deltas) as (keyof Stats)[]).forEach((key) => {
    const delta = option.deltas[key] ?? 0;
    next[key] = clamp(next[key] + delta);
  });
  return next;
}

function worstOption(questions: Question[], index: number): AnswerOption {
  const opts = questions[index].options;
  return opts.reduce((worst, current) => {
    const sum = (o: AnswerOption) => Object.values(o.deltas).reduce((a, b) => a + (b ?? 0), 0);
    return sum(current) < sum(worst) ? current : worst;
  }, opts[0]);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ROUND_READY":
      return { ...state, phase: "question", timedOut: false };

    case "ANSWER": {
      if (state.phase !== "question") return state;
      let nextStats = applyOption(state.stats, action.option);
      const nextStreak = action.option.isBest ? state.streak + 1 : 0;
      const comboBonusApplied = nextStreak > 0 && nextStreak % 3 === 0;

      if (comboBonusApplied) {
        (Object.keys(nextStats) as (keyof Stats)[]).forEach((key) => {
          nextStats[key] = clamp(nextStats[key] + 5);
        });
      }

      return {
        ...state,
        phase: "feedback",
        stats: nextStats,
        selectedOptionId: action.option.id,
        lastOption: action.option,
        streak: nextStreak,
        maxStreak: Math.max(state.maxStreak, nextStreak),
        comboBonusApplied,
        timedOut: false,
      };
    }

    case "TIMEOUT": {
      if (state.phase !== "question") return state;
      const option = worstOption(state.questions, state.questionIndex);
      const nextStats = applyOption(state.stats, option);
      return {
        ...state,
        phase: "feedback",
        stats: nextStats,
        selectedOptionId: option.id,
        lastOption: option,
        streak: 0,
        comboBonusApplied: false,
        timedOut: true,
      };
    }

    case "CONTINUE": {
      if (state.phase !== "feedback") return state;
      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: "result" };
      }
      const currentInterviewerId = state.questions[state.questionIndex].interviewerId;
      const roundChanged = state.questions[nextIndex].interviewerId !== currentInterviewerId;

      if (roundChanged) {
        const interlude = interludes.find((i) => i.afterInterviewerId === currentInterviewerId);
        if (interlude) {
          return {
            ...state,
            phase: "interlude",
            pendingIndex: nextIndex,
            selectedOptionId: null,
            lastOption: null,
            timedOut: false,
          };
        }
      }

      return {
        ...state,
        phase: roundChanged ? "round-intro" : "question",
        questionIndex: nextIndex,
        selectedOptionId: null,
        lastOption: null,
        timedOut: false,
      };
    }

    case "INTERLUDE_DONE":
      return { ...state, phase: "round-intro", questionIndex: state.pendingIndex };

    case "RESTART":
      return createInitialGameState(undefined, state.sector);

    default:
      return state;
  }
}
