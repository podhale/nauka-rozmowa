import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AiGrade, AiService, AiUnavailableError, cardContext } from '../../core/ai.service';
import { ContentService } from '../../core/content.service';
import { Grade } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { AskClaude } from '../../shared/ai-answer';
import { SpeakButton } from '../../shared/speak';
import { CatTag, CodeBlock, LevelBadge, RichPipe } from '../../shared/ui';

@Component({
  selector: 'app-study-page',
  imports: [CatTag, CodeBlock, LevelBadge, RichPipe, RouterLink, AskClaude, SpeakButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './study.page.html',
})
export class StudyPage implements OnInit {
  protected readonly session = inject(SessionService);
  protected readonly store = inject(ProgressStore);
  protected readonly content = inject(ContentService);
  protected readonly ai = inject(AiService);
  private readonly router = inject(Router);

  protected readonly s = this.session.study;
  protected readonly card = this.session.currentCard;
  protected readonly elapsed = signal(0);
  protected readonly grading = signal<'idle' | 'busy' | 'done' | 'error'>('idle');
  protected readonly gradeResult = signal<AiGrade | null>(null);
  protected readonly gradeError = signal('');
  protected readonly askOpen = signal(false);

  protected readonly grades: { g: Grade; label: string }[] = [
    { g: 0, label: 'Nie wiem' }, { g: 1, label: 'Trudne' }, { g: 2, label: 'Dobrze' }, { g: 3, label: 'Łatwe' },
  ];
  protected readonly progressPct = computed(() => { const s = this.s(); return s ? (s.index / s.queue.length) * 100 : 0; });
  protected readonly isNewCard = computed(() => { const c = this.card(); this.store.state(); return !!c && this.store.isNew(c.id); });
  protected readonly hasSheet = computed(() => { const c = this.card(); return !!c && !!this.content.sheet(c.cat, c.topic); });
  protected readonly askContext = computed(() => { const c = this.card(); return c ? cardContext(c) : ''; });

  constructor() {
    const timer = setInterval(() => { const s = this.s(); if (s?.interview && !s.revealed) this.elapsed.set(Math.floor((Date.now() - s.questionStartedAt) / 1000)); }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    // New card → reset per-card UI state.
    effect(() => { this.card(); untracked(() => { this.grading.set('idle'); this.gradeResult.set(null); this.askOpen.set(false); this.elapsed.set(0); }); });
  }

  ngOnInit(): void {
    if (!this.s()) void this.router.navigate(['/fiszki']);
  }

  protected interval(g: Grade): string {
    const c = this.card();
    if (!c || !this.s()?.srs) return ' ';
    return g === 0 ? 'jutro' : `${this.store.previewInterval(c.id, g)} d`;
  }
  protected timer(): string { const t = this.elapsed(); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; }

  protected reveal(): void {
    this.session.reveal();
    const s = this.s(); const c = this.card();
    if (s?.interview && s.typed.trim() && c && this.ai.available()) void this.gradeTyped(c.id, s.typed);
  }
  private async gradeTyped(id: string, typed: string): Promise<void> {
    const c = this.content.card(id); if (!c) return;
    this.grading.set('busy');
    try {
      const r = await this.ai.grade(c, typed);
      if (this.card()?.id !== id) return;
      this.gradeResult.set(r); this.grading.set('done'); this.session.addAiScore(r.score);
    } catch (e) {
      if (e instanceof AiUnavailableError) { this.grading.set('idle'); return; }
      this.gradeError.set((e as Error).message); this.grading.set('error');
    }
  }
  protected grade(g: Grade): void { this.session.grade(g); window.scrollTo(0, 0); }
  protected quit(): void { this.session.finishStudy(); }
}
