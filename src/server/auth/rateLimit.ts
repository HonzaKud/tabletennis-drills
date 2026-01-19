import "server-only";

import crypto from "node:crypto";
import { kv } from "@vercel/kv";
import { isKvConfigured } from "./kv";

/**
 * Rate limiting (Auth v1+).
 *
 * Fixed-window counters in KV (Redis).
 *
 * Limits:
 * - 5 attempts / 5 minutes per (ip + email)
 * - 20 attempts / 5 minutes per ip (global)
 *
 * Notes:
 * - Best-effort only (fail-open). Auth must not break if KV is down.
 * - Local in-memory fallback for dev/no-KV.
 */

export type RateLimitOutcome =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

const WINDOW_SECONDS = 5 * 60;

const LIMIT_IP_EMAIL = 5;
const LIMIT_IP_GLOBAL = 20;

function safeIp(ip: string): string {
  const trimmed = (ip || "").trim();
  return trimmed.length > 0 ? trimmed : "unknown";
}

function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}

function hashEmail(email: string): string {
  // Keep keys small & safe. We don't need plaintext email in KV keys.
  return crypto.createHash("sha256").update(email).digest("hex").slice(0, 24);
}

function keyIpGlobal(ip: string) {
  return `ttd:auth:rl:ip:${ip}`;
}

function keyIpEmail(ip: string, email: string) {
  return `ttd:auth:rl:ip-email:${ip}:${hashEmail(email)}`;
}

async function incrWithTtl(key: string): Promise<number> {
  // INCR + set TTL on first increment.
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, WINDOW_SECONDS);
  }
  return count;
}

async function getTtlSeconds(key: string): Promise<number> {
  // Returns:
  // -2: key does not exist
  // -1: key exists but has no associated expire
  // >=0: TTL in seconds
  const ttl = await kv.ttl(key);
  if (typeof ttl !== "number") return WINDOW_SECONDS;
  if (ttl >= 0) return ttl;
  return WINDOW_SECONDS;
}

type LocalCounter = { count: number; expiresAtMs: number };

const GLOBAL_RL_KEY = Symbol.for("ttd.auth.ratelimit");

function getLocalStore(): Map<string, LocalCounter> {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_RL_KEY]?: Map<string, LocalCounter>;
  };
  if (!g[GLOBAL_RL_KEY]) g[GLOBAL_RL_KEY] = new Map();
  return g[GLOBAL_RL_KEY]!;
}

function cleanupLocalStore(store: Map<string, LocalCounter>, now: number) {
  // Opportunistic cleanup to avoid unbounded growth in dev.
  // (Only runs occasionally.)
  if (store.size < 200) return;
  for (const [k, v] of store.entries()) {
    if (v.expiresAtMs <= now) store.delete(k);
  }
}

function localIncrWithTtl(key: string): number {
  const store = getLocalStore();
  const now = Date.now();

  cleanupLocalStore(store, now);

  const existing = store.get(key);
  if (!existing || existing.expiresAtMs <= now) {
    store.set(key, { count: 1, expiresAtMs: now + WINDOW_SECONDS * 1000 });
    return 1;
  }

  existing.count += 1;
  store.set(key, existing);
  return existing.count;
}

function localRetryAfterSeconds(key: string): number {
  const store = getLocalStore();
  const now = Date.now();
  const v = store.get(key);
  if (!v || v.expiresAtMs <= now) return WINDOW_SECONDS;
  const remaining = Math.ceil((v.expiresAtMs - now) / 1000);
  return Math.max(1, remaining);
}

/**
 * Check (and increment) login rate limits.
 */
export async function checkLoginRateLimit(params: {
  ip: string;
  email: string;
}): Promise<RateLimitOutcome> {
  const ip = safeIp(params.ip);
  const email = normalizeEmail(params.email);

  const kGlobal = keyIpGlobal(ip);
  const kIpEmail = keyIpEmail(ip, email);

  // KV path (prod)
  try {
    if (isKvConfigured()) {
      const [globalCount, ipEmailCount] = await Promise.all([
        incrWithTtl(kGlobal),
        incrWithTtl(kIpEmail),
      ]);

      if (globalCount > LIMIT_IP_GLOBAL || ipEmailCount > LIMIT_IP_EMAIL) {
        // Best-effort: compute remaining window for Retry-After.
        const ttl = await getTtlSeconds(
          ipEmailCount > LIMIT_IP_EMAIL ? kIpEmail : kGlobal
        );
        return { allowed: false, retryAfterSeconds: Math.max(1, ttl) };
      }

      return { allowed: true };
    }
  } catch {
    // Fail-open: rate limiting must not block auth if KV hiccups.
  }

  // Local fallback (dev/no KV)
  const globalCount = localIncrWithTtl(kGlobal);
  const ipEmailCount = localIncrWithTtl(kIpEmail);

  if (globalCount > LIMIT_IP_GLOBAL || ipEmailCount > LIMIT_IP_EMAIL) {
    const retryAfterSeconds = localRetryAfterSeconds(
      ipEmailCount > LIMIT_IP_EMAIL ? kIpEmail : kGlobal
    );
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}
