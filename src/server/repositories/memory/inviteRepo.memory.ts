import type {
  CreateInviteParams,
  InviteRecord,
  InviteRepo,
  InviteToken,
} from "../inviteRepo";

function key(token: InviteToken): string {
  return token.trim();
}

const GLOBAL_INVITES_KEY = Symbol.for("ttd.auth.invites");

type GlobalWithInvites = typeof globalThis & {
  [GLOBAL_INVITES_KEY]?: {
    invitesByToken: Map<string, InviteRecord>;
  };
};

function getGlobalInviteStore() {
  const g = globalThis as GlobalWithInvites;
  if (!g[GLOBAL_INVITES_KEY]) {
    g[GLOBAL_INVITES_KEY] = {
      invitesByToken: new Map<string, InviteRecord>(),
    };
  }
  return g[GLOBAL_INVITES_KEY]!;
}

export class InMemoryInviteRepo implements InviteRepo {
  private get store() {
    return getGlobalInviteStore();
  }

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

    this.store.invitesByToken.set(key(record.token), record);
    return record;
  }

  async get(token: InviteToken): Promise<InviteRecord | null> {
    const t = key(token);
    const record = this.store.invitesByToken.get(t) ?? null;
    if (!record) return null;

    if (record.expiresAt.getTime() <= Date.now()) {
      this.store.invitesByToken.delete(t);
      return null;
    }

    return record;
  }

  async delete(token: InviteToken): Promise<boolean> {
    return this.store.invitesByToken.delete(key(token));
  }
}
