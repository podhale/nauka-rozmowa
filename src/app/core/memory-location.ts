import { HashLocationStrategy, LocationChangeListener, LocationStrategy } from '@angular/common';
import { Injectable, Provider } from '@angular/core';

/**
 * In-memory LocationStrategy for sandboxed frames (e.g. a Claude artifact), where
 * history.pushState/replaceState throw a SecurityError. Keeps its own back stack.
 */
@Injectable()
export class MemoryLocationStrategy extends LocationStrategy {
  private stack: { url: string; state: unknown }[] = [{ url: '', state: null }];
  private index = 0;
  private listeners: LocationChangeListener[] = [];

  path(): string { return this.stack[this.index].url; }
  prepareExternalUrl(internal: string): string { return '#' + internal; }
  getBaseHref(): string { return ''; }
  getState(): unknown { return this.stack[this.index].state; }

  pushState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push({ url: url + (queryParams ? '?' + queryParams : ''), state });
    this.index = this.stack.length - 1;
  }
  replaceState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.stack[this.index] = { url: url + (queryParams ? '?' + queryParams : ''), state };
  }
  forward(): void { this.historyGo(1); }
  back(): void { this.historyGo(-1); }
  override historyGo(relative = 0): void {
    const next = Math.min(Math.max(this.index + relative, 0), this.stack.length - 1);
    if (next === this.index) return;
    this.index = next;
    const { url, state } = this.stack[next];
    queueMicrotask(() => this.listeners.forEach(fn => fn({ type: 'popstate', state } as unknown as Parameters<LocationChangeListener>[0])));
    void url;
  }
  onPopState(fn: LocationChangeListener): void { this.listeners.push(fn); }
}

/** True when the History API is usable (it throws inside sandboxed iframes). */
export function historyAvailable(): boolean {
  // Test with a relative hash URL, exactly like HashLocationStrategy will use it:
  // in srcdoc/sandboxed frames it resolves against the parent's base URL and throws.
  try { history.replaceState(history.state, '', location.hash || '#'); return true; } catch { return false; }
}

/** Hash URLs where possible (ng serve, Capacitor, static hosting), memory otherwise. */
export function provideLocationStrategy(): Provider {
  return { provide: LocationStrategy, useClass: historyAvailable() ? HashLocationStrategy : MemoryLocationStrategy };
}
