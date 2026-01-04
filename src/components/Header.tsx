"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import AppLogo from "@/assets/brand/tabletennis-logo.svg";
import LogoutButton from "@/components/auth/LogoutButton";

type Props = {
  /**
   * Main title displayed in the header.
   * Default is the full app name.
   */
  title?: string;

  /**
   * Optional subtitle displayed under the title.
   * Use this only when you really need extra explanation.
   */
  subtitle?: string;
};

type MeResponse =
  | { authenticated: false }
  | { authenticated: true; user: { id: string; email: string } };

export function Header({
  title = "Tréninková cvičení pro stolní tenis",
  subtitle,
}: Props) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await res.json()) as MeResponse;

        if (!cancelled) setMe(data);
      } catch {
        // Fail-safe: if /me fails, treat as logged out for UI purposes.
        if (!cancelled) setMe({ authenticated: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthed = me?.authenticated === true;
  const email = isAuthed ? me.user.email : null;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0D2C56] via-[#14498A] to-[#1856A5] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-white md:text-2xl">
            <a
              href="/"
              aria-label="Domů"
              title="Domů"
              className="inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0D2C56]"
            >
              <Image
                src={AppLogo as StaticImageData}
                alt="Logo aplikace"
                width={48}
                height={48}
                className="h-9 w-9 select-none object-contain"
                priority={false}
              />
            </a>

            <span>{title}</span>
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-white/80">Načítám…</span>
          ) : isAuthed ? (
            <>
              <span className="hidden text-sm text-white/85 md:inline">
                {email}
              </span>
              <LogoutButton />
            </>
          ) : (
            <a
              href="/login"
              className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
            >
              Přihlásit
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
