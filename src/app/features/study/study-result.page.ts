import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { SessionService } from '../../core/session.service';
import { CatTag, PluralPipe } from '../../shared/ui';

@Component({
  selector: 'app-study-result-page',
  imports: [CatTag, PluralPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (r(); as s) {
      <section class="view">
        <div class="card stack" style="gap:14px">
          <p class="eyebrow">{{ s.title }} · koniec</p>
          <div class="row" style="align-items:baseline;gap:14px"><span class="score">{{ okPct() }}%</span><span class="muted">kart „dobrze” lub „łatwe”</span></div>
          <div class="kv">
            <div><b>{{ s.results.length }}</b><span>ocenionych</span></div>
            <div><b style="color:var(--bad)">{{ tally()[0] }}</b><span>nie wiem</span></div>
            <div><b style="color:var(--warn)">{{ tally()[1] }}</b><span>trudne</span></div>
          </div>
          @if (avgAi(); as avg) { <p>Średnia ocena Claude'a: <b>{{ avg }}/10</b> z {{ s.aiScores.length }} odpowiedzi.</p> }
          @if (s.interview) {
            <p class="muted">Średnio {{ avgSeconds() }} s na pytanie. Na rozmowie dobra odpowiedź trwa zwykle 1–2 minuty.</p>
          }
        </div>
        @if (weak().length) {
          <div class="card stack">
            <h3>Do podciągnięcia</h3>
            <div class="list sheetlist">
              @for (w of weak(); track w.key) {
                <a class="li" [routerLink]="['/sciaga', w.cat, w.topic]">
                  <span style="min-width:0"><app-cat-tag [cat]="w.cat" /><br /><b>{{ w.topic }}</b><br />
                    <span class="muted" style="font-size:.85rem">{{ w.n }} {{ w.n | plural: 'słaba odpowiedź' : 'słabe odpowiedzi' : 'słabych odpowiedzi' }} · otwórz ściągę</span></span>
                  <span class="muted">→</span>
                </a>
              }
            </div>
          </div>
        }
        <div class="actions">
          <a class="btn primary" routerLink="/">Wróć</a>
          <button class="btn" (click)="session.startQuickQuiz()">Szybki test</button>
        </div>
      </section>
    }
  `,
})
export class StudyResultPage implements OnInit {
  protected readonly session = inject(SessionService);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  protected readonly r = this.session.studyResult;

  protected readonly tally = computed(() => { const t = [0, 0, 0, 0]; for (const x of this.r()?.results ?? []) t[x.grade]++; return t; });
  protected readonly okPct = computed(() => { const n = this.r()?.results.length ?? 0; const t = this.tally(); return n ? Math.round(((t[2] + t[3]) / n) * 100) : 0; });
  protected readonly avgAi = computed(() => { const a = this.r()?.aiScores ?? []; return a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null; });
  protected readonly avgSeconds = computed(() => { const s = this.r(); return s ? Math.round((Date.now() - s.startedAt) / 1000 / Math.max(1, s.results.length)) : 0; });
  protected readonly weak = computed(() => {
    const m = new Map<string, { key: string; cat: string; topic: string; n: number }>();
    for (const x of this.r()?.results ?? []) {
      if (x.grade > 1) continue;
      const c = this.content.card(x.id); if (!c) continue;
      const key = c.cat + '|' + c.topic;
      const e = m.get(key) ?? { key, cat: c.cat, topic: c.topic, n: 0 };
      e.n++; m.set(key, e);
    }
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 6);
  });

  ngOnInit(): void { if (!this.r()) void this.router.navigate(['/']); }
}
