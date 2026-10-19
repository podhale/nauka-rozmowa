import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiService } from '../../core/ai.service';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { UiStateService } from '../../core/ui-state.service';
import { AskClaude } from '../../shared/ai-answer';
import { SpeakButton } from '../../shared/speak';
import { CatTag, CodeBlock, LevelBadge, MarkdownPipe, RichPipe } from '../../shared/ui';

/** /nauka/:id — the lesson reader (route param bound as input). */
@Component({
  selector: 'app-lesson-page',
  imports: [RouterLink, CatTag, CodeBlock, LevelBadge, MarkdownPipe, RichPipe, SpeakButton, AskClaude],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lesson.page.html',
})
export class LessonPage {
  private readonly content = inject(ContentService);
  private readonly store = inject(ProgressStore);
  private readonly ui = inject(UiStateService);
  protected readonly session = inject(SessionService);
  protected readonly ai = inject(AiService);
  readonly id = input.required<string>();

  protected readonly lesson = computed(() => this.content.lesson(this.id()));
  protected readonly module = computed(() => this.content.modules().find(m => m.module === this.lesson()?.module));
  protected readonly progress = computed(() => { this.store.state(); return this.store.lessonProgress(this.id()); });
  /** null in templates means "no exam yet" (template ?. yields null, not undefined) */
  protected readonly best = computed(() => this.progress()?.best ?? null);
  protected readonly neighbours = computed(() => {
    const all = this.content.lessons(); const i = all.findIndex(l => l.id === this.id());
    return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
  });
  /** whole lesson as plain text for "read aloud" (code blocks skipped) */
  protected readonly plainText = computed(() => {
    const l = this.lesson(); if (!l) return '';
    const strip = (t: string) => t.replace(/`/g, '').replace(/\*\*/g, '').replace(/^\s*-\s+/gm, '');
    return [l.title, l.intro, ...l.sections.map(s => `${s.h}. ${strip(s.text)}`), 'Najważniejsze do zapamiętania.', ...l.takeaways.map(strip)].join('\n\n');
  });
  protected readonly askContext = computed(() => {
    const l = this.lesson(); if (!l) return '';
    return `Lekcja: ${l.title}\n${l.intro}\nNajważniejsze:\n${l.takeaways.join('\n')}`;
  });
  protected readonly readPct = signal(0);

  constructor() {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 100;
      this.readPct.set(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  protected markRead(): void {
    this.store.markLessonRead(this.id());
    this.ui.showToast('Oznaczono jako przeczytane');
  }
  protected exam(): void {
    if (!this.progress()?.read) this.store.markLessonRead(this.id());
    this.session.startLessonExam(this.id());
  }
}
