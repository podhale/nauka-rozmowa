import { ChangeDetectionStrategy, Component, inject, input, signal, viewChild } from '@angular/core';
import { AiService, AiUnavailableError } from '../core/ai.service';
import { MarkdownPipe } from './ui';

/**
 * A streamed Claude answer. Call `run(key, prompt)` from the parent (via viewChild)
 * or use <app-ask-claude> which adds the input box.
 */
@Component({
  selector: 'app-ai-answer',
  imports: [MarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state() !== 'idle') {
      <div class="ai" [class.wait]="state() === 'thinking'">
        <span class="h">{{ label() }}</span>
        @if (state() === 'thinking') { <div class="md"><p>Claude myśli…</p></div> }
        @else { <div class="md" [innerHTML]="text() | markdown"></div> }
        @if (error()) { <p class="muted">{{ error() }}</p> }
      </div>
    }
  `,
})
export class AiAnswer {
  private readonly ai = inject(AiService);
  readonly label = input('Claude');
  protected readonly state = signal<'idle' | 'thinking' | 'streaming' | 'done'>('idle');
  protected readonly text = signal('');
  protected readonly error = signal<string | null>(null);

  async run(key: string, prompt: string): Promise<void> {
    this.state.set('thinking'); this.text.set(''); this.error.set(null);
    try {
      const t = await this.ai.ask(key, prompt, t => { this.text.set(t); this.state.set('streaming'); });
      this.text.set(t); this.state.set('done');
    } catch (e) {
      if (e instanceof AiUnavailableError) { this.state.set('idle'); return; }
      this.error.set((e as Error).message); this.state.set('done');
    }
  }
}

/** Input box + streamed answer for follow-up questions. `context` describes what the learner is looking at. */
@Component({
  selector: 'app-ask-claude',
  imports: [AiAnswer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ai.available()) {
      <form class="ask" (submit)="submit($event, q)">
        <input #q [placeholder]="placeholder()" autocomplete="off" aria-label="Pytanie do Claude'a" />
        <button class="btn primary" style="min-height:44px">Zapytaj</button>
      </form>
      <app-ai-answer />
    }
  `,
})
export class AskClaude {
  protected readonly ai = inject(AiService);
  readonly context = input.required<string>();
  readonly placeholder = input('Czego tu nie rozumiesz?');
  private readonly answer = viewChild(AiAnswer);

  protected submit(e: Event, box: HTMLInputElement): void {
    e.preventDefault();
    const q = box.value.trim();
    if (!q) return;
    void this.answer()?.run(
      'ask|' + this.context().slice(0, 200) + '|' + q,
      `Kandydat przygotowuje się do rozmowy rekrutacyjnej i uczy się z poniższego materiału:\n${this.context()}\n\nJego pytanie: ${q}\n\nOdpowiedz zwięźle (do ~200 słów), z krótkim przykładem kodu jeśli pomaga.`,
    );
  }
}
