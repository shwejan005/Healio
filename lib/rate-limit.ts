type WindowState = { count: number; expiresAt: number };

const windows = new Map<string, WindowState>();

export function consumeRateLimit(key: string, limit = 30, windowMs = 60_000, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  if (!key) return { allowed: false, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  let state = windows.get(key);
  if (!state || state.expiresAt <= now) {
    state = { count: 0, expiresAt: now + windowMs };
    windows.set(key, state);
  }
  if (state.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((state.expiresAt - now) / 1000)) };
  state.count += 1;
  if (windows.size > 10_000) {
    for (const [entryKey, entry] of windows) if (entry.expiresAt <= now) windows.delete(entryKey);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
