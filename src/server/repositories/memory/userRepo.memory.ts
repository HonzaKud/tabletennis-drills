import crypto from "node:crypto";
import type { UserId, UserRecord, UserRepo } from "../userRepo";

/**
 * Normalize email for consistent lookups.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Global in-memory store.
 *
 * We keep this on globalThis so it survives HMR / module reloads
 * during local dev and behaves predictably in serverless runtimes
 * (within a single instance).
 */
const GLOBAL_USERS_KEY = Symbol.for("ttd.auth.users");

type GlobalWithUsers = typeof globalThis & {
  [GLOBAL_USERS_KEY]?: {
    usersById: Map<UserId, UserRecord>;
    usersByEmail: Map<string, UserRecord>;
  };
};

function getGlobalUserStore() {
  const g = globalThis as GlobalWithUsers;
  if (!g[GLOBAL_USERS_KEY]) {
    g[GLOBAL_USERS_KEY] = {
      usersById: new Map<UserId, UserRecord>(),
      usersByEmail: new Map<string, UserRecord>(),
    };
  }
  return g[GLOBAL_USERS_KEY]!;
}

/**
 * Demo user feature flag.
 *
 * Enabled explicitly via env so we never accidentally expose
 * a demo account in real production.
 */
function isDemoUserEnabled(): boolean {
  return process.env.AUTH_ENABLE_DEMO_USER === "true";
}

/**
 * Read demo user credentials from env.
 * Returns null when demo user is disabled or misconfigured.
 */
function getDemoSeedUser(): { email: string; passwordHash: string } | null {
  if (!isDemoUserEnabled()) return null;

  const email = normalizeEmail(process.env.AUTH_DEV_SEED_EMAIL ?? "");
  const passwordHash = (process.env.AUTH_DEV_SEED_PASSWORD_HASH ?? "").trim();

  if (!email || !passwordHash) return null;
  return { email, passwordHash };
}

/**
 * Generate a deterministic user ID for the demo user.
 *
 * IMPORTANT:
 * - This MUST be stable across serverless instances.
 * - Otherwise sessions stored in KV would reference a userId
 *   that does not exist in another instance's in-memory store.
 *
 * We derive the ID from the normalized email using a hash.
 */
function stableDemoUserIdFromEmail(email: string): UserId {
  return crypto
    .createHash("sha256")
    .update(`ttd:demo-user:${normalizeEmail(email)}`)
    .digest("hex");
}

function ensureActiveDefaults(user: UserRecord): UserRecord {
  return {
    ...user,
    email: normalizeEmail(user.email),
    isActive: user.isActive ?? true,
  };
}

export class InMemoryUserRepo implements UserRepo {
  private get store() {
    return getGlobalUserStore();
  }

  constructor(seedUsers?: Array<Omit<UserRecord, "id" | "createdAt">>) {
    if (!seedUsers || seedUsers.length === 0) return;

    for (const user of seedUsers) {
      const emailKey = normalizeEmail(user.email);

      // Prevent re-seeding duplicates across HMR / instance reuse.
      if (this.store.usersByEmail.has(emailKey)) continue;

      const isDemoUser =
        isDemoUserEnabled() &&
        emailKey === normalizeEmail(process.env.AUTH_DEV_SEED_EMAIL ?? "");

      const id: UserId = isDemoUser
        ? stableDemoUserIdFromEmail(emailKey)
        : crypto.randomUUID();

      this.insert({
        ...user,
        id,
        createdAt: new Date(),
      });
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const key = normalizeEmail(email);
    return this.store.usersByEmail.get(key) ?? null;
  }

  async findById(id: UserId): Promise<UserRecord | null> {
    return this.store.usersById.get(id) ?? null;
  }

  /**
   * Create a new user.
   * (Needed for invite onboarding.)
   */
  async create(params: {
    email: string;
    passwordHash: string;
    isActive?: boolean;
  }): Promise<UserRecord> {
    const emailKey = normalizeEmail(params.email);

    if (this.store.usersByEmail.has(emailKey)) {
      // Keep consistent with your KV repo error type if you use it there.
      // If you already have UserEmailAlreadyExistsError, userRepo interface will use it.
      throw new Error("UserEmailAlreadyExists");
    }

    const record: UserRecord = ensureActiveDefaults({
      id: crypto.randomUUID(),
      email: emailKey,
      passwordHash: params.passwordHash,
      createdAt: new Date(),
      isActive: params.isActive ?? true,
    });

    this.store.usersById.set(record.id, record);
    this.store.usersByEmail.set(emailKey, record);

    return record;
  }

  /**
   * Update password hash (future use: reset / change password).
   */
  async updatePasswordHash(userId: UserId, passwordHash: string): Promise<boolean> {
    const existing = this.store.usersById.get(userId);
    if (!existing) return false;

    const updated: UserRecord = {
      ...existing,
      passwordHash,
    };

    this.store.usersById.set(userId, updated);
    this.store.usersByEmail.set(normalizeEmail(updated.email), updated);

    return true;
  }

  private insert(user: UserRecord): void {
    const record = ensureActiveDefaults(user);
    const emailKey = normalizeEmail(record.email);

    this.store.usersById.set(record.id, record);
    this.store.usersByEmail.set(emailKey, record);
  }
}

/**
 * Create a seed user record (without id / createdAt).
 */
export function createDevSeedUser(params: {
  email: string;
  passwordHash: string;
}): Omit<UserRecord, "id" | "createdAt"> {
  return {
    email: normalizeEmail(params.email),
    passwordHash: params.passwordHash,
    isActive: true,
  };
}

/**
 * Convenience helper to build demo seed users array from env.
 *
 * Returns [] when demo user is disabled or not configured.
 */
export function getDemoSeedUsers(): Array<Omit<UserRecord, "id" | "createdAt">> {
  const demo = getDemoSeedUser();
  return demo ? [createDevSeedUser(demo)] : [];
}
