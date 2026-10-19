/**
 * Minimal typings for the claude.ai artifact runtime (`window.claude`).
 * It exists only when the app runs as a published Claude artifact; everywhere
 * else (ng serve, Capacitor) every capability resolves to null and the app
 * falls back to local-only behaviour.
 */
export interface DbDocSnapshot { exists: boolean; data(): Record<string, unknown> | undefined; }
export interface DbDocRef { get(): Promise<DbDocSnapshot>; set(data: Record<string, unknown>): Promise<void>; }
export interface ClaudeDb { doc(path: string): DbDocRef; }
export interface ClaudeUser { id(): Promise<string | null>; }
export interface SampleError { code: string; message: string; text?: string; }
export interface SampleOptions {
  onText?: (u: { text: string; delta: string }) => void;
  signal?: AbortSignal;
  modelTier?: 'quick' | 'default' | 'complex';
  cache?: boolean;
}
export interface ClaudeSample {
  (input: string, opts?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  json<T = unknown>(input: string, opts?: SampleOptions): Promise<T>;
}
interface CapabilityMap { db: ClaudeDb; user: ClaudeUser; sample: ClaudeSample; }

declare global {
  interface Window { claude?: { use<K extends keyof CapabilityMap>(name: K): Promise<CapabilityMap[K] | null> }; }
}

export async function useCapability<K extends keyof CapabilityMap>(name: K): Promise<CapabilityMap[K] | null> {
  try {
    return window.claude?.use ? await window.claude.use(name) : null;
  } catch {
    return null;
  }
}
