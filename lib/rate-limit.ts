/**
 * Minimal in-memory fixed-window rate limiter for server actions / API routes.
 * Good enough for a single-instance Docker deployment. If this app scales to
 * multiple instances, swap the Map for a shared store (Redis) — the call
 * sites won't need to change.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10);

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: MAX_REQUESTS - entry.count };
}
