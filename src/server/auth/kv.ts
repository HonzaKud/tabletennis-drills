import "server-only";

/**
 * Detect whether Vercel KV (Upstash) is configured.
 *
 * `@vercel/kv` can be configured by different env var sets depending on
 * the integration / provider and historical naming.
 *
 * We treat empty/whitespace values as "not configured".
 */

function hasEnv(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

export function isKvConfigured(): boolean {
  // Vercel KV REST (common)
  const vercelKvRest = hasEnv("KV_REST_API_URL") && hasEnv("KV_REST_API_TOKEN");

  // Upstash REST (common)
  const upstashRest =
    hasEnv("UPSTASH_REDIS_REST_URL") && hasEnv("UPSTASH_REDIS_REST_TOKEN");

  // Upstash Redis URL/TOKEN (older / alternative)
  const upstashRedis = hasEnv("UPSTASH_REDIS_URL") && hasEnv("UPSTASH_REDIS_TOKEN");

  return vercelKvRest || upstashRest || upstashRedis;
}
