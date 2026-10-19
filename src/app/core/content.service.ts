import { Injectable, computed, signal } from '@angular/core';
import { Card, Category, CategoryGroup, CheatSheet, ContentBundle, GroupKind, QuizQuestion } from './models';

/** Area grouping shown in the UI. Categories missing here land in "Inne". */
export const GROUPS: CategoryGroup[] = [
  { name: '.NET i backend', kind: 'net', cats: ['csharp', 'aspnet', 'data', 'sql', 'dist'] },
  { name: 'Frontend', kind: 'ng', cats: ['signals', 'angular', 'tsrx', 'frontend'] },
  { name: 'Inżynieria', kind: 'gen', cats: ['arch', 'web', 'testing', 'devops', 'algo', 'review', 'ai'] },
  { name: 'Rozmowa', kind: 'soft', cats: ['soft'] },
];

/**
 * Loads the question bank (public/content/content.json, generated from /content by
 * `npm run content`) and exposes it as signals.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly bundle = signal<ContentBundle | null>(null);
  readonly error = signal<string | null>(null);
  readonly loaded = computed(() => this.bundle() !== null);

  readonly categories = computed<Category[]>(() => {
    const b = this.bundle();
    if (!b) return [];
    const order = GROUPS.flatMap(g => g.cats);
    const known = order.map(c => b.cats.find(x => x.cat === c)).filter((c): c is Category => !!c);
    return [...known, ...b.cats.filter(c => !order.includes(c.cat))];
  });
  readonly groups = computed(() => {
    const present = new Set(this.categories().map(c => c.cat));
    const gs = GROUPS.map(g => ({ ...g, cats: g.cats.filter(c => present.has(c)) })).filter(g => g.cats.length);
    const known = new Set(GROUPS.flatMap(g => g.cats));
    const other = [...present].filter(c => !known.has(c));
    return other.length ? [...gs, { name: 'Inne', kind: 'gen' as GroupKind, cats: other }] : gs;
  });
  readonly cards = computed<Card[]>(() => this.categories().flatMap(c => c.cards.map(x => ({ ...x, cat: c.cat }))));
  readonly quiz = computed<QuizQuestion[]>(() => this.categories().flatMap(c => c.quiz.map(x => ({ ...x, cat: c.cat }))));
  readonly byId = computed(() => {
    const m = new Map<string, Card | QuizQuestion>();
    for (const c of this.cards()) m.set(c.id, c);
    for (const q of this.quiz()) m.set(q.id, q);
    return m;
  });
  readonly cheatCount = computed(() => Object.values(this.bundle()?.cheats ?? {}).reduce((a, x) => a + Object.keys(x).length, 0));

  private readonly kinds = computed(() => {
    const m: Record<string, GroupKind> = {};
    for (const g of this.groups()) for (const c of g.cats) m[c] = g.kind;
    return m;
  });

  constructor() {
    // The artifact build inlines the bundle into the page; everywhere else it is fetched.
    const inline = document.getElementById('content-data')?.textContent;
    if (inline) {
      try { this.bundle.set(JSON.parse(inline) as ContentBundle); return; } catch { /* fall back to fetch */ }
    }
    fetch('content/content.json')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<ContentBundle>; })
      .then(b => this.bundle.set(b))
      .catch(e => this.error.set(`Nie udało się wczytać bazy pytań (${e.message}). Odśwież stronę.`));
  }

  card(id: string): Card | undefined { const x = this.byId().get(id); return x && 'a' in x ? x : undefined; }
  question(id: string): QuizQuestion | undefined { const x = this.byId().get(id); return x && 'options' in x ? x : undefined; }
  catName(cat: string): string { return this.categories().find(c => c.cat === cat)?.name ?? cat; }
  kind(cat: string): GroupKind { return this.kinds()[cat] ?? 'gen'; }
  sheet(cat: string, topic: string): CheatSheet | null { return this.bundle()?.cheats[cat]?.[topic] ?? null; }
  cardsFor(cat: string, topic?: string): Card[] { return this.cards().filter(c => c.cat === cat && (!topic || c.topic === topic)); }
  quizFor(cat: string, topic?: string): QuizQuestion[] { return this.quiz().filter(q => q.cat === cat && (!topic || q.topic === topic)); }
  /** Topics of a category that have a cheat sheet, sorted. */
  sheetTopics(cat: string): string[] {
    const c = this.categories().find(x => x.cat === cat);
    if (!c) return [];
    return [...new Set([...c.cards, ...c.quiz].map(x => x.topic))].filter(t => this.sheet(cat, t)).sort((a, b) => a.localeCompare(b, 'pl'));
  }
}
