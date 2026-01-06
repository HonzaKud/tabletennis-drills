import "server-only";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sessionId = await getSessionIdFromCookies();
  const me = await authService.me(sessionId);

  if (!me.authenticated) {
    redirect("/login");
  }

  return <>{children}</>;
}
