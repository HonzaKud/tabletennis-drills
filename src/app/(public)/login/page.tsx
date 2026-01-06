import "server-only";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { getSessionIdFromCookies } from "@/lib/auth/cookies";
import { authService } from "@/server/auth/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Přihlášení | TableTennis Drills",
};

export default async function LoginPage() {
  const sessionId = await getSessionIdFromCookies();
  const me = await authService.me(sessionId);

  if (me.authenticated) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-md p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Přihlášení</h1>
          <p className="mt-2 text-sm text-gray-600">
            Přihlas se do aplikace TableTennis Drills.
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
