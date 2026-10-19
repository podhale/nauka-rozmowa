import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { DbDocRef, useCapability } from './claude-runtime';
import { ProgressStore } from './progress.store';

export type SyncStatus = 'local' | 'connecting' | 'synced' | 'saving';

/**
 * Optional cloud sync of progress through the Claude artifact `db` capability
 * (a private per-person document). Without it the app is local-only.
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly store = inject(ProgressStore);
  readonly status = signal<SyncStatus>('local');
  private doc: DbDocRef | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pushing = false;
  private dirty = false;

  constructor() {
    // Debounced push after local changes.
    effect(() => {
      const v = this.store.localVersion();
      if (!v) return;
      untracked(() => this.schedule());
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.dirty) { clearTimeout(this.timer); void this.push(); }
    });
    void this.connect();
  }

  private async connect(): Promise<void> {
    const [db, user] = await Promise.all([useCapability('db'), useCapability('user')]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    try {
      this.status.set('connecting');
      this.doc = db.doc(`data/users/${uid}/progress`);
      const snap = await this.doc.get();
      if (snap.exists) this.store.mergeRemote(snap.data());
      this.status.set('synced');
      if (!snap.exists || JSON.stringify(snap.data()) !== JSON.stringify(this.store.state())) { this.dirty = true; void this.push(); }
    } catch {
      this.doc = null;
      this.status.set('local');
    }
  }

  private schedule(): void {
    if (!this.doc) return;
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.push(), 2500);
  }

  private async push(): Promise<void> {
    if (!this.doc || this.pushing || !this.dirty) return;
    this.pushing = true;
    this.dirty = false;
    this.status.set('saving');
    try {
      await this.doc.set(JSON.parse(JSON.stringify(this.store.state())));
      this.status.set('synced');
    } catch (e) {
      if ((e as { code?: string })?.code === 'invalid_argument') this.doc = null;
      this.status.set('local');
    }
    this.pushing = false;
    if (this.dirty) void this.push();
  }
}
