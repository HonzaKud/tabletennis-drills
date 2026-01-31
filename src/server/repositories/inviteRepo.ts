import "server-only";

/**
 * Invite repository (Auth v1.1).
 *
 * Invite is a short-lived, one-time token that allows a user to set their password
 * and create an account (invite-only onboarding).
 */
export type InviteToken = string;

export type InviteRecord = {
  token: InviteToken;

  /**
   * Canonical email (stored for display + user creation).
   * Lookups/uniqueness for users are handled by UserRepo.
   */
  email: string;

  createdAt: Date;
  expiresAt: Date;

  /**
   * Optional metadata for debugging/audit (not required in v1.1).
   */
  createdBy?: string;
  note?: string;
};

export type CreateInviteParams = Readonly<{
  token: InviteToken;
  email: string;
  expiresAt: Date;
  createdBy?: string;
  note?: string;
}>;

export interface InviteRepo {
  /**
   * Create an invite token record with TTL.
   *
   * Implementations should store with TTL derived from expiresAt.
   * If the token already exists, it should overwrite (tokens are random; collision is extremely unlikely).
   */
  create(params: CreateInviteParams): Promise<InviteRecord>;

  /**
   * Get invite by token.
   * Returns null when missing/expired.
   */
  get(token: InviteToken): Promise<InviteRecord | null>;

  /**
   * Delete invite by token (invalidate one-time token).
   * Returns true if it existed and was removed.
   */
  delete(token: InviteToken): Promise<boolean>;
}
