import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { Level } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { SearchKind, SearchService } from '../../core/search.service';
import { SessionService } from '../../core/session.service';
import { CheatSheetView } from '../../shared/cheat-sheet';
import { HighlightPipe } from '../../shared/highlight.pipe';
import { ShowMore } from '../../shared/show-more';
import { SpeakButton } from '../../shared/speak';
import { CatTag, CodeBlock, LevelBadge, PluralPipe, RichPipe } from '../../shared/ui';

/** Search state lives here (not per visit) so coming back from a result keeps the query. */
const state = {
  query: signal(''),
  cat: signal('all'),
  level: signal<Level | 0>(0),
  kinds: signal<ReadonlySet<SearchKind>>(new Set<SearchKind>(['card', 'quiz', 'sheet'])),
};

@Component({
  selector: 'app-search-page',
  imports: [CatTag, LevelBadge, CodeBlock, RichPipe, PluralPipe, HighlightPipe, CheatSheetView, RouterLink, SpeakButton, ShowMore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.page.html',
})
export class SearchPage {
  protected readonly content = inject(ContentService);
  private readonly search = inject(SearchService);
  private readonly store = inject(ProgressStore);
  private readonly session = inject(SessionService);
  protected readonly s = state;
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('q');

  protected readonly kindOptions: { k: SearchKind; label: string }[] = [
    { k: 'card', label: 'Fiszki' }, { k: 'quiz', label: 'Test' }, { k: 'sheet', label: 'Ściągi' },
  ];
  protected readonly levelOptions: { l: Level | 0; label: string }[] = [
    { l: 0, label: 'Wszystkie' }, { l: 1, label: 'Junior' }, { l: 2, label: 'Mid' }, { l: 3, label: 'Senior' },
  ];
  protected readonly suggestions = ['async await', 'signal effect', 'N+1', 'middleware', 'SOLID', 'indeks', 'JWT', 'docker', 'switchMap', 'DI lifetime'];

  protected readonly result = computed(() =>
    this.search.search(state.query(), { cat: state.cat(), level: state.level(), kinds: state.kinds() }));
  protected readonly counts = computed(() => {
    const c = { card: 0, quiz: 0, sheet: 0 };
    for (const h of this.result().hits) c[h.kind]++;
    return c;
  });
  protected readonly expanded = signal<string | null>(null);
  protected readonly limit = signal(30);
  protected readonly visible = computed(() => this.result().hits.slice(0, this.limit()));
  protected readonly Math = Math;

  constructor() {
    effect(() => { state.query(); state.cat(); state.level(); state.kinds(); untracked(() => this.limit.set(30)); });
    afterNextRender(() => this.input()?.nativeElement.focus());
  }

  protected toggleKind(k: SearchKind): void {
    state.kinds.update(s => {
      const n = new Set(s);
      if (n.has(k) && n.size > 1) n.delete(k); else n.add(k);
      return n;
    });
  }
  protected setLevel(v: string): void { const n = Number(v); state.level.set(n === 1 || n === 2 || n === 3 ? n : 0); }
  protected toggle(id: string): void { this.expanded.update(x => (x === id ? null : id)); }
  protected cardState(id: string): string {
    const s = this.store.cardState(id);
    return 'state' + (s === 'mastered' ? ' m' : s === 'learning' ? ' l' : '');
  }
  protected practiceQuestion(id: string): void {
    const q = this.content.question(id);
    if (q) this.session.startQuiz([q], 'Pytanie z wyszukiwarki');
  }
  protected practiceCard(id: string): void {
    const c = this.content.card(id);
    if (c) this.session.startStudy([c], 'Fiszka z wyszukiwarki', { srs: false });
  }
}
