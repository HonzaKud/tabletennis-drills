import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";

export const runtime = "nodejs";

type ApiOk = { ok: true };

function json(body: ApiOk, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

/**
 * POST /api/auth/logout
 *
 * Auth v1:
 * - Invalidates current session (if any).
 * - Clears httpOnly session cookie.
 *
 * Idempotent:
 * - Calling logout multiple times is safe.
 *
 * Operational:
 * - Best-effort: do not fail logout on repo issues.
 */
export async function POST() {
  const sessionId = await getSessionIdFromCookies();

  // Best-effort session invalidation. Never block logout on infra/repo issues.
  if (sessionId) {
    try {
      await authService.logout(sessionId);
    } catch (e) {
      console.warn("[auth] logout session invalidation failed (ignored)", e);
    }
  }

  await clearSessionCookie();
  return json({ ok: true }, { status: 200 });
}
