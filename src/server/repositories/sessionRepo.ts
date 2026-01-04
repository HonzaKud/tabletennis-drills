/**
 * Session repository interface.
 *
 * Auth v1 uses an in-memory implementation.
 * Later we can swap this for MongoDB (or other DB) without changing
 * the auth service or API routes.
 */

export type SessionId = string;
export type UserId = string;

export type SessionRecord = {
  sessionId: SessionId;
  userId: UserId;
  createdAt: Date;
  expiresAt: Date;
};

export type CreateSessionParams = {
  userId: UserId;
  /**
   * Absolute expiration time.
   * TTL is controlled by auth config at a higher layer.
   */
  expiresAt: Date;
};

export interface SessionRepo {
  /**
   * Create a new session record and return the created record.
   * Implementations are responsible for generating a secure sessionId.
   */
  create(params: CreateSessionParams): Promise<SessionRecord>;

  /**
   * Fetch a session record by id.
   * Returns null when not found.
   */
  get(sessionId: SessionId): Promise<SessionRecord | null>;

  /**
   * Delete a session by id.
   * Returns true if a record was removed, false if it did not exist.
   */
  delete(sessionId: SessionId): Promise<boolean>;

  /**
   * Optional helper for cleanup (e.g., removing expired sessions).
   * In-memory implementation may call this opportunistically.
   */
  deleteExpired?(now?: Date): Promise<number>;
}
