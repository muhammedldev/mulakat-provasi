export type StatKey = "hazirlik" | "iletisim" | "ozguven";

export type StatDelta = Partial<Record<StatKey, number>>;

export type Difficulty = "kolay" | "orta" | "zor" | "efsane";
export type QuestionType = "teorik" | "uygulama";
export type SectorId = "yazilim" | "satis-pazarlama";

export interface AnswerOption {
  id: string;
  text: string;
  deltas: StatDelta;
  feedback: string;
  isBest?: boolean;
}

export interface Question {
  id: string;
  interviewerId: string;
  scene: string;
  interviewerLine: string;
  timeLimit: number;
  difficulty: Difficulty;
  type: QuestionType;
  options: AnswerOption[];
  /** Academic/authoritative citation backing a factual claim (theory name, author, year) — shown in the References modal. Only set for teorik/efsane content that asserts a verifiable fact. */
  source?: string;
  /** Set only on sector-pack questions (src/data/sectorQuestions.ts) — excluded from the general pool unless the matching sector is selected. */
  sector?: SectorId;
}

export type HairStyle = "bob" | "short" | "bun";
export type DeskProp = "coffee" | "monitor" | "nameplate";

export interface Interviewer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
  roundTitle: string;
  introLine: string;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  glasses?: boolean;
  deskProp: DeskProp;
}

export type Mood = "neutral" | "positive" | "negative" | "timeout";

export type Stats = Record<StatKey, number>;

export type Rank = "bronze" | "silver" | "gold" | "platinum";

export interface Profile {
  title: string;
  emoji: string;
  description: string;
  rank: Rank;
}

export interface InterludeReply {
  text: string;
  response: string;
}

export interface Interlude {
  id: string;
  afterInterviewerId: string;
  fromInterviewerId: string;
  toInterviewerId: string;
  lines: string[];
  replies: InterludeReply[];
}
