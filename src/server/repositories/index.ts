import "server-only";

import type { SessionRepo } from "./sessionRepo";
import type { UserRepo } from "./userRepo";

import { InMemorySessionRepo } from "./memory/sessionRepo.memory";
import { InMemoryUserRepo, getDemoSeedUsers } from "./memory/userRepo.memory";
import { KvSessionRepo } from "./kv/sessionRepo.kv";

/**
 * Repository composition root.
 *
 * Sessions:
 * - Local dev: in-memory (fast, simple)
 * - Vercel prod: KV (shared across serverless instances)
 *
 * Users:
 * - Auth v1 demo: in-memory seed user via env (AUTH_ENABLE_DEMO_USER)
 * - Later: MongoDB user store (Auth v2)
 */

function isVercelKvAvailable(): boolean {
  // @vercel/kv works when Upstash/Vercel KV env vars are present.
  // Vercel KV typically provides KV_REST_API_URL / KV_REST_API_TOKEN.
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

const useKvForSessions = process.env.NODE_ENV === "production" && isVercelKvAvailable();

// --- Singleton instances ---

export const sessionRepo: SessionRepo = useKvForSessions
  ? new KvSessionRepo()
  : new InMemorySessionRepo();

export const userRepo: UserRepo = new InMemoryUserRepo(getDemoSeedUsers());
