import { NextResponse } from "next/server";

import { getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";

/**
 * GET /api/auth/me
 *
 * Auth v1:
 * - Checks current session cookie.
 * - Returns authenticated status + minimal user identity.
 */
export async function GET() {
  const sessionId = await getSessionIdFromCookies();

  const result = await authService.me(sessionId);

  return NextResponse.json(result, { status: 200 });
}
