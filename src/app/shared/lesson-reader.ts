import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { Lesson } from '../core/models';
import { TtsChunk, TtsService, toChunks } from '../core/tts.service';

const RATES = [0.8, 1, 1.2, 1.5];

/**
 * Reads a whole lesson aloud (Polish): play / pause / resume / stop, speed, and the
 * section being read is highlighted and scrolled into view (sections have id "sec-<n>").
 */
@Component({
  selector: 'app-lesson-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tts.supported) {
      <div class="reader" [class.on]="mine() && tts.playing()">
        @if (mine() && tts.playing()) {
          <button class="btn primary" (click)="pause()" aria-label="Pauza">⏸ Pauza</button>
        } @else {
          <button class="btn primary" (click)="play()">▶ {{ resumable() ? 'Wznów czytanie' : 'Czytaj lekcję na głos' }}</button>
        }
        @if (mine() && (tts.playing() || resumable())) { <button class="btn ghost" (click)="stop()" aria-label="Zatrzymaj">⏹</button> }
        <label class="rate">Tempo
          <select [value]="rate()" (change)="setRate(+$any($event.target).value)">
            @for (r of rates; track r) { <option [value]="r">{{ r }}×</option> }
          </select>
        </label>
        @if (mine() && (tts.playing() || resumable())) {
          <span class="muted num reader-pos">{{ progress() }}%</span>
        }
      </div>
    }
  `,
})
export class LessonReader {
  protected readonly tts = inject(TtsService);
  readonly lesson = input.required<Lesson>();
  protected readonly rates = RATES;
  protected readonly rate = signal(readRate());
  private readonly ownerId = computed(() => 'lesson-' + this.lesson().id);
  protected readonly mine = computed(() => this.tts.owner() === this.ownerId());
  protected readonly resumable = computed(() => this.mine() && !this.tts.playing() && this.tts.index() > 0);

  /** title + intro (mark -1), each section (mark = index), takeaways (mark = sections.length) */
  private readonly chunks = computed<TtsChunk[]>(() => {
    const l = this.lesson();
    const out: TtsChunk[] = [...toChunks(`${l.title}. ${l.intro}`, -1)];
    l.sections.forEach((s, i) => {
      out.push({ text: s.h + '.', mark: i });
      out.push(...toChunks(s.text, i));
      if (s.code) out.push({ text: 'W tym miejscu lekcja pokazuje przykład kodu.', mark: i });
    });
    out.push({ text: 'Najważniejsze do zapamiętania.', mark: l.sections.length });
    for (const t of l.takeaways) out.push(...toChunks(t, l.sections.length));
    return out;
  });
  protected readonly progress = computed(() => Math.round((this.tts.index() / Math.max(1, this.chunks().length)) * 100));

  constructor() {
    // highlight + scroll the section being read
    effect(() => {
      const m = this.mine() ? this.tts.mark() : null;
      document.querySelectorAll('.lesson-sec.reading, .takeaways.reading').forEach(e => e.classList.remove('reading'));
      if (m === null || m < 0) return;
      const el = document.getElementById('sec-' + m);
      if (el) { el.classList.add('reading'); el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
    });
    inject(DestroyRef).onDestroy(() => { if (this.mine()) void this.tts.stop(); });
  }

  protected play(): void {
    const start = this.resumable() ? this.tts.index() : 0;
    void this.tts.play(this.ownerId(), this.chunks(), { lang: 'pl-PL', rate: this.rate(), start });
  }
  protected pause(): void { void this.tts.pause(); }
  protected stop(): void { void this.tts.stop(); }
  protected setRate(r: number): void {
    this.rate.set(r);
    try { localStorage.setItem('interview-prep-tts-rate', String(r)); } catch { /* ignore */ }
    if (this.mine() && this.tts.playing()) { const at = this.tts.index(); void this.tts.play(this.ownerId(), this.chunks(), { lang: 'pl-PL', rate: r, start: at }); }
  }
}

function readRate(): number {
  try { const v = Number(localStorage.getItem('interview-prep-tts-rate')); return RATES.includes(v) ? v : 1; } catch { return 1; }
}
