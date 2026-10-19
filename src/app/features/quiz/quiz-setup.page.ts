import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { shuffle } from '../../core/srs';
import { QuizMode, UiStateService } from '../../core/ui-state.service';
import { CatChips } from '../../shared/cat-chips';

@Component({
  selector: 'app-quiz-setup-page',
  imports: [CatChips],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="view">
      <div class="stack">
        <h1>Test</h1>
        <p class="muted">Scenariusze, „co wypisze ten kod”, „co tu jest nie tak”. Po błędnej odpowiedzi dostajesz wyjaśnienie, ściągę z tematu i możesz dorzucić fiszki do powtórki.</p>
      </div>
      <app-cat-chips />
      <div class="stack">
        <p class="eyebrow">Liczba pytań</p>
        <div class="seg">
          @for (n of counts; track n) { <button [attr.aria-pressed]="ui.quizCount() === n" (click)="ui.quizCount.set(n)">{{ n || 'Wszystkie' }}</button> }
        </div>
      </div>
      <div class="stack">
        <p class="eyebrow">Które pytania</p>
        <div class="seg">
          @for (m of modes(); track m.key) { <button [attr.aria-pressed]="ui.quizMode() === m.key" (click)="ui.quizMode.set(m.key)">{{ m.label }}</button> }
        </div>
      </div>
      <button class="btn primary block" [disabled]="!selected().length" (click)="start()">Start <small>z {{ selected().length }} pytań</small></button>
    </section>
  `,
})
export class QuizSetupPage {
  private readonly content = inject(ContentService);
  private readonly store = inject(ProgressStore);
  private readonly session = inject(SessionService);
  protected readonly ui = inject(UiStateService);
  protected readonly counts = [10, 20, 30, 0];

  private readonly pool = computed(() => {
    const cats = this.ui.selectedCats();
    return this.content.quiz().filter(q => (!cats.size || cats.has(q.cat)) && this.store.levelOk(q));
  });
  protected readonly modes = computed<{ key: QuizMode; label: string }[]>(() => {
    this.store.state();
    const p = this.pool();
    return [
      { key: 'mix', label: 'Mieszane' },
      { key: 'unseen', label: `Nowe (${p.filter(q => !this.store.quizSeen(q.id)).length})` },
      { key: 'wrong', label: `Błędne (${p.filter(q => this.store.quizWrong(q.id)).length})` },
    ];
  });
  protected readonly selected = computed(() => {
    this.store.state();
    const mode = this.ui.quizMode();
    return this.pool().filter(q => mode === 'mix' || (mode === 'unseen' ? !this.store.quizSeen(q.id) : this.store.quizWrong(q.id)));
  });

  protected start(): void {
    const n = this.ui.quizCount();
    const qs = shuffle(this.selected());
    this.session.startQuiz(n ? qs.slice(0, n) : qs, 'Test');
  }
}
