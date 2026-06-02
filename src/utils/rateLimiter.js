// Simple in-memory rate limiter for the Telegram bot.
//
// NOTE: state lives in process memory. On a serverless platform (e.g. Vercel)
// each instance has its own map, so limits are per-instance and reset on cold
// start. That is acceptable as a lightweight anti-spam guard; for strict global
// limits, back this with Redis/Upstash instead.

const COOLDOWN_MS = Number(process.env.TELEGRAM_COOLDOWN_MS || 3000); // min gap between requests
const MAX_PER_MINUTE = Number(process.env.TELEGRAM_MAX_PER_MINUTE || 12);

// userId -> { last: timestamp, hits: number[] (timestamps within the window) }
const users = new Map();

/**
 * Check whether a user is allowed to make a request right now.
 * @param {string|number} userId
 * @returns {{ allowed: boolean, reason?: "cooldown"|"rate", retryAfter?: number }}
 */
export function checkRateLimit(userId) {
  const now = Date.now();
  const key = String(userId);
  const entry = users.get(key) || { last: 0, hits: [] };

  // Per-request cooldown.
  if (now - entry.last < COOLDOWN_MS) {
    return {
      allowed: false,
      reason: "cooldown",
      retryAfter: Math.ceil((COOLDOWN_MS - (now - entry.last)) / 1000),
    };
  }

  // Sliding 60s window.
  entry.hits = entry.hits.filter((t) => now - t < 60_000);
  if (entry.hits.length >= MAX_PER_MINUTE) {
    const oldest = entry.hits[0];
    return {
      allowed: false,
      reason: "rate",
      retryAfter: Math.ceil((60_000 - (now - oldest)) / 1000),
    };
  }

  entry.hits.push(now);
  entry.last = now;
  users.set(key, entry);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (users.size > 5000) {
    for (const [k, v] of users) {
      if (now - v.last > 60_000) users.delete(k);
    }
  }

  return { allowed: true };
}
