/**
 * User repository interface.
 *
 * Auth v1 needs only a minimal subset:
 * - find user by email (for login)
 *
 * Later (v1.1 / v2) we can extend this for:
 * - invite onboarding / password resets (tokens, status)
 * - user creation
 * - password changes
 */

export type UserId = string;

export type UserRecord = {
  id: UserId;
  email: string;
  /**
   * Argon2id encoded hash string.
   * Never expose this to the client.
   */
  passwordHash: string;

  createdAt: Date;
  /**
   * Optional soft flags for future use (invite-only flows, etc.).
   */
  isActive?: boolean;
};

export interface UserRepo {
  /**
   * Find a user by email (case-insensitive).
   * Returns null when not found.
   */
  findByEmail(email: string): Promise<UserRecord | null>;

  /**
   * Find a user by id.
   * Optional for Auth v1; useful for /me, audit, future features.
   */
  findById(id: UserId): Promise<UserRecord | null>;
}
