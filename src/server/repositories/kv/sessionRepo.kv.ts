import crypto from "node:crypto";
import { kv } from "@vercel/kv";

import type {
  CreateSessionParams,
  SessionId,
  SessionRecord,
  SessionRepo,
} from "../sessionRepo";

function sessionKey(sessionId: SessionId) {
  return `ttd:auth:sessions:${sessionId}`;
}

function ttlSeconds(expiresAt: Date): number {
  const seconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(1, seconds);
}

function normalizeSessionRecord(raw: any): SessionRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const sessionId = String(raw.sessionId ?? "");
  const userId = String(raw.userId ?? "");
  const createdAt = new Date(raw.createdAt);
  const expiresAt = new Date(raw.expiresAt);

  if (!sessionId || !userId) return null;
  if (Number.isNaN(createdAt.getTime())) return null;
  if (Number.isNaN(expiresAt.getTime())) return null;

  return { sessionId, userId, createdAt, expiresAt };
}

export class KvSessionRepo implements SessionRepo {
  async create(params: CreateSessionParams): Promise<SessionRecord> {
    const now = new Date();

    const record: SessionRecord = {
      sessionId: crypto.randomBytes(32).toString("base64url"),
      userId: params.userId,
      createdAt: now,
      expiresAt: params.expiresAt,
    };

    await kv.set(sessionKey(record.sessionId), record, {
      ex: ttlSeconds(record.expiresAt),
    });

    return record;
  }

  async get(sessionId: SessionId): Promise<SessionRecord | null> {
    const raw = await kv.get(sessionKey(sessionId));
    const record = normalizeSessionRecord(raw);

    if (!record) return null;

    if (record.expiresAt.getTime() <= Date.now()) {
      await kv.del(sessionKey(sessionId));
      return null;
    }

    return record;
  }

  async delete(sessionId: SessionId): Promise<boolean> {
    const removed = await kv.del(sessionKey(sessionId));
    return removed > 0;
  }

  async deleteExpired(): Promise<number> {
    // KV uses TTL, so explicit cleanup isn't needed.
    return 0;
  }
}
