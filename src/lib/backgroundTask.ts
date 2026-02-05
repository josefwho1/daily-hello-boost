/**
 * Background task utilities for non-blocking async operations.
 * These ensure navigation and UI transitions are never blocked by API calls,
 * storage writes, or analytics.
 */

type TaskFn = () => Promise<void> | void;

const pendingTasks: TaskFn[] = [];
let isProcessing = false;

/**
 * Schedule a task to run in the background without blocking the UI.
 * Uses requestIdleCallback when available, falls back to setTimeout.
 */
export function scheduleBackgroundTask(task: TaskFn): void {
  pendingTasks.push(task);
  processQueue();
}

function processQueue(): void {
  if (isProcessing || pendingTasks.length === 0) return;
  
  isProcessing = true;
  
  const runNext = () => {
    const task = pendingTasks.shift();
    if (!task) {
      isProcessing = false;
      return;
    }
    
    try {
      const result = task();
      if (result && typeof result.then === 'function') {
        result
          .catch((err) => console.error('[BackgroundTask] Error:', err))
          .finally(() => scheduleNext());
      } else {
        scheduleNext();
      }
    } catch (err) {
      console.error('[BackgroundTask] Error:', err);
      scheduleNext();
    }
  };
  
  const scheduleNext = () => {
    if (pendingTasks.length === 0) {
      isProcessing = false;
      return;
    }
    
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => runNext(), { timeout: 2000 });
    } else {
      setTimeout(runNext, 0);
    }
  };
  
  // Start immediately for the first task
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => runNext(), { timeout: 2000 });
  } else {
    setTimeout(runNext, 0);
  }
}

/**
 * Fire and forget - run an async function without awaiting.
 * Errors are logged but don't propagate.
 */
export function fireAndForget(fn: () => Promise<void>): void {
  fn().catch((err) => console.error('[FireAndForget] Error:', err));
}

/**
 * Run a task with a timeout. If the task doesn't complete in time,
 * proceed anyway (useful for non-critical background operations).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback?: T
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
    
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.error('[withTimeout] Error:', err);
        resolve(fallback);
      });
  });
}

/**
 * Batch multiple async operations and run them in parallel,
 * but don't block the caller.
 */
export function runParallelBackground(tasks: TaskFn[]): void {
  scheduleBackgroundTask(async () => {
    await Promise.allSettled(tasks.map((t) => {
      try {
        return t();
      } catch (err) {
        return Promise.reject(err);
      }
    }));
  });
}
