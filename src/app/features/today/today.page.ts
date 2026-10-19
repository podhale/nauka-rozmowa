import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { UiStateService } from '../../core/ui-state.service';
import { CatTag, PluralPipe } from '../../shared/ui';

@Component({
  selector: 'app-today-page',
  imports: [CatTag, PluralPipe, RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './today.page.html',
})
export class TodayPage {
  protected readonly content = inject(ContentService);
  protected readonly store = inject(ProgressStore);
  protected readonly session = inject(SessionService);
  private readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  protected readonly due = computed(() => this.store.dueCards().length);
  protected readonly fresh = computed(() => Math.min(this.store.newLeftToday(), this.store.newCards().length));
  protected readonly total = computed(() => this.due() + this.fresh());
  protected readonly wrongCount = computed(() => {
    this.store.state();
    return this.content.quiz().filter(q => this.store.quizWrong(q.id)).length;
  });
  protected readonly seen = computed(() => Object.keys(this.store.state().cards).filter(id => this.content.byId().has(id)).length);
  protected readonly weak = computed(() => { this.store.state(); return this.store.weakTopics(3); });
  protected readonly groups = computed(() => {
    this.store.state();
    return this.content.groups().map(g => ({
      ...g,
      rows: g.cats.map(cat => {
        const s = this.store.catStats(cat);
        return { cat, ...s, pm: s.n ? (s.m / s.n) * 100 : 0, pl: s.n ? (s.l / s.n) * 100 : 0 };
      }),
    }));
  });

  protected openCategory(cat: string): void {
    this.ui.selectOnly(cat);
    void this.router.navigate(['/fiszki']);
  }
}
