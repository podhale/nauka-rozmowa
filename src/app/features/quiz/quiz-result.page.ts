import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { QuizQuestion } from '../../core/models';
import { ProgressStore } from '../../core/progress.store';
import { SessionService } from '../../core/session.service';
import { shuffle } from '../../core/srs';
import { CatTag, CodeBlock, RichPipe } from '../../shared/ui';

@Component({
  selector: 'app-quiz-result-page',
  imports: [CatTag, CodeBlock, RichPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (r(); as s) {
      <section class="view">
        <div class="card stack" style="gap:12px">
          <p class="eyebrow">{{ s.title }} · wynik</p>
          <div class="row" style="align-items:baseline;gap:14px">
            <span class="score">{{ ok() }}/{{ s.results.length }}</span>
            <span class="pill" [class.ok]="pct() >= 85" [class.mid]="pct() >= 65 && pct() < 85" [class.no]="pct() < 65">{{ pct() }}%</span>
          </div>
          @if (s.examKey) {
            @if (s.results.length === s.ids.length) {
              <p class="pill" [class.ok]="pct() >= 80" [class.no]="pct() < 80" style="align-self:flex-start;font-size:.85rem;padding:4px 12px">{{ pct() >= 80 ? 'Egzamin zaliczony ✓' : 'Egzamin niezaliczony – próg to 80%' }}</p>
            } @else {
              <p class="muted">Egzamin przerwany przed końcem, więc wynik się nie liczy.</p>
            }
          }
          <p>{{ verdict() }}</p>
          @if (s.examKey && !s.examKey.startsWith('module:')) { <a class="linkbtn" [routerLink]="['/nauka', s.examKey]">Wróć do lekcji</a> }
          <div class="list">
            @for (c of byCat(); track c.cat) {
              <div class="li" style="flex-direction:row;justify-content:space-between;align-items:center"><app-cat-tag [cat]="c.cat" /><span class="num" style="font-weight:600">{{ c.ok }}/{{ c.n }}</span></div>
            }
          </div>
        </div>

        @if (wrongTopics().length) {
          <div class="card stack">
            <h3>Ściągi do Twoich błędów</h3>
            <div class="list sheetlist">
              @for (t of wrongTopics(); track t.cat + t.topic) {
                <a class="li" [routerLink]="['/sciaga', t.cat, t.topic]"><span style="min-width:0"><app-cat-tag [cat]="t.cat" /><br /><b>{{ t.topic }}</b></span><span class="muted">→</span></a>
              }
            </div>
            <button class="btn" [disabled]="scheduled()" (click)="scheduleAll()">{{ scheduled() ?? 'Dodaj fiszki z tych tematów do powtórki' }}</button>
          </div>
        }

        @if (wrong().length) {
          <div class="stack">
            <h2>Błędne odpowiedzi</h2>
            @for (w of wrong(); track w.q.id) {
              <details class="item card" style="padding:14px">
                <summary><span [innerHTML]="w.q.q | rich"></span><span class="pill no">✕</span></summary>
                <div class="body">
                  <app-code [code]="w.q.code" [lang]="w.q.lang" />
                  <p><b style="color:var(--bad)">Twoja:</b> <span [innerHTML]="w.q.options[w.pick] | rich"></span></p>
                  <p><b style="color:var(--good)">Poprawna:</b> <span [innerHTML]="w.q.options[w.q.correct] | rich"></span></p>
                  <p class="muted" [innerHTML]="w.q.why | rich"></p>
                  <a class="linkbtn" [routerLink]="['/sciaga', w.q.cat, w.q.topic]">Ściąga: {{ w.q.topic }}</a>
                </div>
              </details>
            }
          </div>
        }
        <div class="actions">
          @if (wrong().length) { <button class="btn primary" (click)="retryWrong()">Powtórz błędne</button> }
          <a class="btn" [class.primary]="!wrong().length" routerLink="/">Wróć</a>
        </div>
      </section>
    }
  `,
})
export class QuizResultPage implements OnInit {
  private readonly session = inject(SessionService);
  private readonly content = inject(ContentService);
  private readonly store = inject(ProgressStore);
  private readonly router = inject(Router);
  protected readonly r = this.session.quizResult;
  protected readonly scheduled = signal<string | null>(null);

  protected readonly ok = computed(() => this.r()?.results.filter(x => x.ok).length ?? 0);
  protected readonly pct = computed(() => { const n = this.r()?.results.length ?? 0; return n ? Math.round((this.ok() / n) * 100) : 0; });
  protected readonly verdict = computed(() =>
    this.pct() >= 85 ? 'Świetnie, ten materiał masz opanowany.' : this.pct() >= 65 ? 'Solidnie. Przejrzyj błędy i ściągi poniżej.' : 'Warto wrócić do ściąg i fiszek z tych tematów.');
  protected readonly byCat = computed(() => {
    const m = new Map<string, { cat: string; ok: number; n: number }>();
    for (const x of this.r()?.results ?? []) {
      const cat = this.content.question(x.id)?.cat ?? '?';
      const e = m.get(cat) ?? { cat, ok: 0, n: 0 };
      e.n++; if (x.ok) e.ok++; m.set(cat, e);
    }
    return [...m.values()];
  });
  protected readonly wrong = computed(() =>
    (this.r()?.results ?? []).filter(x => !x.ok).map(x => ({ q: this.content.question(x.id)!, pick: x.pick })).filter(x => !!x.q));
  protected readonly wrongTopics = computed(() => {
    const m = new Map<string, QuizQuestion>();
    for (const w of this.wrong()) m.set(w.q.cat + '|' + w.q.topic, w.q);
    return [...m.values()].map(q => ({ cat: q.cat, topic: q.topic }));
  });

  ngOnInit(): void { if (!this.r()) void this.router.navigate(['/test']); }

  protected retryWrong(): void { this.session.startQuiz(shuffle(this.wrong().map(w => w.q)), 'Poprawa błędów'); }
  protected scheduleAll(): void {
    let n = 0;
    for (const t of this.wrongTopics()) n += this.store.scheduleTopic(t.cat, t.topic);
    this.scheduled.set(n ? `Dodano ${n} do dzisiejszej powtórki` : 'Te fiszki już są w powtórce');
  }
}
