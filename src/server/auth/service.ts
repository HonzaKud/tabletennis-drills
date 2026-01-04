import "server-only";

import { AUTH_CONFIG } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import type { SessionId } from "@/lib/auth/cookies";
import { sessionRepo, userRepo } from "@/server/repositories";
import type { UserId } from "@/server/repositories/userRepo";

/**
 * Public user shape that can be safely returned to API routes / UI.
 */
export type PublicUser = {
  id: UserId;
  email: string;
};

export type AuthServiceErrorCode =
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AuthServiceError extends Error {
  readonly code: AuthServiceErrorCode;

  constructor(code: AuthServiceErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export type LoginResult = {
  sessionId: SessionId;
  user: PublicUser;
};

export type MeResult =
  | { authenticated: true; user: PublicUser }
  | { authenticated: false };

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
   * - Returns INVALID_CREDENTIALS for any credential mismatch.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepo.findByEmail(normalizedEmail);

    // If user does not exist OR is inactive, we still respond as invalid credentials.
    if (!user || user.isActive === false) {
      throw new AuthServiceError("INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new AuthServiceError("INVALID_CREDENTIALS", "Invalid credentials.");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + AUTH_CONFIG.sessionTtlSeconds * 1000);

    const session = await sessionRepo.create({
      userId: user.id,
      expiresAt,
    });

    return {
      sessionId: session.sessionId,
      user: { id: user.id, email: user.email },
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
   */
  async me(sessionId: SessionId | null): Promise<MeResult> {
    if (!sessionId) return { authenticated: false };

    const session = await sessionRepo.get(sessionId);
    if (!session) return { authenticated: false };

    const user = await userRepo.findById(session.userId);
    if (!user || user.isActive === false) {
      // If user is missing/disabled, treat as not authenticated.
      // (Optional: could also proactively delete session)
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: { id: user.id, email: user.email },
    };
  }
}

/**
 * Default singleton service instance.
 * (Useful for route handlers.)
 */
export const authService = new AuthService();
