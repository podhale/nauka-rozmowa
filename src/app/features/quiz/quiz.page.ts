import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AiService } from '../../core/ai.service';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { AiAnswer } from '../../shared/ai-answer';
import { CheatSheetView } from '../../shared/cheat-sheet';
import { CatTag, CodeBlock, LevelBadge, PluralPipe, RichPipe } from '../../shared/ui';

@Component({
  selector: 'app-quiz-page',
  imports: [CatTag, CodeBlock, LevelBadge, RichPipe, PluralPipe, CheatSheetView, AiAnswer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quiz.page.html',
})
export class QuizPage implements OnInit {
  protected readonly session = inject(SessionService);
  protected readonly content = inject(ContentService);
  protected readonly ai = inject(AiService);
  private readonly store = inject(ProgressStore);
  private readonly router = inject(Router);

  protected readonly s = this.session.quiz;
  protected readonly q = this.session.currentQuestion;
  protected readonly letters = 'ABCDEF';
  protected readonly correctSoFar = computed(() => this.s()?.results.filter(r => r.ok).length ?? 0);
  protected readonly progressPct = computed(() => { const s = this.s(); return s ? (s.index / s.ids.length) * 100 : 0; });
  protected readonly answered = computed(() => this.s()?.pick != null);
  protected readonly right = computed(() => this.answered() && this.s()!.pick === this.q()?.correct);
  protected readonly topicCards = computed(() => { const q = this.q(); return q ? this.content.cardsFor(q.cat, q.topic).length : 0; });
  protected readonly hasSheet = computed(() => { const q = this.q(); return !!q && !!this.content.sheet(q.cat, q.topic); });
  protected readonly scheduled = signal<string | null>(null);
  protected readonly explained = signal(false);
  private readonly feedback = viewChild<ElementRef<HTMLElement>>('feedback');
  private readonly explainer = viewChild(AiAnswer);

  constructor() {
    effect(() => { this.q(); untracked(() => { this.scheduled.set(null); this.explained.set(false); }); });
    effect(() => {
      const el = this.feedback()?.nativeElement;
      if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    });
  }
  ngOnInit(): void { if (!this.s()) void this.router.navigate(['/test']); }

  protected optionClass(oi: number): string {
    const s = this.s(); const q = this.q();
    if (!s || !q || s.pick === null) return 'opt';
    return oi === q.correct ? 'opt ok' : oi === s.pick ? 'opt no' : 'opt';
  }
  protected explain(): void {
    const s = this.s(); const q = this.q();
    if (!s || !q || s.pick === null) return;
    this.explained.set(true);
    void this.explainer()?.run(`explain|${q.id}|${s.pick}`, this.ai.explainPrompt(q, s.pick));
  }
  protected schedule(): void {
    const q = this.q(); if (!q) return;
    const n = this.store.scheduleTopic(q.cat, q.topic);
    this.scheduled.set(n ? `Dodano ${n} do dzisiejszej powtórki` : 'Te fiszki już są w dzisiejszej powtórce');
  }
  protected next(): void { this.session.nextQuestion(); window.scrollTo(0, 0); }
}
