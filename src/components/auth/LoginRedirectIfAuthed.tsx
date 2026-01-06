"use client";

import { useEffect } from "react";

export default function LoginRedirectIfAuthed() {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await res.json()) as { authenticated: boolean };

        if (!cancelled && data?.authenticated) {
          window.location.replace("/");
        }
      } catch {
        // ignore
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
