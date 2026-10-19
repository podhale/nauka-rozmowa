import { Injectable, signal } from '@angular/core';

export type QuizMode = 'mix' | 'unseen' | 'wrong';
export type BrowseMode = 'sheets' | 'mine' | 'cards';
export type Theme = '' | 'light' | 'dark';

/** UI preferences that survive navigation between pages (not persisted to the cloud). */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly selectedCats = signal<ReadonlySet<string>>(new Set());
  readonly topic = signal('');
  readonly quizCount = signal(10);
  readonly quizMode = signal<QuizMode>('mix');
  readonly browseMode = signal<BrowseMode>('sheets');
  readonly browseQuery = signal('');
  readonly browseCat = signal('all');
  readonly toast = signal<string | null>(null);
  readonly theme = signal<Theme>(readTheme());
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() { applyTheme(this.theme()); }

  toggleCat(cat: string): void {
    this.selectedCats.update(s => { const n = new Set(s); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
    this.topic.set('');
  }
  selectOnly(cat: string): void { this.selectedCats.set(new Set([cat])); this.topic.set(''); }
  clearCats(): void { this.selectedCats.set(new Set()); this.topic.set(''); }

  showToast(text: string): void {
    this.toast.set(text);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2400);
  }
  setTheme(t: Theme): void {
    this.theme.set(t);
    applyTheme(t);
    try { localStorage.setItem('interview-prep-theme', t); } catch { /* ignore */ }
  }
}

function readTheme(): Theme {
  try { const t = localStorage.getItem('interview-prep-theme'); return t === 'light' || t === 'dark' ? t : ''; } catch { return ''; }
}
function applyTheme(t: Theme): void {
  if (t) document.documentElement.dataset['theme'] = t;
  else delete document.documentElement.dataset['theme'];
}
