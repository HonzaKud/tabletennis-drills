import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      nodeEnv: process.env.NODE_ENV ?? null,
      kvRestApiUrlPresent: Boolean(process.env.KV_REST_API_URL),
      kvRestApiTokenPresent: Boolean(process.env.KV_REST_API_TOKEN),
      vercelUrl: process.env.VERCEL_URL ?? null,
      authBaseUrl: process.env.AUTH_BASE_URL ?? null,
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    },
    { status: 200 }
  );
}
