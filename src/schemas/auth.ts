import { z } from "zod";

/**
 * Shared validation schemas for authentication (FE + BE).
 *
 * Auth v1 scope:
 * - login (email + password)
 * - no public registration
 * - no reset password
 *
 * Auth v1.1 adds:
 * - invite onboarding (token + set password)
 *
 * Notes:
 * - We intentionally validate on BOTH FE and BE.
 * - Error messages are user-friendly (Czech) and safe to expose.
 */

export const AUTH_LIMITS = {
  EMAIL_MAX_LENGTH: 254,
  // 72 is a common practical upper bound to prevent abuse (huge payloads).
  // It's historically tied to bcrypt, but still a sensible limit for Argon2id as well.
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 72,
} as const;

/**
 * Canonical email normalization:
 * - trims whitespace
 * - lowercases for case-insensitive identity (login, invite, uniqueness)
 *
 * We keep email canonicalized across FE/BE to reduce accidental duplicates.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email je povinný.")
  .max(AUTH_LIMITS.EMAIL_MAX_LENGTH, "Email je příliš dlouhý.")
  .email("Zadej platný email.")
  .transform((v) => v.toLowerCase());

/**
 * Password rules:
 * - NO trimming (spaces can be intentional)
 * - length bounds to prevent abuse and keep UX reasonable
 */
export const passwordSchema = z
  .string()
  .min(
    AUTH_LIMITS.PASSWORD_MIN_LENGTH,
    `Heslo musí mít alespoň ${AUTH_LIMITS.PASSWORD_MIN_LENGTH} znaků.`,
  )
  .max(
    AUTH_LIMITS.PASSWORD_MAX_LENGTH,
    `Heslo může mít maximálně ${AUTH_LIMITS.PASSWORD_MAX_LENGTH} znaků.`,
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Invite-only onboarding (Auth v1.1):
 * user arrives with token and sets their password.
 */
export const inviteConsumeSchema = z.object({
  token: z.string().trim().min(1, "Pozvánka (token) je povinná."),
  password: passwordSchema,
});

export type InviteConsumeInput = z.infer<typeof inviteConsumeSchema>;

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
