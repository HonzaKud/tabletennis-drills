import { NextResponse } from "next/server";

import { loginSchema } from "@/schemas/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { authService, AuthServiceError } from "@/server/auth/service";

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
 */
export async function POST(req: Request) {
  // --- (Optional) Rate limiting hook ---
  // TODO(Auth v1): Add rate limiting here (by IP/email).
  // If rate limited, return 429.

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
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

  try {
    const { sessionId } = await authService.login(email, password);

    // Set httpOnly session cookie (server-only).
    await setSessionCookie(sessionId);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthServiceError) {
      if (err.code === "INVALID_CREDENTIALS") {
        return NextResponse.json(
          { ok: false, error: "INVALID_CREDENTIALS" },
          { status: 401 }
        );
      }
    }

    // Fail-safe: do not leak internal errors.
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
