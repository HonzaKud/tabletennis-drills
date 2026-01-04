import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";

/**
 * POST /api/auth/logout
 *
 * Auth v1:
 * - Invalidates current session (if any).
 * - Clears httpOnly session cookie.
 *
 * Idempotent:
 * - Calling logout multiple times is safe.
 */
export async function POST() {
  const sessionId = await getSessionIdFromCookies();

  if (sessionId) {
    // Best-effort session invalidation. Do not fail logout on repo issues.
    try {
      await authService.logout(sessionId);
    } catch {
      // Intentionally ignore to keep logout reliable and non-leaky.
    }
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true }, { status: 200 });
}
