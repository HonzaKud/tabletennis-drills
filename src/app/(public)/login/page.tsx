import "server-only";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image, { StaticImageData } from "next/image";

import AppLogo from "@/assets/brand/tabletennis-logo.svg";
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
    <main className="relative min-h-screen overflow-hidden px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0D2C56]/10 via-white to-white" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-7">
            {/* Brand */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                <Image
                  src={AppLogo as StaticImageData}
                  alt="Logo aplikace TableTennis Drills"
                  width={256}
                  height={256}
                  className="h-14 w-14 select-none object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                  priority={false}
                />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Přihlášení
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Přihlas se a pokračuj v tréninkových cvičeních.
              </p>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-xs text-gray-500">
              © 2026 TableTennis Drills
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
