import "server-only";

import type { SessionRepo } from "./sessionRepo";
import type { UserRepo } from "./userRepo";

import { InMemorySessionRepo } from "./memory/sessionRepo.memory";
import { InMemoryUserRepo, getDemoSeedUsers } from "./memory/userRepo.memory";

/**
 * Repository composition root.
 *
 * Auth v1 uses in-memory repositories (documented in docs/auth.md).
 * Later we can swap implementations (e.g., MongoDB) without changing
 * services or API routes.
 *
 * Important: Keep these as singletons so sessions/users persist for the
 * lifetime of the server runtime (within the limits of serverless).
 *
 * Demo user:
 * - Controlled via AUTH_ENABLE_DEMO_USER=true
 * - Seed data via AUTH_DEV_SEED_EMAIL + AUTH_DEV_SEED_PASSWORD_HASH
 * - Safe default: disabled unless explicitly enabled.
 */

// --- Singleton instances ---

export const sessionRepo: SessionRepo = new InMemorySessionRepo();

export const userRepo: UserRepo = new InMemoryUserRepo(getDemoSeedUsers());
