import crypto from "node:crypto";

import { AUTH_CONFIG } from "@/lib/auth/config";
import { hashPassword } from "@/lib/auth/password";
import type { SessionId } from "@/lib/auth/cookies";
import { inviteRepo, sessionRepo, userRepo } from "@/server/repositories";
import type { PublicUser } from "@/server/auth/service";
import type { UserId } from "@/server/repositories/userRepo";
import { UserEmailAlreadyExistsError } from "@/server/repositories/userRepo";

/**
 * Result returned after successfully consuming an invite:
 * - user created
 * - invite invalidated
 * - session created (auto-login)
 */
export type ConsumeInviteResult = Readonly<{
  sessionId: SessionId;
  user: PublicUser;
}>;

export type InviteServiceErrorCode =
  | "INVITE_NOT_FOUND"
  | "INVITE_EXPIRED"
  | "USER_ALREADY_EXISTS";

export class InviteServiceError extends Error {
  readonly name = "InviteServiceError";
  readonly code: InviteServiceErrorCode;

  constructor(code: InviteServiceErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: { id: UserId; email: string }): PublicUser {
  return { id: user.id, email: user.email };
}

function nowMs(): number {
  return Date.now();
}

export class InviteService {
  /**
   * Create invite token (used by admin tooling / scripts).
   *
   * v1.1:
   * - no email sending here; caller copies URL manually
   * - stored with TTL via repository
   */
  async createInvite(params: {
    email: string;
    ttlSeconds?: number;
    createdBy?: string;
    note?: string;
  }): Promise<{ token: string; email: string; expiresAt: Date }> {
    const email = normalizeEmail(params.email);

    // Default 48h, but enforce a sane minimum so we never create "instant-expire" invites.
    const ttlSecondsRaw = params.ttlSeconds ?? 48 * 60 * 60;
    const ttlSeconds = Math.max(60, Math.floor(ttlSecondsRaw));

    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(nowMs() + ttlSeconds * 1000);

    await inviteRepo.create({
      token,
      email,
      expiresAt,
      createdBy: params.createdBy,
      note: params.note,
    });

    return { token, email, expiresAt };
  }

  /**
   * Consume invite:
   * - validate token
   * - create user with password hash
   * - invalidate invite (one-time)
   * - create session for auto-login
   */
  async consumeInvite(params: {
    token: string;
    password: string;
  }): Promise<ConsumeInviteResult> {
    const token = (params.token ?? "").trim();
    if (!token) {
      throw new InviteServiceError("INVITE_NOT_FOUND", "Invite not found.");
    }

    const invite = await inviteRepo.get(token);
    if (!invite) {
      // We intentionally do not distinguish invalid vs expired at API layer.
      throw new InviteServiceError("INVITE_NOT_FOUND", "Invite not found.");
    }

    if (invite.expiresAt.getTime() <= nowMs()) {
      // Best-effort cleanup
      await inviteRepo.delete(token);
      throw new InviteServiceError("INVITE_EXPIRED", "Invite expired.");
    }

    const passwordHash = await hashPassword(params.password);

    try {
      const user = await userRepo.create({
        email: normalizeEmail(invite.email),
        passwordHash,
      });

      // One-time token: invalidate. This should succeed normally.
      await inviteRepo.delete(token);

      const sessionExpiresAt = new Date(
        nowMs() + AUTH_CONFIG.sessionTtlSeconds * 1000
      );

      const session = await sessionRepo.create({
        userId: user.id,
        expiresAt: sessionExpiresAt,
      });

      return {
        sessionId: session.sessionId,
        user: toPublicUser(user),
      };
    } catch (e) {
      if (e instanceof UserEmailAlreadyExistsError) {
        // Prevent re-use of the same invite in a "already exists" situation.
        await inviteRepo.delete(token);

        throw new InviteServiceError(
          "USER_ALREADY_EXISTS",
          "User already exists."
        );
      }
      throw e;
    }
  }
}

export const inviteService = new InviteService();
