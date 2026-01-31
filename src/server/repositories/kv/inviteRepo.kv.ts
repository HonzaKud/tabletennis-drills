import { kv } from "@vercel/kv";
import type {
  CreateInviteParams,
  InviteRecord,
  InviteRepo,
  InviteToken,
} from "../inviteRepo";

function inviteKey(token: InviteToken) {
  return `ttd:auth:invites:${token}`;
}

function ttlSeconds(expiresAt: Date): number {
  const seconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return Math.max(1, seconds);
}

function normalizeInviteRecord(raw: any): InviteRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const token = String(raw.token ?? "");
  const email = String(raw.email ?? "").trim();
  const createdAt = new Date(raw.createdAt);
  const expiresAt = new Date(raw.expiresAt);

  if (!token || !email) return null;
  if (Number.isNaN(createdAt.getTime())) return null;
  if (Number.isNaN(expiresAt.getTime())) return null;

  const createdBy =
    typeof raw.createdBy === "string" && raw.createdBy.trim()
      ? raw.createdBy.trim()
      : undefined;

  const note =
    typeof raw.note === "string" && raw.note.trim() ? raw.note.trim() : undefined;

  return { token, email, createdAt, expiresAt, createdBy, note };
}

export class KvInviteRepo implements InviteRepo {
  async create(params: CreateInviteParams): Promise<InviteRecord> {
    const now = new Date();

    const record: InviteRecord = {
      token: params.token,
      email: params.email.trim(),
      createdAt: now,
      expiresAt: params.expiresAt,
      createdBy: params.createdBy,
      note: params.note,
    };

    await kv.set(inviteKey(record.token), record, {
      ex: ttlSeconds(record.expiresAt),
    });

    return record;
  }

  async get(token: InviteToken): Promise<InviteRecord | null> {
    const raw = await kv.get(inviteKey(token));
    const record = normalizeInviteRecord(raw);
    if (!record) return null;

    if (record.expiresAt.getTime() <= Date.now()) {
      await kv.del(inviteKey(token));
      return null;
    }

    return record;
  }

  async delete(token: InviteToken): Promise<boolean> {
    const removed = await kv.del(inviteKey(token));
    return removed > 0;
  }
}
