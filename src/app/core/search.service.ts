import { Injectable, computed, inject } from '@angular/core';
import { ContentService } from './content.service';
import { Card, CheatSheet, Level, QuizQuestion } from './models';

export type SearchKind = 'card' | 'quiz' | 'sheet';

export interface SearchHit {
  kind: SearchKind;
  cat: string;
  topic: string;
  level?: Level;
  /** card or question id; for sheets: cat|topic */
  id: string;
  title: string;
  snippet: string;
  score: number;
  card?: Card;
  question?: QuizQuestion;
  sheet?: CheatSheet;
}

export interface SearchFilters {
  cat: string;          // 'all' or category id
  level: Level | 0;     // 0 = all
  kinds: ReadonlySet<SearchKind>;
}

/** Lower-case and strip Polish (and other) diacritics: "Współbieżność" → "wspolbieznosc". */
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
}

interface IndexEntry { hit: Omit<SearchHit, 'score' | 'snippet'>; title: string; body: string; full: string; }

/**
 * Full-text search over cards, quiz questions and cheat sheets.
 * The index is built once per content load (computed), queries are cheap scans.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly content = inject(ContentService);

  private readonly index = computed<IndexEntry[]>(() => {
    const out: IndexEntry[] = [];
    for (const c of this.content.cards()) {
      const body = [c.a, c.tr, c.deep, c.tip, c.code, c.topic].filter(Boolean).join(' \n ');
      out.push({ hit: { kind: 'card', cat: c.cat, topic: c.topic, level: c.level, id: c.id, title: c.q, card: c }, title: normalize(c.q), body: normalize(body), full: body });
    }
    for (const q of this.content.quiz()) {
      const body = [q.options.join(' | '), q.why, q.code, q.topic].filter(Boolean).join(' \n ');
      out.push({ hit: { kind: 'quiz', cat: q.cat, topic: q.topic, level: q.level, id: q.id, title: q.q, question: q }, title: normalize(q.q), body: normalize(body), full: body });
    }
    for (const cat of this.content.categories()) {
      for (const topic of this.content.sheetTopics(cat.cat)) {
        const sh = this.content.sheet(cat.cat, topic)!;
        const body = [...sh.points, ...(sh.pitfalls ?? []), sh.say, sh.code].filter(Boolean).join(' \n ');
        out.push({ hit: { kind: 'sheet', cat: cat.cat, topic, id: cat.cat + '|' + topic, title: topic, sheet: sh }, title: normalize(topic), body: normalize(body), full: body });
      }
    }
    return out;
  });

  /** All words must match (title, topic or body). Title matches rank higher. */
  search(query: string, f: SearchFilters, limit = 2000): { hits: SearchHit[]; total: number } {
    const words = normalize(query).split(/\s+/).filter(w => w.length > 1);
    if (!words.length) return { hits: [], total: 0 };
    const hits: SearchHit[] = [];
    for (const e of this.index()) {
      const h = e.hit;
      if (!f.kinds.has(h.kind)) continue;
      if (f.cat !== 'all' && h.cat !== f.cat) continue;
      if (f.level && h.kind !== 'sheet' && h.level !== f.level) continue;
      let score = 0;
      let ok = true;
      for (const w of words) {
        const inTitle = e.title.includes(w);
        const inBody = e.body.includes(w);
        if (!inTitle && !inBody) { ok = false; break; }
        score += inTitle ? 10 : 2;
        if (normalize(h.topic).includes(w)) score += 5;
      }
      if (!ok) continue;
      if (h.kind === 'sheet') score += 3;
      hits.push({ ...h, score, snippet: snippet(e.full, words) });
    }
    hits.sort((a, b) => b.score - a.score);
    return { hits: hits.slice(0, limit), total: hits.length };
  }
}

/** ~160 chars of body around the first matching word. */
function snippet(text: string, words: string[]): string {
  const flat = text.replace(/\s+/g, ' ');
  const norm = normalize(flat);
  let at = -1;
  for (const w of words) { const i = norm.indexOf(w); if (i >= 0 && (at < 0 || i < at)) at = i; }
  if (at < 0) return flat.slice(0, 160);
  const start = Math.max(0, at - 60);
  return (start ? '…' : '') + flat.slice(start, start + 170) + (start + 170 < flat.length ? '…' : '');
}
