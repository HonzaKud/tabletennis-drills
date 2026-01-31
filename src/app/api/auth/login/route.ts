import { NextResponse } from "next/server";

import { loginSchema } from "@/schemas/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { authService, AuthServiceError } from "@/server/auth/service";
import { getAuthRequestMeta } from "@/server/auth/requestMeta";
import { checkLoginRateLimit } from "@/server/auth/rateLimit";
import { writeAuthAuditEvent } from "@/server/auth/audit";

export const runtime = "nodejs";

type ApiOk = { ok: true };
type ApiErr =
  | { ok: false; error: "INVALID_JSON" }
  | {
      ok: false;
      error: "VALIDATION_ERROR";
      issues: Array<{ path: string; message: string }>;
    }
  | { ok: false; error: "RATE_LIMITED" }
  | { ok: false; error: "INVALID_CREDENTIALS" }
  | { ok: false; error: "INTERNAL_ERROR" };

function json<T extends ApiOk | ApiErr>(
  body: T,
  init?: { status?: number; headers?: Record<string, string> }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

/**
 * Helper: audit must never break the auth flow.
 */
async function safeAudit(event: Parameters<typeof writeAuthAuditEvent>[0]) {
  try {
    await writeAuthAuditEvent(event);
  } catch (e) {
    // Fail-open: do not block auth flow if audit storage is down.
    console.warn("[auth] audit write failed", e);
  }
}

/**
 * POST /api/auth/login
 *
 * Auth v1:
 * - Validates input with shared Zod schema (FE + BE).
 * - Verifies credentials via AuthService.
 * - Creates server-side session and sets httpOnly cookie.
 *
 * Security:
 * - Returns generic error for invalid credentials (no user enumeration).
 * - Cookie is httpOnly and secure in production (configured centrally).
 *
 * Operational:
 * - Rate limiting (best-effort; fail-open on infra issues).
 * - Audit events (best-effort; never breaks login).
 */
export async function POST(req: Request) {
  const meta = getAuthRequestMeta(req);

  // 1) Parse JSON
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  // 2) Validate
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "VALIDATION_ERROR",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  // 3) Rate limiting (best-effort; apply after validation)
  try {
    const rl = await checkLoginRateLimit({ ip: meta.ip, email });

    if (!rl.allowed) {
      await safeAudit({
        type: "RATE_LIMIT",
        email,
        ip: meta.ip,
        ua: meta.userAgent,
        detail: "login rate limited",
      });

      return json(
        { ok: false, error: "RATE_LIMITED" },
        {
          status: 429,
          headers: rl.retryAfterSeconds
            ? { "Retry-After": String(rl.retryAfterSeconds) }
            : undefined,
        }
      );
    }
  } catch (e) {
    // Fail-open: if rate limit infra is down, proceed without limiting.
    console.warn("[auth] rate limit check failed (fail-open)", e);
  }

  // 4) Perform login + set cookie
  try {
    const { sessionId } = await authService.login(email, password);
    await setSessionCookie(sessionId);

    await safeAudit({
      type: "SUCCESS",
      email,
      ip: meta.ip,
      ua: meta.userAgent,
    });

    return json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthServiceError && err.code === "INVALID_CREDENTIALS") {
      await safeAudit({
        type: "FAIL",
        email,
        ip: meta.ip,
        ua: meta.userAgent,
        detail: "invalid credentials",
      });

      return json({ ok: false, error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    await safeAudit({
      type: "ERROR",
      email,
      ip: meta.ip,
      ua: meta.userAgent,
      detail: "internal error",
    });

    // Fail-safe: do not leak internal errors.
    return json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
