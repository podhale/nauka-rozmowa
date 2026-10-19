import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export interface TtsChunk { text: string; /** e.g. lesson section index, for highlighting */ mark?: number; }

/**
 * Text-to-speech that works everywhere:
 * - browser / Claude artifact: Web Speech API (speechSynthesis),
 * - Android/iOS app (Capacitor): native TTS plugin (WebView has no speechSynthesis).
 * Long texts are read as a queue of short chunks – Chrome stops single utterances after ~15 s,
 * and chunks let us pause/resume and highlight the current section.
 */
@Injectable({ providedIn: 'root' })
export class TtsService {
  readonly native = Capacitor.isNativePlatform();
  readonly supported = this.native || (typeof window !== 'undefined' && 'speechSynthesis' in window);
  /** which reader owns playback (so only one button shows "playing") */
  readonly owner = signal<string | null>(null);
  readonly playing = signal(false);
  readonly index = signal(0);
  readonly mark = signal<number | null>(null);
  private queue: TtsChunk[] = [];
  private lang = 'pl-PL';
  private rate = 1;
  private runId = 0;

  /** Read chunks from `start`. Resolves when finished or stopped. */
  async play(owner: string, chunks: TtsChunk[], opts: { lang: string; rate: number; start?: number }): Promise<void> {
    await this.stop();
    this.owner.set(owner);
    this.queue = chunks; this.lang = opts.lang; this.rate = opts.rate;
    this.index.set(Math.min(opts.start ?? 0, Math.max(0, chunks.length - 1)));
    this.playing.set(true);
    const run = ++this.runId;
    while (run === this.runId && this.index() < this.queue.length) {
      const c = this.queue[this.index()];
      this.mark.set(c.mark ?? null);
      try { await this.speakOne(c.text); } catch { break; }
      if (run !== this.runId) return;
      this.index.update(i => i + 1);
    }
    if (run === this.runId) { this.playing.set(false); this.mark.set(null); if (this.index() >= this.queue.length) this.index.set(0); }
  }
  /** Pause keeps the position; play(..., {start: index()}) resumes. */
  async pause(): Promise<void> { this.runId++; this.playing.set(false); await this.cancelEngine(); }
  async stop(): Promise<void> { this.runId++; this.playing.set(false); this.mark.set(null); this.index.set(0); await this.cancelEngine(); }
  setRate(rate: number): void { this.rate = rate; }

  private async cancelEngine(): Promise<void> {
    if (this.native) { try { await TextToSpeech.stop(); } catch { /* ignore */ } }
    else if (this.supported) speechSynthesis.cancel();
  }
  private speakOne(text: string): Promise<void> {
    if (this.native) return TextToSpeech.speak({ text, lang: this.lang, rate: this.rate, pitch: 1, volume: 1, category: 'playback' });
    return new Promise<void>((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.lang; u.rate = this.rate;
      const voices = speechSynthesis.getVoices();
      const v = voices.find(x => x.lang === this.lang) ?? voices.find(x => x.lang.startsWith(this.lang.slice(0, 2)));
      if (v) u.voice = v;
      u.onend = () => resolve();
      u.onerror = e => (e.error === 'interrupted' || e.error === 'canceled' ? resolve() : reject(e));
      speechSynthesis.speak(u);
    });
  }
}

/** Splits text into sentence-based chunks of at most ~`max` characters. */
export function toChunks(text: string, mark?: number, max = 220): TtsChunk[] {
  const clean = text.replace(/```[\s\S]*?```/g, ' ').replace(/`/g, '').replace(/\*\*/g, '').replace(/^\s*[-*•]\s+/gm, '').replace(/^\s*\d+[.)]\s+/gm, '');
  const out: TtsChunk[] = [];
  for (const para of clean.split(/\n{1,}/).map(p => p.trim()).filter(Boolean)) {
    const sentences = para.match(/[^.!?…]+[.!?…]*\s*/g) ?? [para];
    let buf = '';
    for (const s of sentences) {
      if ((buf + s).length > max && buf) { out.push({ text: buf.trim(), mark }); buf = ''; }
      buf += s;
    }
    if (buf.trim()) out.push({ text: buf.trim(), mark });
  }
  return out;
}
