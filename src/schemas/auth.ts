import { z } from "zod";

/**
 * Shared validation schemas for authentication (FE + BE).
 *
 * Auth v1 scope:
 * - login (email + password)
 * - no public registration
 * - no reset password
 * - no remember me
 *
 * Notes:
 * - We intentionally validate on BOTH FE and BE.
 * - Error messages are user-friendly (Czech) and safe to expose.
 */

const EMAIL_MAX_LENGTH = 254;
// Password max length: we keep a sane upper bound to prevent abuse (huge payloads).
// 72 is a common practical limit (historically bcrypt-related). It's fine for Argon2id too.
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email je povinný.")
    .max(EMAIL_MAX_LENGTH, "Email je příliš dlouhý.")
    .email("Zadej platný email.")
    // Normalize to reduce accidental duplicates and improve consistency.
    .transform((v) => v.toLowerCase()),

  password: z
    .string()
    // We do NOT trim passwords (leading/trailing spaces can be valid by user intent).
    .min(PASSWORD_MIN_LENGTH, `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`)
    .max(PASSWORD_MAX_LENGTH, `Heslo může mít maximálně ${PASSWORD_MAX_LENGTH} znaků.`),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * A safe, minimal response shape for `/api/auth/me`.
 * (Kept here so FE and BE can share the same type.)
 */
export const meResponseSchema = z.union([
  z.object({
    authenticated: z.literal(true),
    user: z.object({
      id: z.string().min(1),
      email: z.string().email(),
    }),
  }),
  z.object({
    authenticated: z.literal(false),
  }),
]);

export type MeResponse = z.infer<typeof meResponseSchema>;
