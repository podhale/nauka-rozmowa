import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { STUDY_PLAN } from '../../core/study-plan';
import { UiStateService } from '../../core/ui-state.service';
import { ContentService } from '../../core/content.service';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { LevelBadge, PluralPipe } from '../../shared/ui';

/** /nauka — reading modules with lessons, read status and exam results. */
@Component({
  selector: 'app-learn-page',
  imports: [RouterLink, LevelBadge, PluralPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="view">
      <div class="stack">
        <h1>Nauka</h1>
        <p class="muted">Lekcje do spokojnego czytania, np. wieczorem. Każda ma 10–15 minut, kończy się listą „najważniejsze do zapamiętania” i egzaminem. Zaliczenie od 80%.</p>
      </div>

      <div class="seg">
        <button [attr.aria-pressed]="tab() === 'plan'" (click)="tab.set('plan')">Plan dla fullstacka</button>
        <button [attr.aria-pressed]="tab() === 'modules'" (click)="tab.set('modules')">Wszystkie moduły</button>
      </div>

      @if (tab() === 'plan') {
        <div class="card stack" style="gap:4px">
          <p class="muted" style="font-size:.9rem">Kolejność według ofert pracy i Twojego CV. Priorytet 1 = pytają na każdej rozmowie. Przy ok. 1 h dziennie to mniej więcej 4 tygodnie; angielski 10–15 min dziennie przez cały czas.</p>
          @for (st of plan(); track st.id) {
            <div class="plan-step">
              <div class="plan-ring" [style.--p]="st.pct"><span>{{ st.pct }}%</span></div>
              <div style="min-width:0">
                <div class="row" style="gap:8px">
                  <b>{{ st.title }}</b>
                  <span class="pill" [class.no]="st.priority === 1" [class.mid]="st.priority === 2" [class.ok]="st.priority === 3">P{{ st.priority }}</span>
                  <span class="muted" style="font-size:.8rem">{{ st.week ? 'tydzień ' + st.week : 'codziennie' }}</span>
                </div>
                <p class="muted" style="font-size:.88rem;margin-top:2px">{{ st.why }}</p>
                <div class="plan-links">
                  @for (l of st.lessonRows; track l.id) {
                    <a [routerLink]="['/nauka', l.id]" [class.done]="l.read">{{ l.read ? '✓ ' : '' }}{{ l.title }}</a>
                  }
                  @for (c of st.cats; track c) {
                    <button (click)="cards(c)">Fiszki: {{ catName(c) }}</button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
      @if (next(); as n) {
        <a class="card stack continue" [routerLink]="['/nauka', n.id]">
          <span class="eyebrow">{{ anyRead() ? 'Czytaj dalej' : 'Zacznij od' }}</span>
          <b class="lesson-title">{{ n.title }}</b>
          <span class="muted" style="font-size:.88rem">{{ n.minutes }} min · {{ moduleTitle(n.module) }}</span>
        </a>
      }

      <div class="kv">
        <div><b>{{ stats().read }}</b><span>z {{ stats().total }} lekcji przeczytanych</span></div>
        <div><b style="color:var(--good)">{{ stats().passed }}</b><span>egzaminów zaliczonych</span></div>
        <div><b>{{ stats().minutesLeft }}</b><span>min czytania zostało</span></div>
      </div>

      @for (m of rows(); track m.module) {
        <div class="card stack module" style="gap:0;padding:6px 16px 12px">
          <button class="module-head" (click)="toggle(m.module)" [attr.aria-expanded]="open() === m.module">
            <span style="min-width:0">
              <b>{{ m.title }}</b>
              <span class="muted" style="display:block;font-size:.85rem">{{ m.read }}/{{ m.lessons.length }} przeczytanych · {{ m.passed }} {{ m.passed | plural: 'egzamin' : 'egzaminy' : 'egzaminów' }} zaliczonych</span>
              <span class="bar"><span class="m" [style.width.%]="m.pct"></span></span>
            </span>
            <span class="muted">{{ open() === m.module ? '–' : '+' }}</span>
          </button>
          @if (open() === m.module) {
            <div class="list">
              @for (l of m.lessons; track l.id; let i = $index) {
                <a class="li lesson-row" [routerLink]="['/nauka', l.id]">
                  <span class="num lesson-no" [class.done]="l.read">{{ l.read ? '✓' : i + 1 }}</span>
                  <span style="min-width:0;flex:1">
                    <b>{{ l.title }}</b>
                    <span class="row" style="gap:8px;margin-top:4px">
                      <span class="muted" style="font-size:.82rem">{{ l.minutes }} min</span>
                      <app-level [level]="l.level" />
                      @if (l.best != null) {
                        <span class="pill" [class.ok]="l.best >= 80" [class.mid]="l.best < 80">egzamin {{ l.best }}%</span>
                      }
                    </span>
                  </span>
                  <span class="muted">→</span>
                </a>
              }
            </div>
            <div class="row" style="justify-content:space-between;margin-top:10px">
              <span class="muted" style="font-size:.85rem">
                @if (m.moduleBest != null) { Egzamin z modułu: <b [style.color]="m.moduleBest >= 80 ? 'var(--good)' : 'var(--warn)'">{{ m.moduleBest }}%</b> }
                @else { 20 pytań ze wszystkich lekcji modułu }
              </span>
              <button class="btn" (click)="session.startModuleExam(m.module)">Egzamin z modułu</button>
            </div>
          }
        </div>
      } @empty {
        <div class="empty"><h3>Lekcje w przygotowaniu</h3><p class="muted">Pojawią się tu po najbliższej aktualizacji bazy.</p></div>
      }
      }
    </section>
  `,
})
export class LearnPage {
  private readonly content = inject(ContentService);
  private readonly store = inject(ProgressStore);
  protected readonly session = inject(SessionService);
  protected readonly open = signal<string | null>(null);
  protected readonly tab = signal<'plan' | 'modules'>('plan');
  private readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  /** Plan steps with progress: lessons read + flashcards seen in the step's areas. */
  protected readonly plan = computed(() => {
    const st = this.store.state();
    const lp = st.lessons ?? {};
    const lessonsById = new Map(this.content.lessons().map(l => [l.id, l]));
    return STUDY_PLAN.map(p => {
      const lessonRows = p.lessons.filter(id => lessonsById.has(id)).map(id => ({ id, title: lessonsById.get(id)!.title, read: !!lp[id]?.read }));
      const cards = p.cats.flatMap(c => this.content.cardsFor(c));
      const seen = cards.filter(c => st.cards[c.id]).length;
      const parts = (lessonRows.length ? lessonRows.filter(l => l.read).length / lessonRows.length : 0) * (lessonRows.length ? 0.5 : 0)
        + (cards.length ? (seen / cards.length) * (lessonRows.length ? 0.5 : 1) : 0);
      return { ...p, lessonRows, pct: Math.round(parts * 100) };
    });
  });
  protected catName(c: string): string { return this.content.catName(c); }
  protected cards(cat: string): void { this.ui.selectOnly(cat); void this.router.navigate(['/fiszki']); }

  protected readonly rows = computed(() => {
    const lp = this.store.state().lessons ?? {};
    return this.content.modules().map(m => {
      const lessons = m.lessons.map(l => ({ ...l, read: !!lp[l.id]?.read, best: lp[l.id]?.best }));
      const read = lessons.filter(l => l.read).length;
      return {
        module: m.module, title: m.title, lessons, read,
        passed: lessons.filter(l => (l.best ?? 0) >= 80).length,
        pct: lessons.length ? (read / lessons.length) * 100 : 0,
        moduleBest: lp['module:' + m.module]?.best,
      };
    });
  });
  protected readonly stats = computed(() => {
    const all = this.rows().flatMap(r => r.lessons);
    return {
      total: all.length,
      read: all.filter(l => l.read).length,
      passed: all.filter(l => (l.best ?? 0) >= 80).length,
      minutesLeft: all.filter(l => !l.read).reduce((a, l) => a + l.minutes, 0),
    };
  });
  protected readonly anyRead = computed(() => this.stats().read > 0);
  protected readonly next = computed(() => this.rows().flatMap(r => r.lessons).find(l => !l.read));

  constructor() {
    // open the module of the next lesson by default
    queueMicrotask(() => { const n = this.next(); this.open.set(n?.module ?? this.rows()[0]?.module ?? null); });
  }

  protected toggle(m: string): void { this.open.update(x => (x === m ? null : m)); }
  protected moduleTitle(m?: string): string { return this.content.modules().find(x => x.module === m)?.title ?? ''; }
}
