import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { Level } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { shuffle, dayKey } from '../../core/srs';
import { SyncService } from '../../core/sync.service';
import { Theme, UiStateService } from '../../core/ui-state.service';
import { CatTag, LevelBadge, PluralPipe } from '../../shared/ui';

@Component({
  selector: 'app-stats-page',
  imports: [CatTag, LevelBadge, PluralPipe, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats.page.html',
})
export class StatsPage {
  protected readonly content = inject(ContentService);
  protected readonly store = inject(ProgressStore);
  protected readonly ui = inject(UiStateService);
  protected readonly sync = inject(SyncService);
  private readonly session = inject(SessionService);
  protected readonly confirmReset = signal(false);

  protected readonly seen = computed(() => Object.keys(this.store.state().cards).filter(id => this.content.byId().has(id)));
  protected readonly mastered = computed(() => { this.store.state(); return this.seen().filter(id => this.store.cardState(id) === 'mastered').length; });
  protected readonly accuracy = computed(() => {
    let ok = 0, t = 0;
    for (const [id, v] of Object.entries(this.store.state().quiz)) if (this.content.byId().has(id)) { ok += v.c; t += v.c + v.w; }
    return t ? Math.round((ok / t) * 100) + '%' : '–';
  });
  protected readonly byLevel = computed(() => {
    this.store.state();
    return ([1, 2, 3] as Level[]).map(l => {
      const cs = this.content.cards().filter(c => (c.level ?? 2) === l);
      const m = cs.filter(c => this.store.cardState(c.id) === 'mastered').length;
      return { l, n: cs.length, m, pct: cs.length ? (m / cs.length) * 100 : 0 };
    });
  });
  protected readonly heat = computed(() => {
    const days = this.store.state().days;
    const d = new Date(); d.setDate(d.getDate() - 69);
    const out: { key: string; v: number; cls: string }[] = [];
    for (let i = 0; i < 70; i++) {
      const key = dayKey(d); const v = days[key] ?? 0;
      out.push({ key, v, cls: v >= 40 ? 'h3' : v >= 15 ? 'h2' : v ? 'h1' : '' });
      d.setDate(d.getDate() + 1);
    }
    return out;
  });
  protected readonly weak = computed(() => { this.store.state(); return this.store.weakTopics(8); });
  protected readonly history = computed(() => [...this.store.state().hist].reverse().slice(0, 10));
  protected readonly modeLabel: Record<string, string> = { quiz: 'Test', cards: 'Fiszki', interview: 'Próbna rozmowa' };
  protected readonly newPerDayOptions = [5, 10, 15, 25, 40];
  protected readonly levels: { l: Level; label: string }[] = [{ l: 1, label: 'Junior' }, { l: 2, label: 'Mid' }, { l: 3, label: 'Senior' }];
  protected readonly themes: { t: Theme; label: string }[] = [{ t: '', label: 'Systemowy' }, { t: 'light', label: 'Jasny' }, { t: 'dark', label: 'Ciemny' }];

  protected practice(cat: string, topic: string): void {
    const qs = this.content.quizFor(cat, topic);
    if (qs.length >= 2) this.session.startQuiz(shuffle(qs), topic);
    else this.session.startStudy(this.content.cardsFor(cat, topic), topic, { srs: false });
  }
  protected toggleLevel(l: Level): void { if (!this.store.toggleLevel(l)) this.ui.showToast('Zostaw zaznaczony przynajmniej jeden poziom'); }
  protected reset(): void { this.store.reset(); this.confirmReset.set(false); this.ui.showToast('Postęp wyzerowany'); }
}
