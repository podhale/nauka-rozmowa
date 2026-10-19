/** Content model — mirrors the JSON files in /content (see content/README.md). */
export type Level = 1 | 2 | 3;

export interface Card {
  id: string;
  cat: string;
  topic: string;
  level: Level;
  q: string;
  a: string;
  deep?: string;
  code?: string;
  lang?: string;
  tip?: string;
}

export interface QuizQuestion {
  id: string;
  cat: string;
  topic: string;
  level: Level;
  q: string;
  code?: string;
  lang?: string;
  options: string[];
  correct: number;
  why: string;
}

export interface CheatSheet {
  points: string[];
  pitfalls?: string[];
  code?: string;
  lang?: string;
  say?: string;
}

export interface Category {
  cat: string;
  name: string;
  cards: Card[];
  quiz: QuizQuestion[];
}

export interface ContentBundle {
  version: string;
  cats: Category[];
  /** cheats[cat][topic] */
  cheats: Record<string, Record<string, CheatSheet>>;
}

export type GroupKind = 'net' | 'ng' | 'gen' | 'soft';
export interface CategoryGroup {
  name: string;
  kind: GroupKind;
  cats: string[];
}

/** Progress model — what is persisted (localStorage + per-user cloud doc). */
export interface CardProgress {
  /** successful reviews in a row */ r: number;
  /** interval in days */ i: number;
  /** ease factor */ e: number;
  /** lapses */ l: number;
  /** due day number */ d: number;
  /** last grade 0-3 */ g?: number;
  /** updated at (ms) – used for merging devices */ t: number;
}

export interface QuizProgress {
  c: number;
  w: number;
  last: 0 | 1;
  t: number;
}

export type SessionMode = 'cards' | 'quiz' | 'interview';
export interface HistoryEntry {
  t: number;
  mode: SessionMode;
  n: number;
  ok: number;
  cats: string[];
}

export interface Settings {
  newPerDay: number;
  levels: Level[];
  t: number;
}

export interface ProgressState {
  v: 1;
  cards: Record<string, CardProgress>;
  quiz: Record<string, QuizProgress>;
  hist: HistoryEntry[];
  /** activity per local day key YYYY-MM-DD */
  days: Record<string, number>;
  newDay: { d: string; n: number };
  settings: Settings;
  resetAt: number;
}

export type Grade = 0 | 1 | 2 | 3;
export type CardState = 'new' | 'learning' | 'mastered';

export interface WeakTopic {
  cat: string;
  topic: string;
  weight: number;
}
