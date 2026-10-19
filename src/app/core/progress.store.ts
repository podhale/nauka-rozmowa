import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ContentService } from './content.service';
import { Card, CardState, Grade, HistoryEntry, Level, ProgressState, QuizQuestion, WeakTopic } from './models';
import { emptyProgress, mergeProgress, normalize } from './progress-merge';
import { MASTERED_DAYS, dayKey, dayNum, nextReview } from './srs';

const LS_KEY = 'interview-prep-v1';

/**
 * Single source of truth for learning progress.
 * State is one immutable signal; every mutation goes through `update()` so the
 * persistence effect (localStorage) and cloud sync see each change.
 */
@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly content = inject(ContentService);
  private readonly _state = signal<ProgressState>(this.readLocal());
  readonly state = this._state.asReadonly();
  /** Bumped on every local change; SyncService watches it. */
  readonly localVersion = signal(0);

  readonly settings = computed(() => this._state().settings);
  readonly levels = computed(() => new Set<Level>(this._state().settings.levels));

  constructor() {
    effect(() => {
      const s = this._state();
      try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* private mode etc. */ }
    });
  }

  private readLocal(): ProgressState {
    try { const raw = localStorage.getItem(LS_KEY); return raw ? normalize(JSON.parse(raw)) : emptyProgress(); }
    catch { return emptyProgress(); }
  }
  private update(fn: (s: ProgressState) => ProgressState): void {
    this._state.update(fn);
    this.localVersion.update(v => v + 1);
  }
  /** Used by SyncService when cloud data arrives (does not count as a local change). */
  mergeRemote(remote: unknown): void { this._state.update(s => mergeProgress(s, normalize(remote))); }

  // ---------- queries ----------
  levelOk = (x: { level?: Level }): boolean => this.levels().has(x.level ?? 2);
  cardState(id: string): CardState {
    const p = this._state().cards[id];
    return !p ? 'new' : p.i >= MASTERED_DAYS ? 'mastered' : 'learning';
  }
  isDue(id: string, today = dayNum()): boolean { const p = this._state().cards[id]; return !!p && p.d <= today; }
  isNew(id: string): boolean { return !this._state().cards[id]; }
  previewInterval(id: string, g: Grade): number { return nextReview(this._state().cards[id], g).i; }
  quizWrong(id: string): boolean { return this._state().quiz[id]?.last === 0; }
  quizSeen(id: string): boolean { return !!this._state().quiz[id]; }

  readonly newLeftToday = computed(() => {
    const s = this._state();
    const used = s.newDay.d === dayKey() ? s.newDay.n : 0;
    return Math.max(0, s.settings.newPerDay - used);
  });
  readonly streak = computed(() => {
    const days = this._state().days;
    let n = 0;
    const d = new Date();
    if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  });

  dueCards(cats?: Set<string>): Card[] {
    const s = this._state(); const t = dayNum();
    return this.content.cards()
      .filter(c => (!cats || cats.has(c.cat)) && this.levelOk(c) && s.cards[c.id] && s.cards[c.id].d <= t)
      .sort((a, b) => s.cards[a.id].d - s.cards[b.id].d);
  }
  /** New cards, easiest first, interleaved across categories. */
  newCards(cats?: Set<string>): Card[] {
    const s = this._state();
    const pool = this.content.cards().filter(c => (!cats || cats.has(c.cat)) && this.levelOk(c) && !s.cards[c.id]);
    pool.sort((a, b) => (a.level ?? 2) - (b.level ?? 2));
    const by = new Map<string, Card[]>();
    for (const c of pool) by.set(c.cat, [...(by.get(c.cat) ?? []), c]);
    const out: Card[] = [];
    let added = true;
    while (added) { added = false; for (const list of by.values()) { const c = list.shift(); if (c) { out.push(c); added = true; } } }
    return out;
  }
  catStats(cat: string) {
    const s = this._state(); const t = dayNum();
    const cs = this.content.cardsFor(cat).filter(this.levelOk);
    let m = 0, l = 0, due = 0;
    for (const c of cs) {
      const p = s.cards[c.id];
      if (p) { if (p.i >= MASTERED_DAYS) m++; else l++; if (p.d <= t) due++; }
    }
    let ok = 0, tot = 0;
    const qs = this.content.quizFor(cat);
    for (const q of qs) { const p = s.quiz[q.id]; if (p) { ok += p.c; tot += p.c + p.w; } }
    return { n: cs.length, m, l, due, qn: qs.length, acc: tot ? Math.round((ok / tot) * 100) : null };
  }
  /** Topics where the learner struggles most (lapses, low grades, wrong quiz answers). */
  weakTopics(limit = 12): WeakTopic[] {
    const s = this._state(); const w = new Map<string, number>();
    const add = (cat: string, topic: string, v: number) => w.set(cat + '|' + topic, (w.get(cat + '|' + topic) ?? 0) + v);
    for (const [id, p] of Object.entries(s.cards)) {
      const c = this.content.card(id); if (!c) continue;
      add(c.cat, c.topic, p.l + (p.g === 0 ? 2 : p.g === 1 ? 1 : 0));
    }
    for (const [id, p] of Object.entries(s.quiz)) {
      const q = this.content.question(id); if (!q) continue;
      add(q.cat, q.topic, p.w * 2 + (p.last === 0 ? 2 : 0) - p.c);
    }
    return [...w.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([k, weight]) => { const [cat, topic] = k.split('|'); return { cat, topic, weight }; });
  }

  // ---------- commands ----------
  gradeCard(id: string, g: Grade, countsAsNew: boolean): void {
    this.update(s => {
      const k = dayKey();
      const newDay = countsAsNew && !s.cards[id] ? { d: k, n: (s.newDay.d === k ? s.newDay.n : 0) + 1 } : s.newDay;
      return { ...s, cards: { ...s.cards, [id]: nextReview(s.cards[id], g) }, days: bump(s.days), newDay };
    });
  }
  touchDay(): void { this.update(s => ({ ...s, days: bump(s.days) })); }
  answerQuiz(q: QuizQuestion, ok: boolean): void {
    this.update(s => {
      const p = s.quiz[q.id] ?? { c: 0, w: 0, last: 1 as const, t: 0 };
      return { ...s, quiz: { ...s.quiz, [q.id]: { c: p.c + (ok ? 1 : 0), w: p.w + (ok ? 0 : 1), last: ok ? 1 : 0, t: Date.now() } }, days: bump(s.days) };
    });
  }
  /** Puts a topic's flashcards into today's review. Returns how many were added. */
  scheduleTopic(cat: string, topic: string): number {
    const t = dayNum(); const now = Date.now(); let n = 0;
    this.update(s => {
      const cards = { ...s.cards };
      for (const c of this.content.cardsFor(cat, topic)) {
        const p = cards[c.id];
        if (p && p.d <= t) continue;
        cards[c.id] = p ? { ...p, d: t, t: now } : { r: 0, i: 0, e: 2.5, l: 0, d: t, t: now };
        n++;
      }
      return { ...s, cards };
    });
    return n;
  }
  addHistory(h: Omit<HistoryEntry, 't'>): void {
    if (!h.n) return;
    this.update(s => ({ ...s, hist: [...s.hist, { ...h, t: Date.now() }].slice(-60) }));
  }
  setNewPerDay(n: number): void { this.update(s => ({ ...s, settings: { ...s.settings, newPerDay: n, t: Date.now() } })); }
  toggleLevel(l: Level): boolean {
    const cur = this._state().settings.levels;
    const next = cur.includes(l) ? cur.filter(x => x !== l) : [...cur, l].sort();
    if (!next.length) return false;
    this.update(s => ({ ...s, settings: { ...s.settings, levels: next as Level[], t: Date.now() } }));
    return true;
  }
  reset(): void {
    this.update(s => ({ ...emptyProgress(), resetAt: Date.now(), settings: { ...s.settings, t: Date.now() } }));
  }

  cardOrQuiz(id: string): Card | QuizQuestion | undefined { return this.content.byId().get(id); }
}

function bump(days: Record<string, number>): Record<string, number> {
  const k = dayKey();
  return { ...days, [k]: (days[k] ?? 0) + 1 };
}
