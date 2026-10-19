import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AiService, cardContext } from '../../core/ai.service';
import { ContentService } from '../../core/content.service';
import { SessionService } from '../../core/session.service';
import { AskClaude } from '../../shared/ai-answer';
import { CheatSheetView } from '../../shared/cheat-sheet';

/** /sciaga/:cat/:topic — route params arrive as inputs (withComponentInputBinding). */
@Component({
  selector: 'app-sheet-detail-page',
  imports: [CheatSheetView, AskClaude],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="view">
      <div class="backbar">
        <button class="btn ghost" style="min-height:40px;padding:8px 12px" (click)="back()">← {{ inSession() ? 'Wróć do sesji' : 'Wróć' }}</button>
        <span class="eyebrow">Ściąga</span>
      </div>
      <div class="card"><app-cheat-sheet [cat]="cat()" [topic]="topic()" [showActions]="!inSession()" /></div>
      @if (ai.available()) {
        <div class="card stack">
          <h3>Dopytaj o ten temat</h3>
          <app-ask-claude [context]="context()" placeholder="np. a jak to działa z async?" />
        </div>
      }
    </section>
  `,
})
export class SheetDetailPage {
  protected readonly ai = inject(AiService);
  private readonly content = inject(ContentService);
  private readonly session = inject(SessionService);
  private readonly location = inject(Location);
  readonly cat = input.required<string>();
  readonly topic = input.required<string>();

  protected readonly inSession = computed(() => !!this.session.study() || !!this.session.quiz());
  protected readonly context = computed(() => {
    const sh = this.content.sheet(this.cat(), this.topic());
    const cards = this.content.cardsFor(this.cat(), this.topic()).slice(0, 4).map(cardContext).join('\n\n');
    return `Temat: ${this.topic()} (${this.content.catName(this.cat())})\nŚciąga:\n${sh ? sh.points.join('\n') : '(brak)'}\n\nPowiązane pytania:\n${cards}`;
  });

  protected back(): void { this.location.back(); }
}
