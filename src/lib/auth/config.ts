/**
 * Auth configuration (single source of truth).
 *
 * Auth v1 decisions:
 * - session-based auth using httpOnly cookies
 * - TTL: 48 hours
 * - no remember-me in v1 (single TTL for everyone)
 *
 * This file is safe to import on the server. Do NOT import it in client components.
 */

export const AUTH_CONFIG = {
  /**
   * Cookie name storing the session id.
   * Keep it stable once deployed, otherwise users will be logged out.
   */
  sessionCookieName: "ttd_session",

  /**
   * Session time-to-live in seconds (48 hours).
   */
  sessionTtlSeconds: 48 * 60 * 60,

  /**
   * Cookie settings (defaults for Auth v1).
   *
   * - httpOnly: prevents JS access (mitigates XSS token theft)
   * - secure: HTTPS only in production
   * - sameSite: Lax as a reasonable baseline (mitigates CSRF)
   * - path: cookie valid for the whole app
   */
  cookie: {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/" as const,
  },
} as const;

/**
 * True when running in production environment.
 * Vercel sets NODE_ENV=production for production deployments.
 */
export const isProd = process.env.NODE_ENV === "production";

/**
 * Cookie 'secure' flag should be enabled in production (HTTPS).
 * In local development over http://localhost it must be false.
 */
export const cookieSecure = isProd;

/**
 * Convenience values for cookie maxAge.
 */
export const sessionTtlMs = AUTH_CONFIG.sessionTtlSeconds * 1000;

/**
 * Helper to build cookie options in one place.
 * Use in route handlers when setting the session cookie.
 */
export function getSessionCookieOptions() {
  return {
    ...AUTH_CONFIG.cookie,
    secure: cookieSecure,
    maxAge: AUTH_CONFIG.sessionTtlSeconds,
  };
}
