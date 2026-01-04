import "server-only";

import { cookies } from "next/headers";
import { AUTH_CONFIG, getSessionCookieOptions } from "./config";

export type SessionId = string;

/**
 * Read session id from cookies.
 * Returns null when cookie is missing or empty.
 */
export async function getSessionIdFromCookies(): Promise<SessionId | null> {
  const store = await cookies();
  const raw = store.get(AUTH_CONFIG.sessionCookieName)?.value ?? "";
  const sessionId = raw.trim();
  return sessionId.length > 0 ? sessionId : null;
}

/**
 * Set session cookie with given session id.
 */
export async function setSessionCookie(sessionId: SessionId): Promise<void> {
  if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
    throw new Error("setSessionCookie: sessionId must be a non-empty string.");
  }

  const store = await cookies();
  store.set(AUTH_CONFIG.sessionCookieName, sessionId, getSessionCookieOptions());
}

/**
 * Clear session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(AUTH_CONFIG.sessionCookieName, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}
