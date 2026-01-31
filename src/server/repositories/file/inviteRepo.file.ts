import fs from "node:fs/promises";
import path from "node:path";

import type {
  CreateInviteParams,
  InviteRecord,
  InviteRepo,
  InviteToken,
} from "../inviteRepo";

const DATA_DIR = path.join(process.cwd(), ".data");
const INVITES_FILE = path.join(DATA_DIR, "invites.json");

type StoredInvite = {
  token: string;
  email: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  createdBy?: string;
  note?: string;
};

type StoreShape = {
  invitesByToken: Record<string, StoredInvite>;
};

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(INVITES_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;

    if (!parsed || typeof parsed !== "object") return { invitesByToken: {} };
    if (!parsed.invitesByToken || typeof parsed.invitesByToken !== "object") {
      return { invitesByToken: {} };
    }

    return parsed;
  } catch {
    return { invitesByToken: {} };
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await ensureDir();
  await fs.writeFile(INVITES_FILE, JSON.stringify(store, null, 2), "utf8");
}

function k(token: InviteToken): string {
  return token.trim();
}

function toRecord(stored: StoredInvite): InviteRecord | null {
  const createdAt = new Date(stored.createdAt);
  const expiresAt = new Date(stored.expiresAt);

  if (!stored.token || !stored.email) return null;
  if (Number.isNaN(createdAt.getTime())) return null;
  if (Number.isNaN(expiresAt.getTime())) return null;

  return {
    token: stored.token,
    email: stored.email,
    createdAt,
    expiresAt,
    createdBy: stored.createdBy,
    note: stored.note,
  };
}

export class FileInviteRepo implements InviteRepo {
  async create(params: CreateInviteParams): Promise<InviteRecord> {
    const now = new Date();

    const record: InviteRecord = {
      token: params.token.trim(),
      email: params.email.trim(),
      createdAt: now,
      expiresAt: params.expiresAt,
      createdBy: params.createdBy,
      note: params.note,
    };

    const store = await readStore();
    store.invitesByToken[k(record.token)] = {
      token: record.token,
      email: record.email,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
      createdBy: record.createdBy,
      note: record.note,
    };

    await writeStore(store);
    return record;
  }

  async get(token: InviteToken): Promise<InviteRecord | null> {
    const store = await readStore();
    const stored = store.invitesByToken[k(token)];
    if (!stored) return null;

    const record = toRecord(stored);
    if (!record) return null;

    if (record.expiresAt.getTime() <= Date.now()) {
      // auto-clean expired
      delete store.invitesByToken[k(token)];
      await writeStore(store);
      return null;
    }

    return record;
  }

  async delete(token: InviteToken): Promise<boolean> {
    const store = await readStore();
    const key = k(token);

    const existed = Boolean(store.invitesByToken[key]);
    if (!existed) return false;

    delete store.invitesByToken[key];
    await writeStore(store);
    return true;
  }
}
