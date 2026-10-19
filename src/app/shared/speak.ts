import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';

/** Whether the browser can read text aloud (Web Speech API). */
export const canSpeak = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * "Posłuchaj" button: reads English text aloud with the browser's speech synthesis
 * (works offline on most phones; voices depend on the device).
 */
@Component({
  selector: 'app-speak',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (supported) {
      <button type="button" class="speak" [class.on]="speaking()" (click)="toggle()" [attr.aria-label]="speaking() ? 'Zatrzymaj' : (label() || 'Posłuchaj')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" /></svg>
        {{ speaking() ? 'Stop' : label() }}
      </button>
    }
  `,
})
export class SpeakButton {
  readonly text = input.required<string>();
  readonly label = input('Posłuchaj');
  readonly rate = input(0.9);
  /** BCP-47 language of the text, e.g. 'en-US' or 'pl-PL' */
  readonly lang = input('en-US');
  protected readonly supported = canSpeak();
  protected readonly speaking = signal(false);

  constructor() { inject(DestroyRef).onDestroy(() => { if (this.speaking()) speechSynthesis.cancel(); }); }

  protected toggle(): void {
    if (!this.supported) return;
    if (this.speaking()) { speechSynthesis.cancel(); this.speaking.set(false); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.text().replace(/`/g, ''));
    const lang = this.lang();
    u.lang = lang;
    u.rate = this.rate();
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === lang) ?? voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => this.speaking.set(false);
    this.speaking.set(true);
    speechSynthesis.speak(u);
  }
}
