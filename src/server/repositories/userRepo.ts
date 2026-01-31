/**
 * User repository interface.
 *
 * Design goals:
 * - Minimal surface for Auth v1 (login + /me)
 * - Ready for Auth v1.1 (invite-only onboarding) without breaking changes
 * - Storage-agnostic (memory / KV / Mongo)
 *
 * Notes:
 * - Email is treated as case-insensitive in all lookups.
 * - Passwords are stored only as Argon2id encoded hash strings.
 */

export type UserId = string;

export type UserRecord = Readonly<{
  id: UserId;

  /**
   * Canonical email used for display.
   * (Lookups MUST be case-insensitive; implementations typically index by normalized email.)
   */
  email: string;

  /**
   * Argon2id encoded hash string.
   * Never expose this to the client.
   */
  passwordHash: string;

  createdAt: Date;

  /**
   * Optional soft flags for future use (invite-only flows, account disabling, etc.).
   * For now we keep it optional to avoid migrations in simple stores.
   */
  isActive?: boolean;
}>;

/**
 * Input required to create a new user.
 * `email` should be the canonical value stored for display.
 */
export type CreateUserInput = Readonly<{
  email: string;
  passwordHash: string;
}>;

/**
 * Error thrown when attempting to create a user with an email that already exists.
 * (Used in invite-only onboarding; prevents silent overwrites.)
 */
export class UserEmailAlreadyExistsError extends Error {
  readonly name = "UserEmailAlreadyExistsError";

  constructor(email: string) {
    super(`User with email already exists: ${email}`);
  }
}

export interface UserRepo {
  /**
   * Find a user by email (case-insensitive).
   * Returns null when not found.
   */
  findByEmail(email: string): Promise<UserRecord | null>;

  /**
   * Find a user by id.
   * Returns null when not found.
   */
  findById(id: UserId): Promise<UserRecord | null>;

  /**
   * Create a new user.
   *
   * Expected behavior:
   * - Must be atomic with respect to email uniqueness (case-insensitive).
   * - Throws UserEmailAlreadyExistsError if an existing user already uses the email.
   * - Returns the created record (including generated id and createdAt).
   */
  create(input: CreateUserInput): Promise<UserRecord>;
}
