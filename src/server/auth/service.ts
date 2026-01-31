import "server-only";

import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import type { SessionId } from "@/lib/auth/cookies";
import { sessionRepo, userRepo } from "@/server/repositories";
import type { UserId } from "@/server/repositories/userRepo";

/**
 * Public user shape that can be safely returned to API routes / UI.
 */
export type PublicUser = Readonly<{
  id: UserId;
  email: string;
}>;

export type AuthServiceErrorCode =
  | "INVALID_CREDENTIALS"
  // Reserved for future use; routes/middleware typically implement rate limiting.
  | "RATE_LIMITED";

export class AuthServiceError extends Error {
  readonly name = "AuthServiceError";
  readonly code: AuthServiceErrorCode;

  constructor(code: AuthServiceErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export type LoginResult = Readonly<{
  sessionId: SessionId;
  user: PublicUser;
}>;

export type MeResult =
  | Readonly<{ authenticated: true; user: PublicUser }>
  | Readonly<{ authenticated: false }>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: { id: UserId; email: string }): PublicUser {
  return { id: user.id, email: user.email };
}

/**
 * Core auth service (Auth v1).
 *
 * Responsibilities:
 * - verify credentials
 * - create / invalidate sessions
 * - resolve current user from session
 *
 * Not responsible for:
 * - setting/clearing cookies (handled by API routes)
 * - input validation (handled by routes via Zod)
 * - rate limiting (handled by routes/middleware)
 */
export class AuthService {
  /**
   * Login with email + password.
   *
   * Security:
   * - Does not reveal whether the email exists.
   * - Always throws INVALID_CREDENTIALS for any mismatch.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const emailKey = normalizeEmail(email);

    const user = await userRepo.findByEmail(emailKey);

    // If user does not exist OR is inactive, respond as invalid credentials.
    if (!user || user.isActive === false) {
      throw new AuthServiceError("INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new AuthServiceError("INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const now = Date.now();
    const expiresAt = new Date(now + AUTH_CONFIG.sessionTtlSeconds * 1000);

    const session = await sessionRepo.create({
      userId: user.id,
      expiresAt,
    });

    return {
      sessionId: session.sessionId,
      user: toPublicUser(user),
    };
  }

  /**
   * Logout by invalidating a session id.
   *
   * Returns true if a session existed and was removed.
   */
  async logout(sessionId: SessionId): Promise<boolean> {
    if (!sessionId) return false;
    return sessionRepo.delete(sessionId);
  }

  /**
   * Resolve current user from session id.
   *
   * Security:
   * - Missing/expired session => not authenticated
   * - Missing/disabled user => not authenticated
   *
   * Note:
   * - We intentionally do not auto-delete sessions here; routes may call logout explicitly if needed.
   */
  async me(sessionId: SessionId | null): Promise<MeResult> {
    if (!sessionId) return { authenticated: false };

    const session = await sessionRepo.get(sessionId);
    if (!session) return { authenticated: false };

    const user = await userRepo.findById(session.userId);
    if (!user || user.isActive === false) {
      return { authenticated: false };
    }

    return { authenticated: true, user: toPublicUser(user) };
  }
}

/**
 * Default singleton service instance.
 * (Useful for route handlers.)
 */
export const authService = new AuthService();
