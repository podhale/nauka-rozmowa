import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from './content.service';
import { Card, Grade, QuizQuestion } from './models';
import { ProgressStore } from './progress.store';
import { shuffle } from './srs';
import { UiStateService } from './ui-state.service';

export interface StudySession {
  title: string;
  queue: string[];
  index: number;
  revealed: boolean;
  results: { id: string; grade: Grade }[];
  requeued: string[];
  interview: boolean;
  /** false = browsing mode, grades don't change the schedule */
  srs: boolean;
  newIds: string[];
  startedAt: number;
  questionStartedAt: number;
  typed: string;
  aiScores: number[];
}

export interface QuizSession {
  title: string;
  ids: string[];
  index: number;
  pick: number | null;
  results: { id: string; ok: boolean; pick: number }[];
  /** shuffled option order per question */
  order: Record<string, number[]>;
  /** set for lesson / module exams: progress key ("<lessonId>" or "module:<id>") */
  examKey?: string;
}

/**
 * Holds the running flashcard / quiz session so it survives navigating to a
 * cheat sheet and back. Pages read signals; all transitions live here.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly content = inject(ContentService);
  private readonly store = inject(ProgressStore);
  private readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  readonly study = signal<StudySession | null>(null);
  readonly quiz = signal<QuizSession | null>(null);
  /** Finished sessions, shown on the result screens. */
  readonly studyResult = signal<StudySession | null>(null);
  readonly quizResult = signal<QuizSession | null>(null);

  readonly currentCard = computed<Card | undefined>(() => {
    const s = this.study();
    return s ? this.content.card(s.queue[s.index]) : undefined;
  });
  readonly currentQuestion = computed<QuizQuestion | undefined>(() => {
    const s = this.quiz();
    return s ? this.content.question(s.ids[s.index]) : undefined;
  });

  // ---------- flashcards ----------
  startStudy(cards: Card[], title: string, opts: { interview?: boolean; srs?: boolean; newIds?: string[] } = {}): void {
    if (!cards.length) { this.ui.showToast('Brak kart dla tych ustawień'); return; }
    const now = Date.now();
    this.study.set({
      title, queue: cards.map(c => c.id), index: 0, revealed: false, results: [], requeued: [],
      interview: !!opts.interview, srs: opts.srs !== false, newIds: opts.newIds ?? [], startedAt: now, questionStartedAt: now, typed: '', aiScores: [],
    });
    this.studyResult.set(null);
    void this.router.navigate(['/fiszki/sesja']);
  }
  startDaily(cats?: Set<string>): void {
    const due = this.store.dueCards(cats);
    const fresh = this.store.newCards(cats).slice(0, this.store.newLeftToday());
    this.startStudy([...due, ...fresh], cats ? 'Fiszki' : 'Powtórka dnia', { newIds: fresh.map(c => c.id) });
  }
  startInterview(): void {
    const by = new Map<string, Card[]>();
    for (const c of shuffle(this.content.cards().filter(c => (c.level ?? 2) >= 2 && this.store.levelOk(c) && c.cat !== 'soft'))) by.set(c.cat, [...(by.get(c.cat) ?? []), c]);
    const keys = shuffle([...by.keys()]);
    const out: Card[] = [];
    const soft = shuffle(this.content.cardsFor('soft'));
    if (soft.length) out.push(soft[0]);
    for (let i = 0; out.length < 10 && keys.some(k => by.get(k)!.length); i++) {
      const c = by.get(keys[i % keys.length])!.shift();
      if (c) out.push(c);
    }
    this.startStudy(out, 'Próbna rozmowa', { interview: true });
  }
  reveal(): void { this.study.update(s => s && { ...s, revealed: true }); }
  setTyped(t: string): void { this.study.update(s => s && { ...s, typed: t }); }
  addAiScore(score: number): void { this.study.update(s => s && { ...s, aiScores: [...s.aiScores, score] }); }
  grade(g: Grade): void {
    const s = this.study();
    if (!s) return;
    const id = s.queue[s.index];
    if (s.srs) this.store.gradeCard(id, g, s.newIds.includes(id));
    else this.store.touchDay();
    const queue = [...s.queue];
    const requeued = [...s.requeued];
    if (g === 0 && !s.interview && !requeued.includes(id)) { requeued.push(id); queue.splice(Math.min(queue.length, s.index + 4), 0, id); }
    const next: StudySession = { ...s, queue, requeued, index: s.index + 1, revealed: false, typed: '', questionStartedAt: Date.now(), results: [...s.results, { id, grade: g }] };
    if (next.index >= next.queue.length) this.finishStudy(next);
    else this.study.set(next);
  }
  finishStudy(s = this.study()): void {
    if (!s) return;
    const ok = s.results.filter(r => r.grade >= 2).length;
    this.store.addHistory({ mode: s.interview ? 'interview' : 'cards', n: s.results.length, ok, cats: [...new Set(s.results.map(r => this.content.card(r.id)?.cat ?? ''))] });
    this.study.set(null);
    if (s.results.length) { this.studyResult.set(s); void this.router.navigate(['/fiszki/wynik']); }
    else void this.router.navigate(['/']);
  }

  // ---------- quiz ----------
  startQuiz(questions: QuizQuestion[], title: string, examKey?: string): void {
    if (!questions.length) { this.ui.showToast('Brak pytań dla tych ustawień'); return; }
    const order: Record<string, number[]> = {};
    for (const q of questions) order[q.id] = shuffle(q.options.map((_, i) => i));
    this.quiz.set({ title, ids: questions.map(q => q.id), index: 0, pick: null, results: [], order, examKey });
    this.quizResult.set(null);
    void this.router.navigate(['/test/sesja']);
  }
  startQuickQuiz(): void {
    const pool = this.content.quiz().filter(this.store.levelOk);
    const priority = shuffle(pool.filter(q => !this.store.quizSeen(q.id) || this.store.quizWrong(q.id)));
    const set = new Set(priority);
    this.startQuiz([...priority, ...shuffle(pool.filter(q => !set.has(q)))].slice(0, 10), 'Szybki test');
  }
  startLessonExam(lessonId: string): void {
    const l = this.content.lesson(lessonId);
    if (l) this.startQuiz(shuffle(this.content.lessonExam(lessonId)), `Egzamin: ${l.title}`, lessonId);
  }
  startModuleExam(moduleId: string, count = 20): void {
    const m = this.content.modules().find(x => x.module === moduleId);
    if (!m) return;
    // spread questions evenly over the module's lessons
    const per = m.lessons.map(l => shuffle(this.content.lessonExam(l.id)));
    const out: QuizQuestion[] = [];
    for (let i = 0; out.length < count && per.some(p => p.length); i++) { const q = per[i % per.length].shift(); if (q) out.push(q); }
    this.startQuiz(shuffle(out), `Egzamin z modułu: ${m.title}`, `module:${moduleId}`);
  }
  startWrongQuiz(): void {
    this.startQuiz(shuffle(this.content.quiz().filter(q => this.store.quizWrong(q.id))), 'Poprawa błędów');
  }
  pick(option: number): void {
    const s = this.quiz(); const q = this.currentQuestion();
    if (!s || !q || s.pick !== null) return;
    const ok = option === q.correct;
    this.store.answerQuiz(q, ok);
    this.quiz.set({ ...s, pick: option, results: [...s.results, { id: q.id, ok, pick: option }] });
  }
  nextQuestion(): void {
    const s = this.quiz();
    if (!s) return;
    if (s.index + 1 >= s.ids.length) this.finishQuiz(s);
    else this.quiz.set({ ...s, index: s.index + 1, pick: null });
  }
  finishQuiz(s = this.quiz()): void {
    if (!s) return;
    const n = s.results.length;
    // An exam counts only when every question was answered.
    if (s.examKey && n === s.ids.length) this.store.recordExam(s.examKey, Math.round((s.results.filter(r => r.ok).length / n) * 100));
    this.store.addHistory({ mode: 'quiz', n, ok: s.results.filter(r => r.ok).length, cats: [...new Set(s.results.map(r => this.content.question(r.id)?.cat ?? ''))] });
    this.quiz.set(null);
    if (n) { this.quizResult.set(s); void this.router.navigate(['/test/wynik']); }
    else void this.router.navigate(['/test']);
  }
}
