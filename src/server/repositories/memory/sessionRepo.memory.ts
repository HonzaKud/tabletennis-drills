import crypto from "node:crypto";

import type {
  CreateSessionParams,
  SessionId,
  SessionRecord,
  SessionRepo,
} from "../sessionRepo";

function nowMs(): number {
  return Date.now();
}

const GLOBAL_SESSIONS_KEY = Symbol.for("ttd.auth.sessions");

type GlobalWithSessions = typeof globalThis & {
  [GLOBAL_SESSIONS_KEY]?: {
    sessionsById: Map<SessionId, SessionRecord>;
  };
};

function getGlobalSessionStore() {
  const g = globalThis as GlobalWithSessions;
  if (!g[GLOBAL_SESSIONS_KEY]) {
    g[GLOBAL_SESSIONS_KEY] = {
      sessionsById: new Map<SessionId, SessionRecord>(),
    };
  }
  return g[GLOBAL_SESSIONS_KEY]!;
}

export class InMemorySessionRepo implements SessionRepo {
  private get store() {
    return getGlobalSessionStore();
  }

  async create(params: CreateSessionParams): Promise<SessionRecord> {
    const now = new Date();

    const record: SessionRecord = {
      sessionId: crypto.randomBytes(32).toString("base64url"),
      userId: params.userId,
      createdAt: now,
      expiresAt: params.expiresAt,
    };

    this.store.sessionsById.set(record.sessionId, record);
    return record;
  }

  async get(sessionId: SessionId): Promise<SessionRecord | null> {
    const record = this.store.sessionsById.get(sessionId) ?? null;
    if (!record) return null;

    if (record.expiresAt.getTime() <= nowMs()) {
      this.store.sessionsById.delete(sessionId);
      return null;
    }

    return record;
  }

  async delete(sessionId: SessionId): Promise<boolean> {
    return this.store.sessionsById.delete(sessionId);
  }

  async deleteExpired(): Promise<number> {
    const now = nowMs();
    let removed = 0;

    for (const [id, record] of this.store.sessionsById.entries()) {
      if (record.expiresAt.getTime() <= now) {
        this.store.sessionsById.delete(id);
        removed += 1;
      }
    }

    return removed;
  }
}
