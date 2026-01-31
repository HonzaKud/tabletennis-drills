import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

function maskHost(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.host;
  } catch {
    return null;
  }
}

function shortHash(value: string | null): string | null {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 8);
}

export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL ?? null;
  const kvToken = process.env.KV_REST_API_TOKEN ?? null;

  return NextResponse.json(
    {
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelUrl: process.env.VERCEL_URL ?? null,
      authBaseUrl: process.env.AUTH_BASE_URL ?? null,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,

      kvRestApiUrlPresent: Boolean(kvUrl),
      kvRestApiTokenPresent: Boolean(kvToken),

      // 🔎 fingerprint (safe)
      kvRestApiHost: maskHost(kvUrl),
      kvRestApiUrlHash8: shortHash(kvUrl),
    },
    { status: 200 }
  );
}
