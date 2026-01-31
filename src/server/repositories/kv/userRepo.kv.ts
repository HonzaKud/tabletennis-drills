import crypto from "node:crypto";
import { kv } from "@vercel/kv";

import type { CreateUserInput, UserId, UserRecord, UserRepo } from "../userRepo";
import { UserEmailAlreadyExistsError } from "../userRepo";

/**
 * KV-backed user repository.
 *
 * Storage strategy:
 * - users are stored by id
 * - email -> id index for case-insensitive lookup
 *
 * Keys:
 * - ttd:auth:users:byId:<id>          -> UserRecord (JSON)
 * - ttd:auth:users:byEmail:<emailKey> -> UserId (string)
 *
 * Notes:
 * - emailKey is normalized (trim + lower) to guarantee case-insensitive uniqueness.
 * - We store canonical email (trimmed original) for display.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const KEY_USER_BY_ID = (id: UserId) => `ttd:auth:users:byId:${id}`;
const KEY_USER_ID_BY_EMAIL = (emailKey: string) =>
  `ttd:auth:users:byEmail:${emailKey}`;

function reviveUserRecord(raw: any): UserRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const createdAt =
    raw.createdAt instanceof Date
      ? raw.createdAt
      : typeof raw.createdAt === "string"
        ? new Date(raw.createdAt)
        : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) return null;

  // Basic shape guard (kept intentionally lightweight)
  if (
    typeof raw.id !== "string" ||
    typeof raw.email !== "string" ||
    typeof raw.passwordHash !== "string"
  ) {
    return null;
  }

  const rec: UserRecord = {
    id: raw.id,
    email: raw.email,
    passwordHash: raw.passwordHash,
    createdAt,
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : undefined,
  };

  return rec;
}

export class KvUserRepo implements UserRepo {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const emailKey = normalizeEmail(email);
    if (!emailKey) return null;

    const id = (await kv.get<string>(KEY_USER_ID_BY_EMAIL(emailKey))) ?? null;
    if (!id) return null;

    const raw = await kv.get(KEY_USER_BY_ID(id));
    return reviveUserRecord(raw);
  }

  async findById(id: UserId): Promise<UserRecord | null> {
    const raw = await kv.get(KEY_USER_BY_ID(id));
    return reviveUserRecord(raw);
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const canonicalEmail = input.email.trim();
    const emailKey = normalizeEmail(canonicalEmail);

    if (!canonicalEmail || !emailKey) {
      // Intentionally keep repo strict; validation should happen earlier (schemas/service).
      throw new Error("Invalid email");
    }

    // 1) Try to reserve the email -> id mapping first.
    // This gives us a cheap uniqueness gate.
    const id: UserId = crypto.randomUUID();
    const emailIndexKey = KEY_USER_ID_BY_EMAIL(emailKey);

    // `SET key value NX` = only set if not exists
    const reserved = await kv.set(emailIndexKey, id, { nx: true });

    // @vercel/kv returns "OK" when set; null when not set (NX failed).
    if (reserved !== "OK") {
      throw new UserEmailAlreadyExistsError(canonicalEmail);
    }

    // 2) Write user record by id.
    const record: UserRecord = {
      id,
      email: canonicalEmail,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
      isActive: true,
    };

    try {
      await kv.set(KEY_USER_BY_ID(id), record);
      return record;
    } catch (err) {
      // Roll back the email reservation if user write fails
      // to avoid a stuck email->id index.
      try {
        await kv.del(emailIndexKey);
      } catch {
        // swallow rollback error; original error is more important
      }
      throw err;
    }
  }
}
