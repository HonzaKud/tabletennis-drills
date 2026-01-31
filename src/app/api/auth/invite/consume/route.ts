import { NextResponse } from "next/server";

import { inviteConsumeSchema } from "@/schemas/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { getAuthRequestMeta } from "@/server/auth/requestMeta";
import { writeAuthAuditEvent } from "@/server/auth/audit";
import { InviteServiceError, inviteService } from "@/server/auth/invite";

export const runtime = "nodejs";

type ApiOk = { ok: true };
type ApiErr =
  | { ok: false; error: "INVALID_JSON" }
  | {
      ok: false;
      error: "VALIDATION_ERROR";
      issues: Array<{ path: string; message: string }>;
    }
  | { ok: false; error: "INVITE_INVALID_OR_EXPIRED" }
  | { ok: false; error: "USER_ALREADY_EXISTS" }
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

async function safeAudit(event: Parameters<typeof writeAuthAuditEvent>[0]) {
  try {
    await writeAuthAuditEvent(event);
  } catch (e) {
    console.warn("[auth] audit write failed", e);
  }
}

/**
 * POST /api/auth/invite/consume
 *
 * Auth v1.1:
 * - Validates token + password
 * - Creates user and session
 * - Sets httpOnly session cookie (auto-login)
 * - Invalidates invite token (one-time use)
 *
 * Security:
 * - Do not leak invite existence beyond "invalid or expired"
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
  const parsed = inviteConsumeSchema.safeParse(payload);
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

  const { token } = parsed.data;

  // 3) Consume invite + auto-login
  try {
    const { sessionId, user } = await inviteService.consumeInvite(parsed.data);
    await setSessionCookie(sessionId);

    await safeAudit({
      type: "SUCCESS",
      email: user.email,
      ip: meta.ip,
      ua: meta.userAgent,
      detail: "invite consumed",
    });

    return json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof InviteServiceError) {
      if (err.code === "USER_ALREADY_EXISTS") {
        await safeAudit({
          type: "FAIL",
          email: "(invite)",
          ip: meta.ip,
          ua: meta.userAgent,
          detail: "invite consume failed: user already exists",
        });

        return json({ ok: false, error: "USER_ALREADY_EXISTS" }, { status: 409 });
      }

      // INVITE_NOT_FOUND / INVITE_EXPIRED => treat same in API
      await safeAudit({
        type: "FAIL",
        email: "(invite)",
        ip: meta.ip,
        ua: meta.userAgent,
        detail: `invite consume failed: ${err.code}`,
      });

      return json(
        { ok: false, error: "INVITE_INVALID_OR_EXPIRED" },
        { status: 400 }
      );
    }

    await safeAudit({
      type: "ERROR",
      email: "(invite)",
      ip: meta.ip,
      ua: meta.userAgent,
      detail: `invite consume error for token: ${token.slice(0, 8)}…`,
    });

    return json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
