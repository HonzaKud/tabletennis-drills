import "server-only";

import type { SessionRepo } from "./sessionRepo";
import type { UserRepo } from "./userRepo";
import type { InviteRepo } from "./inviteRepo";

import { InMemorySessionRepo } from "./memory/sessionRepo.memory";
import { InMemoryUserRepo, getDemoSeedUsers } from "./memory/userRepo.memory";
import { InMemoryInviteRepo } from "./memory/inviteRepo.memory";

import { KvSessionRepo } from "./kv/sessionRepo.kv";
import { KvUserRepo } from "./kv/userRepo.kv";
import { KvInviteRepo } from "./kv/inviteRepo.kv";

import { FileInviteRepo } from "./file/inviteRepo.file";

/**
 * Detect whether Vercel KV (@vercel/kv) is configured.
 * Works both locally (when you provide env vars) and on Vercel.
 */
function isVercelKvAvailable(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

const isProd = process.env.NODE_ENV === "production";
const kvAvailable = isVercelKvAvailable();

// Sessions/users: keep simple for now
// - DEV: in-memory
// - PROD: KV (when available)
const useKvForSessions = isProd && kvAvailable;
const useKvForUsers = isProd && kvAvailable;

// Invites:
// ✅ CRITICAL FIX:
// If KV is available, ALWAYS use KV (even in DEV) so that
// CLI-created invites work on Vercel (same shared store).
// Fallbacks:
// - DEV without KV: file-backed (CLI + dev server share state)
// - PROD without KV: memory (best-effort)
const inviteRepoImpl: "kv" | "file" | "memory" =
  kvAvailable ? "kv" : isProd ? "memory" : "file";

// --- Singleton instances ---

export const sessionRepo: SessionRepo = useKvForSessions
  ? new KvSessionRepo()
  : new InMemorySessionRepo();

export const userRepo: UserRepo = useKvForUsers
  ? new KvUserRepo()
  : new InMemoryUserRepo(getDemoSeedUsers());

export const inviteRepo: InviteRepo =
  inviteRepoImpl === "kv"
    ? new KvInviteRepo()
    : inviteRepoImpl === "file"
      ? new FileInviteRepo()
      : new InMemoryInviteRepo();
