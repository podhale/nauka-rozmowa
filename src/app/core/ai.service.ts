import { Injectable, signal } from '@angular/core';
import { ClaudeSample, SampleError, useCapability } from './claude-runtime';
import { Card, QuizQuestion } from './models';

export interface AiGrade {
  score: number;
  verdict?: string;
  good?: string[];
  missing?: string[];
  wrong?: string[];
  better?: string;
}

const ROLE =
  "Jesteś doświadczonym rekruterem technicznym i mentorem (.NET, ASP.NET Core, Angular, SQL, architektura, DevOps). " +
  'Odpowiadasz po polsku, konkretnie i rzeczowo, terminy techniczne zostawiasz po angielsku. ' +
  "Formatowanie: krótkie akapity, listy z '- ', kod w blokach ```. Bez wstępów i bez grzecznościowych podsumowań.";

const ERRORS: Record<string, string> = {
  rate_limited: 'Za dużo zapytań naraz. Spróbuj za chwilę.',
  session_expired: 'Zaloguj się ponownie do Claude.',
  refused: 'Claude nie odpowiedział na to pytanie. Spróbuj inaczej je sformułować.',
  empty_completion: 'Pusta odpowiedź. Spróbuj jeszcze raz.',
  invalid_json: 'Nie udało się odczytać oceny. Spróbuj jeszcze raz.',
  prompt_too_large: 'Za długi tekst. Skróć odpowiedź.',
  upstream_error: 'Połączenie przerwane. Spróbuj jeszcze raz.',
};
const DISABLED = new Set(['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed']);

export class AiUnavailableError extends Error {}

/**
 * Claude-powered helpers (explain a wrong answer, follow-up questions, grade an answer).
 * Available only inside the Claude artifact runtime; `available()` drives the UI.
 */
@Injectable({ providedIn: 'root' })
export class AiService {
  private sample: ClaudeSample | null = null;
  readonly available = signal(false);
  private readonly cache = new Map<string, unknown>();

  constructor() {
    void useCapability('sample').then(s => { this.sample = s; this.available.set(!!s); });
  }

  /** Streams a markdown answer. Throws Error with a user-facing message. */
  async ask(key: string, prompt: string, onText: (t: string) => void): Promise<string> {
    const hit = this.cache.get(key);
    if (typeof hit === 'string') { onText(hit); return hit; }
    if (!this.sample) throw new AiUnavailableError();
    try {
      const { text } = await this.sample(`${ROLE}\n\n${prompt}`, { modelTier: 'default', onText: u => onText(u.text) });
      this.cache.set(key, text);
      return text;
    } catch (e) { throw this.wrap(e); }
  }

  async grade(card: Card, answer: string): Promise<AiGrade> {
    const key = `grade|${card.id}|${answer}`;
    const hit = this.cache.get(key);
    if (hit) return hit as AiGrade;
    if (!this.sample) throw new AiUnavailableError();
    const lvl = card.level === 1 ? 'junior' : card.level === 3 ? 'senior' : 'mid';
    try {
      const r = await this.sample.json<AiGrade>(
        `${ROLE}\n\nOceń odpowiedź kandydata na pytanie z rozmowy rekrutacyjnej (poziom: ${lvl}).\n\n${cardContext(card)}\n\n` +
          `Odpowiedź kandydata (mogła być dyktowana, ignoruj literówki):\n"""${answer.slice(0, 4000)}"""\n\n` +
          'Zwróć wyłącznie JSON: {"score": liczba 0-10, "verdict": "jedno krótkie zdanie", "good": ["co powiedział dobrze"], ' +
          '"missing": ["kluczowe rzeczy, których zabrakło"], "wrong": ["merytoryczne błędy, jeśli są"], "better": "mocniejsza odpowiedź w 2-3 zdaniach"}. ' +
          'Bądź uczciwy i wymagający jak prawdziwy rekruter, ale doceniaj poprawną treść wyrażoną innymi słowami.',
        { modelTier: 'default' },
      );
      if (!r || typeof r !== 'object' || typeof r.score !== 'number') throw { code: 'invalid_json', message: '' };
      this.cache.set(key, r);
      return r;
    } catch (e) { throw this.wrap(e); }
  }

  explainPrompt(q: QuizQuestion, pick: number): string {
    const opts = q.options.map((o, i) => `${'ABCDEF'[i]}) ${o}`).join('\n');
    return `Kandydat pomylił się w pytaniu testowym przed rozmową rekrutacyjną.\nPytanie: ${q.q}${q.code ? '\nKod:\n' + q.code : ''}\n` +
      `Odpowiedzi:\n${opts}\nPoprawna: ${q.options[q.correct]}\nKandydat wybrał: ${q.options[pick]}\nWyjaśnienie z bazy: ${q.why}\n\n` +
      'Wyjaśnij mu (do ~180 słów): 1) jakie błędne założenie prawdopodobnie stoi za jego wyborem i dlaczego ta opcja jest zła, ' +
      '2) dlaczego poprawna jest poprawna – intuicyjnie, z mini przykładem jeśli pomaga, 3) jedno zdanie „Zapamiętaj:” jako regułę na przyszłość.';
  }

  private wrap(e: unknown): Error {
    const err = e as SampleError;
    if (DISABLED.has(err?.code)) { this.sample = null; this.available.set(false); return new AiUnavailableError(); }
    return new Error(ERRORS[err?.code] ?? ERRORS['upstream_error']);
  }
}

export function cardContext(c: Card): string {
  return `Pytanie: ${c.q}\nWzorcowa odpowiedź: ${c.a}${c.deep ? '\nPogłębienie: ' + c.deep : ''}${c.code ? '\nKod:\n' + c.code : ''}`;
}
