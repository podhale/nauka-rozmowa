import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input } from '@angular/core';
import { TtsService, toChunks } from '../core/tts.service';

let nextId = 0;

/** Small "Posłuchaj" button for a short text (English phrases, cheat-sheet lines). */
@Component({
  selector: 'app-speak',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tts.supported) {
      <button type="button" class="speak" [class.on]="active()" (click)="toggle()" [attr.aria-label]="active() ? 'Zatrzymaj' : (label() || 'Posłuchaj')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" /></svg>
        {{ active() ? 'Stop' : label() }}
      </button>
    }
  `,
})
export class SpeakButton {
  protected readonly tts = inject(TtsService);
  readonly text = input.required<string>();
  readonly label = input('Posłuchaj');
  readonly rate = input(0.9);
  /** BCP-47 language of the text, e.g. 'en-US' or 'pl-PL' */
  readonly lang = input('en-US');
  private readonly id = 'speak-' + nextId++;
  protected readonly active = computed(() => this.tts.playing() && this.tts.owner() === this.id);

  constructor() { inject(DestroyRef).onDestroy(() => { if (this.active()) void this.tts.stop(); }); }

  protected toggle(): void {
    if (this.active()) { void this.tts.stop(); return; }
    void this.tts.play(this.id, toChunks(this.text()), { lang: this.lang(), rate: this.rate() });
  }
}
