export type RecoveryObserverFactory = () => Promise<void>;

export class RecoveryObserverRegistry {
  private readonly runs = new Map<string, Promise<void>>();
  private readonly pendingReenrollment = new Map<string, RecoveryObserverFactory>();
  private readonly signal: AbortSignal;
  private readonly onError: ((error: unknown) => void | Promise<void>) | undefined;

  constructor(signal: AbortSignal, onError?: (error: unknown) => void | Promise<void>) {
    this.signal = signal;
    this.onError = onError;
  }

  private launch(key: string, factory: RecoveryObserverFactory): void {
    if (this.signal.aborted) return;
    let run: Promise<void>;
    run = (async () => {
      try {
        await factory();
      } catch (error) {
        try {
          await this.onError?.(error);
        } catch {
          // Observer failures are diagnostic only; recovery enrollment must remain usable.
        }
      }
    })().finally(() => {
      if (this.runs.get(key) !== run) return;
      this.runs.delete(key);
      const pending = this.pendingReenrollment.get(key);
      this.pendingReenrollment.delete(key);
      if (pending) this.launch(key, pending);
    });
    this.runs.set(key, run);
  }

  start(key: string, factory: RecoveryObserverFactory): void {
    if (this.runs.has(key) || this.signal.aborted) return;
    this.launch(key, factory);
  }

  reenroll(key: string, factory: RecoveryObserverFactory): void {
    if (this.signal.aborted) return;
    if (this.runs.has(key)) {
      this.pendingReenrollment.set(key, factory);
      return;
    }
    this.launch(key, factory);
  }

  values(): IterableIterator<Promise<void>> {
    return this.runs.values();
  }
}
