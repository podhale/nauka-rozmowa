import { ProgressState } from './models';

export const emptyProgress = (): ProgressState => ({
  v: 1,
  cards: {},
  quiz: {},
  lessons: {},
  hist: [],
  days: {},
  newDay: { d: '', n: 0 },
  settings: { newPerDay: 15, levels: [1, 2, 3], t: 0 },
  resetAt: 0,
});

/** Normalises anything read from storage into a valid ProgressState. */
export function normalize(raw: unknown): ProgressState {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  return { ...base, ...(raw as Partial<ProgressState>), v: 1 };
}

/**
 * Merges two devices' progress. Per item, the newer `t` wins; a reset (resetAt)
 * drops everything older than it on both sides. Commutative, so either side can merge.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const out = emptyProgress();
  const R = Math.max(a.resetAt || 0, b.resetAt || 0);
  out.resetAt = R;

  for (const k of ['cards', 'quiz', 'lessons'] as const) {
    const merged: Record<string, { t: number }> = { ...(a[k] ?? {}) };
    for (const [id, v] of Object.entries(b[k] || {})) if (!merged[id] || (v.t || 0) > (merged[id].t || 0)) merged[id] = v;
    for (const [id, v] of Object.entries(merged)) if ((v.t || 0) <= R) delete merged[id];
    (out as unknown as Record<string, unknown>)[k] = merged;
  }

  const seen = new Set<number>();
  out.hist = [...(a.hist || []), ...(b.hist || [])]
    .filter(h => h.t > R && !seen.has(h.t) && (seen.add(h.t), true))
    .sort((x, y) => x.t - y.t)
    .slice(-60);

  if (!R) {
    out.days = { ...a.days };
    for (const [k, v] of Object.entries(b.days || {})) out.days[k] = Math.max(out.days[k] || 0, v);
  } else {
    out.days = { ...((a.resetAt || 0) >= (b.resetAt || 0) ? a.days : b.days) };
  }
  const keys = Object.keys(out.days).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 400))) delete out.days[k];

  if (a.newDay?.d === b.newDay?.d) out.newDay = { d: a.newDay.d, n: Math.max(a.newDay.n, b.newDay.n) };
  else out.newDay = (a.newDay?.d || '') > (b.newDay?.d || '') ? a.newDay : b.newDay;

  out.settings = (b.settings?.t || 0) > (a.settings?.t || 0) ? b.settings : a.settings;
  return out;
}
