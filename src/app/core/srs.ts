import { CardProgress, Grade } from './models';

/** Local calendar helpers. Day numbers are days since epoch for the LOCAL date. */
export const dayKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const dayNum = (d: Date = new Date()): number =>
  Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);

/** Interval (days) at which a card counts as mastered. */
export const MASTERED_DAYS = 7;

/**
 * Simplified SM-2. Grades: 0 = nie wiem, 1 = trudne, 2 = dobrze, 3 = łatwe.
 * Pure function: returns the next state, never mutates.
 */
export function nextReview(prev: CardProgress | undefined, g: Grade, today = dayNum(), now = Date.now()): CardProgress {
  const s: CardProgress = prev ? { ...prev } : { r: 0, i: 0, e: 2.5, l: 0, d: today, t: now };
  if (g === 0) {
    s.r = 0;
    s.l += 1;
    s.i = 0;
    s.e = Math.max(1.3, s.e - 0.2);
    s.d = today + 1;
  } else {
    s.r += 1;
    if (s.r === 1) s.i = g === 1 ? 1 : g === 2 ? 2 : 4;
    else if (s.r === 2) s.i = g === 1 ? 3 : g === 2 ? 6 : 9;
    else s.i = Math.max(s.i + 1, Math.round(s.i * (g === 1 ? 1.2 : g === 2 ? s.e : s.e * 1.3)));
    s.e = Math.max(1.3, s.e + (g === 1 ? -0.15 : g === 3 ? 0.1 : 0));
    s.d = today + s.i;
  }
  s.g = g;
  s.t = now;
  return s;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Polish plural: plural(5, 'karta', 'karty', 'kart') */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const d = n % 10, h = n % 100;
  return d >= 2 && d <= 4 && (h < 10 || h >= 20) ? few : many;
}
