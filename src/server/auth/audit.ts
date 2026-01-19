import "server-only";

import { kv } from "@vercel/kv";
import { isKvConfigured } from "./kv";

export type AuthAuditEventType = "SUCCESS" | "FAIL" | "RATE_LIMIT" | "ERROR";

export type AuthAuditEvent = {
  ts: string; // ISO timestamp
  type: AuthAuditEventType;
  email?: string;
  ip?: string;
  ua?: string;
  detail?: string;
};

const AUDIT_KEY = "ttd:auth:audit";
const AUDIT_MAX = 300;

type LocalAuditStore = AuthAuditEvent[];
const GLOBAL_AUDIT_KEY = Symbol.for("ttd.auth.audit");

function getLocalStore(): LocalAuditStore {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_AUDIT_KEY]?: LocalAuditStore;
  };
  if (!g[GLOBAL_AUDIT_KEY]) g[GLOBAL_AUDIT_KEY] = [];
  return g[GLOBAL_AUDIT_KEY]!;
}

function normalizeEmail(email: string | undefined): string | undefined {
  const v = (email ?? "").trim().toLowerCase();
  return v.length > 0 ? v : undefined;
}

function normalizeUa(ua: string | undefined): string | undefined {
  const v = (ua ?? "").trim();
  return v.length > 0 ? v.slice(0, 200) : undefined;
}

function normalizeIp(ip: string | undefined): string | undefined {
  const v = (ip ?? "").trim();
  return v.length > 0 ? v.slice(0, 100) : undefined;
}

function normalizeDetail(detail: string | undefined): string | undefined {
  const v = (detail ?? "").trim();
  // Keep it bounded so logs/KV cannot blow up due to unexpected payloads.
  return v.length > 0 ? v.slice(0, 500) : undefined;
}

export async function writeAuthAuditEvent(event: {
  type: AuthAuditEventType;
  email?: string;
  ip?: string;
  ua?: string;
  detail?: string;
}): Promise<void> {
  const record: AuthAuditEvent = {
    ts: new Date().toISOString(),
    type: event.type,
    email: normalizeEmail(event.email),
    ip: normalizeIp(event.ip),
    ua: normalizeUa(event.ua),
    detail: normalizeDetail(event.detail),
  };

  // Always log to console (useful in Vercel logs).
  const msg = `[auth] ${record.type} email=${record.email ?? "-"} ip=${record.ip ?? "-"}`;
  if (record.type === "ERROR") {
    console.error(msg, record.detail ?? "");
  } else if (record.type === "FAIL" || record.type === "RATE_LIMIT") {
    console.warn(msg, record.detail ?? "");
  } else {
    console.info(msg);
  }

  try {
    if (isKvConfigured()) {
      // Keep newest first and trim to last AUDIT_MAX entries.
      await kv.lpush(AUDIT_KEY, JSON.stringify(record));
      await kv.ltrim(AUDIT_KEY, 0, AUDIT_MAX - 1);
      return;
    }
  } catch {
    // Fail-open: audit storage must not break auth flow.
  }

  // Local fallback (dev/no KV)
  const store = getLocalStore();
  store.unshift(record);
  if (store.length > AUDIT_MAX) store.length = AUDIT_MAX;
}
