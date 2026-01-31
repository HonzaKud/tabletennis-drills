import { NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";
import type { MeResponse } from "@/schemas/auth";

export const runtime = "nodejs";

function json(body: MeResponse, init?: { status?: number }) {
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

/**
 * GET /api/auth/me
 *
 * Auth v1:
 * - Checks current session cookie.
 * - Returns authenticated status + minimal user identity.
 *
 * Operational:
 * - Best-effort: if auth storage is temporarily unavailable,
 *   return authenticated:false rather than failing the UI with 500.
 */
export async function GET() {
  const sessionId = await getSessionIdFromCookies();

  try {
    const result = await authService.me(sessionId);
    return json(result, { status: 200 });
  } catch (e) {
    console.warn("[auth] /me failed (best-effort -> unauthenticated)", e);
    return json({ authenticated: false }, { status: 200 });
  }
}
