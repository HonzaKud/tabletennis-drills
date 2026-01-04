import "server-only";

import crypto from "node:crypto";
import type { UserId, UserRecord, UserRepo } from "../userRepo";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

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

function isDemoUserEnabled(): boolean {
  return process.env.AUTH_ENABLE_DEMO_USER === "true";
}

function getDemoSeedUser():
  | { email: string; passwordHash: string }
  | null {
  if (!isDemoUserEnabled()) return null;

  const email = normalizeEmail(process.env.AUTH_DEV_SEED_EMAIL ?? "");
  const passwordHash = (process.env.AUTH_DEV_SEED_PASSWORD_HASH ?? "").trim();

  if (!email || !passwordHash) return null;

  return { email, passwordHash };
}

export class InMemoryUserRepo implements UserRepo {
  private get store() {
    return getGlobalUserStore();
  }

  constructor(seedUsers?: Array<Omit<UserRecord, "id" | "createdAt">>) {
    if (seedUsers && seedUsers.length > 0) {
      for (const user of seedUsers) {
        const emailKey = normalizeEmail(user.email);

        // Prevent re-seeding duplicates across HMR / bundle reloads.
        if (this.store.usersByEmail.has(emailKey)) continue;

        this.insert({
          ...user,
          id: this.generateUserId(),
          createdAt: new Date(),
        });
      }
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const key = normalizeEmail(email);
    return this.store.usersByEmail.get(key) ?? null;
  }

  async findById(id: UserId): Promise<UserRecord | null> {
    return this.store.usersById.get(id) ?? null;
  }

  private insert(user: UserRecord): void {
    const emailKey = normalizeEmail(user.email);

    const record: UserRecord = {
      ...user,
      email: emailKey,
      isActive: user.isActive ?? true,
    };

    this.store.usersById.set(record.id, record);
    this.store.usersByEmail.set(emailKey, record);
  }

  private generateUserId(): UserId {
    return crypto.randomUUID();
  }
}

export function createDevSeedUser(params: {
  email: string;
  passwordHash: string;
}): Omit<UserRecord, "id" | "createdAt"> {
  return {
    email: params.email,
    passwordHash: params.passwordHash,
    isActive: true,
  };
}

/**
 * Convenience helper to create the demo seed user record from env vars.
 * Returns [] when demo user is disabled or not configured.
 *
 * Use this when building repositories.
 */
export function getDemoSeedUsers(): Array<Omit<UserRecord, "id" | "createdAt">> {
  const demo = getDemoSeedUser();
  return demo ? [createDevSeedUser(demo)] : [];
}
