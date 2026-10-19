import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { shuffle } from '../../core/srs';
import { UiStateService } from '../../core/ui-state.service';
import { CatChips } from '../../shared/cat-chips';

@Component({
  selector: 'app-cards-setup-page',
  imports: [CatChips, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="view">
      <div class="stack">
        <h1>Fiszki</h1>
        <p class="muted">Pytanie, chwila na odpowiedź w głowie (albo na głos), potem odkryj i oceń się. Algorytm sam ustali, kiedy karta wróci.</p>
      </div>
      <app-cat-chips />
      @if (topics().length) {
        <div class="stack">
          <label class="eyebrow" for="topic">Temat</label>
          <select id="topic" [value]="ui.topic()" (change)="ui.topic.set($any($event.target).value)">
            <option value="">Wszystkie tematy</option>
            @for (t of topics(); track t[0]) { <option [value]="t[0]">{{ t[0] }} ({{ t[1] }})</option> }
          </select>
        </div>
      }
      <div class="card stack">
        <button class="btn primary block" [disabled]="!(due() + freshToday())" (click)="session.startDaily(cats())">
          Powtórka + nowe <small>{{ due() }} + {{ freshToday() }}</small>
        </button>
        <button class="btn block" [disabled]="!freshAll()" (click)="studyNew()">Tylko nowe karty <small>{{ freshAll() }} czeka</small></button>
        <button class="btn block" (click)="browse()">Przejrzyj losowe 40 <small>bez wpływu na harmonogram</small></button>
        @if (ui.topic() && singleCat()) {
          <button class="btn block" (click)="studyTopic()">Tylko temat: {{ ui.topic() }}</button>
          <a class="btn ghost block" [routerLink]="['/sciaga', singleCat(), ui.topic()]">Ściąga: {{ ui.topic() }}</a>
        }
      </div>
      <p class="muted" style="font-size:.82rem">
        Limit nowych kart dziennie: {{ store.settings().newPerDay }} (zmienisz w zakładce Postęp). Zostało dziś: {{ store.newLeftToday() }}.
      </p>
    </section>
  `,
})
export class CardsSetupPage {
  protected readonly content = inject(ContentService);
  protected readonly store = inject(ProgressStore);
  protected readonly session = inject(SessionService);
  protected readonly ui = inject(UiStateService);

  /** undefined = all categories */
  protected readonly cats = computed(() => (this.ui.selectedCats().size ? new Set(this.ui.selectedCats()) : undefined));
  protected readonly singleCat = computed(() => (this.ui.selectedCats().size === 1 ? [...this.ui.selectedCats()][0] : null));
  protected readonly due = computed(() => this.store.dueCards(this.cats()).length);
  protected readonly freshAll = computed(() => this.store.newCards(this.cats()).length);
  protected readonly freshToday = computed(() => Math.min(this.freshAll(), this.store.newLeftToday()));
  protected readonly topics = computed(() => {
    const cat = this.singleCat();
    if (!cat) return [] as [string, number][];
    const m = new Map<string, number>();
    for (const c of this.content.cardsFor(cat)) if (this.store.levelOk(c)) m.set(c.topic, (m.get(c.topic) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pl'));
  });

  protected studyNew(): void {
    const fresh = this.store.newCards(this.cats()).slice(0, Math.max(10, this.store.newLeftToday()));
    this.session.startStudy(fresh, 'Nowe karty', { newIds: fresh.map(c => c.id) });
  }
  protected browse(): void {
    const cats = this.cats();
    const topic = this.ui.topic();
    const pool = this.content.cards().filter(c => (!cats || cats.has(c.cat)) && this.store.levelOk(c) && (!topic || c.topic === topic));
    this.session.startStudy(shuffle(pool).slice(0, 40), 'Przegląd', { srs: false });
  }
  protected studyTopic(): void {
    const cat = this.singleCat();
    if (cat) this.session.startStudy(this.content.cardsFor(cat, this.ui.topic()), this.ui.topic(), { srs: false });
  }
}
