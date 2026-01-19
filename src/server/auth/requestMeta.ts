import "server-only";

/**
 * Request metadata helpers for auth.
 *
 * Note:
 * - In serverless/proxied environments the client IP is forwarded via headers.
 * - We take the first IP from X-Forwarded-For (original client).
 */

export type AuthRequestMeta = {
  ip: string;
  userAgent: string;
};

function normalizeHeaderValue(value: string): string {
  return value.trim().replace(/^"+|"+$/g, "");
}

function firstIpFromForwardedFor(value: string): string {
  // x-forwarded-for can be: "client, proxy1, proxy2"
  const first = value.split(",")[0]?.trim() ?? "";
  return first;
}

function pickClientIp(headers: Headers): string {
  // Common proxy headers (order matters)
  const xff = normalizeHeaderValue(headers.get("x-forwarded-for") ?? "");
  const xri = normalizeHeaderValue(headers.get("x-real-ip") ?? "");
  const cf = normalizeHeaderValue(headers.get("cf-connecting-ip") ?? "");

  // RFC 7239 Forwarded: for=1.2.3.4;proto=https;by=...
  const forwarded = normalizeHeaderValue(headers.get("forwarded") ?? "");

  let ip =
    (xff ? firstIpFromForwardedFor(xff) : "") ||
    cf ||
    xri ||
    "";

  ip = normalizeHeaderValue(ip);

  // Very small sanitization: drop placeholder values.
  if (!ip || ip.toLowerCase() === "unknown") return "unknown";

  return ip.slice(0, 100);
}

export function getAuthRequestMeta(req: Request): AuthRequestMeta {
  const headers = req.headers;

  const ip = pickClientIp(headers);

  const userAgent = normalizeHeaderValue(headers.get("user-agent") ?? "").slice(0, 200);

  return { ip, userAgent };
}
