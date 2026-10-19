import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { BrowseMode, UiStateService } from '../../core/ui-state.service';
import { CheatSheetView } from '../../shared/cheat-sheet';
import { SpeakButton } from '../../shared/speak';
import { ShowMore } from '../../shared/show-more';
import { CatTag, CodeBlock, LevelBadge, PluralPipe, RichPipe } from '../../shared/ui';

const PAGE = 40;
const TOPICS_PER_CAT = 8;

@Component({
  selector: 'app-sheets-page',
  imports: [CatTag, CodeBlock, LevelBadge, RichPipe, PluralPipe, CheatSheetView, RouterLink, SpeakButton, ShowMore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sheets.page.html',
})
export class SheetsPage {
  protected readonly content = inject(ContentService);
  protected readonly store = inject(ProgressStore);
  protected readonly ui = inject(UiStateService);
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  /** ?tryb=moja opens "Moja ściąga" (bound by withComponentInputBinding) */
  readonly tryb = input<string>();

  protected readonly mode = computed<BrowseMode>(() => (this.tryb() === 'moja' ? 'mine' : this.tryb() === 'pytania' ? 'cards' : this.ui.browseMode()));
  protected readonly modes: { key: BrowseMode; label: string; q: string | null }[] = [
    { key: 'sheets', label: 'Ściągi', q: null }, { key: 'mine', label: 'Moja ściąga', q: 'moja' }, { key: 'cards', label: 'Wszystkie pytania', q: 'pytania' },
  ];
  private readonly term = computed(() => this.ui.browseQuery().trim().toLowerCase());

  protected readonly sheetGroups = computed(() => {
    const term = this.term(); const only = this.ui.browseCat();
    return this.content.categories()
      .filter(c => only === 'all' || c.cat === only)
      .map(c => ({
        cat: c.cat,
        topics: this.content.sheetTopics(c.cat).filter(t => {
          if (!term) return true;
          const sh = this.content.sheet(c.cat, t)!;
          return (t + ' ' + sh.points.join(' ') + ' ' + (sh.pitfalls ?? []).join(' ')).toLowerCase().includes(term);
        }),
      }))
      .filter(g => g.topics.length);
  });
  protected readonly sheetTotal = computed(() => this.sheetGroups().reduce((a, g) => a + g.topics.length, 0));
  protected readonly mine = computed(() => { this.store.state(); return this.store.weakTopics(200); });

  protected readonly cardMatches = computed(() => {
    const term = this.term(); const only = this.ui.browseCat();
    return this.content.cards().filter(c => (only === 'all' || c.cat === only) &&
      (!term || `${c.q} ${c.a} ${c.topic} ${c.code ?? ''} ${c.deep ?? ''}`.toLowerCase().includes(term)));
  });
  protected readonly cardGroups = computed(() => {
    const m = new Map<string, { cat: string; topic: string; cards: typeof list }>();
    const list = this.cardMatches().slice(0, this.limit());
    for (const c of list) { const k = c.cat + '|' + c.topic; const g = m.get(k) ?? { cat: c.cat, topic: c.topic, cards: [] }; g.cards.push(c); m.set(k, g); }
    return [...m.values()];
  });
  /** incremental pagination of „Wszystkie pytania” */
  protected readonly limit = signal(PAGE);
  protected readonly page = PAGE;
  /** categories whose full topic list is expanded in „Ściągi” */
  protected readonly expandedCats = signal<ReadonlySet<string>>(new Set());
  protected readonly topicsPerCat = TOPICS_PER_CAT;
  protected readonly mineLimit = signal(10);

  constructor() {
    // new filter → start from the first page
    effect(() => { this.ui.browseQuery(); this.ui.browseCat(); this.mode(); untracked(() => this.limit.set(PAGE)); });
  }
  protected expandCat(cat: string): void { this.expandedCats.update(s => new Set(s).add(cat)); }

  protected readonly Math = Math;
  protected setMode(m: { key: BrowseMode; q: string | null }): void {
    this.ui.browseMode.set(m.key);
    void this.router.navigate(['/sciagi'], { queryParams: m.q ? { tryb: m.q } : {} });
  }
  protected stateClass(id: string): string {
    const s = this.store.cardState(id);
    return 'state' + (s === 'mastered' ? ' m' : s === 'learning' ? ' l' : '');
  }
}
