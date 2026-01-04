import "server-only";

import crypto from "node:crypto";
import type {
  CreateSessionParams,
  SessionId,
  SessionRecord,
  SessionRepo,
} from "../sessionRepo";

/**
 * Global storage key so the same in-memory Map is shared across
 * different module instances/bundles in dev (Turbopack can create more than one).
 */
const GLOBAL_SESSIONS_KEY = Symbol.for("ttd.auth.sessions");

type GlobalWithSessions = typeof globalThis & {
  [GLOBAL_SESSIONS_KEY]?: Map<SessionId, SessionRecord>;
};

function getGlobalSessionStore(): Map<SessionId, SessionRecord> {
  const g = globalThis as GlobalWithSessions;
  if (!g[GLOBAL_SESSIONS_KEY]) {
    g[GLOBAL_SESSIONS_KEY] = new Map<SessionId, SessionRecord>();
  }
  return g[GLOBAL_SESSIONS_KEY]!;
}

export class InMemorySessionRepo implements SessionRepo {
  private get sessions() {
    return getGlobalSessionStore();
  }

  async create(params: CreateSessionParams): Promise<SessionRecord> {
    const now = new Date();
    await this.deleteExpired(now);

    const sessionId = this.generateSessionId();
    const record: SessionRecord = {
      sessionId,
      userId: params.userId,
      createdAt: now,
      expiresAt: params.expiresAt,
    };

    this.sessions.set(sessionId, record);
    return record;
  }

  async get(sessionId: SessionId): Promise<SessionRecord | null> {
    const record = this.sessions.get(sessionId) ?? null;
    if (!record) return null;

    const now = new Date();
    if (record.expiresAt.getTime() <= now.getTime()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return record;
  }

  async delete(sessionId: SessionId): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async deleteExpired(now: Date = new Date()): Promise<number> {
    let removed = 0;
    for (const [id, record] of this.sessions.entries()) {
      if (record.expiresAt.getTime() <= now.getTime()) {
        this.sessions.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  private generateSessionId(): SessionId {
    return crypto.randomBytes(32).toString("base64url");
  }
}
