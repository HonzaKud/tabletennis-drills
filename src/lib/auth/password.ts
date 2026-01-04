import "server-only";

/**
 * Password hashing & verification (Argon2id).
 *
 * Auth v1 decisions:
 * - Passwords are hashed using Argon2id (NOT encryption).
 * - Passwords are never trimmed/normalized (spaces may be intentional).
 *
 * Notes for Next.js:
 * - This module must run on Node.js runtime (not Edge),
 *   because Argon2 implementations rely on native bindings / Node APIs.
 *
 * Dependencies (choose one and install in your project):
 * - Recommended: `argon2`
 *   npm i argon2
 *
 * If you later want to use Edge runtime, you'd need a different strategy.
 */

export type PasswordHash = string;

type HashOptions = {
  /**
   * Optional server-side "pepper" appended to passwords before hashing.
   * Keep it secret (env var) and never store it in DB.
   *
   * For Auth v1: optional. If not set, hashing still works safely.
   */
  pepper?: string;
};

const DEFAULT_OPTIONS: Required<HashOptions> = {
  pepper: process.env.AUTH_PASSWORD_PEPPER ?? "",
};

/**
 * Argon2id parameters.
 * These are reasonable defaults for a typical serverless Node environment.
 *
 * You can tune later if needed (e.g., based on perf tests).
 */
const ARGON2_PARAMS = {
  // argon2id is the recommended variant for password hashing.
  type: "argon2id" as const,
  // Memory cost in KiB. 65536 KiB = 64 MiB.
  memoryCost: 2 ** 16,
  // Number of iterations.
  timeCost: 3,
  // Parallelism (threads). Keep modest for serverless.
  parallelism: 1,
};

function withPepper(password: string, opts?: HashOptions) {
  const pepper = opts?.pepper ?? DEFAULT_OPTIONS.pepper;
  return pepper ? `${password}${pepper}` : password;
}

async function getArgon2() {
  // Dynamic import keeps this module flexible and avoids bundler edge-cases.
  // Also makes it obvious this is server-only.
  try {
    const mod = await import("argon2");
    return mod;
  } catch (err) {
    // Provide a clear actionable error message.
    throw new Error(
      "Argon2 dependency is missing. Install it with: npm i argon2",
      { cause: err as Error }
    );
  }
}

/**
 * Hash a plain password with Argon2id.
 */
export async function hashPassword(
  plainPassword: string,
  opts?: HashOptions
): Promise<PasswordHash> {
  if (typeof plainPassword !== "string" || plainPassword.length === 0) {
    throw new Error("hashPassword: plainPassword must be a non-empty string.");
  }

  const argon2 = await getArgon2();
  const input = withPepper(plainPassword, opts);

  // `hash` returns an encoded string containing salt + params + hash.
  return argon2.hash(input, {
    type: argon2.argon2id,
    memoryCost: ARGON2_PARAMS.memoryCost,
    timeCost: ARGON2_PARAMS.timeCost,
    parallelism: ARGON2_PARAMS.parallelism,
  });
}

/**
 * Verify a plain password against a stored Argon2 hash.
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: PasswordHash,
  opts?: HashOptions
): Promise<boolean> {
  if (typeof plainPassword !== "string" || plainPassword.length === 0) {
    // Do not throw here; treat as invalid credentials.
    return false;
  }
  if (typeof storedHash !== "string" || storedHash.length === 0) {
    return false;
  }

  const argon2 = await getArgon2();
  const input = withPepper(plainPassword, opts);

  try {
    return await argon2.verify(storedHash, input);
  } catch {
    // If the hash is malformed or verification fails unexpectedly,
    // treat as invalid (do not leak details).
    return false;
  }
}
