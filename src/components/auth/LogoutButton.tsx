"use client";

import { useState } from "react";

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
  const [pending, setPending] = useState(false);

  async function onLogout() {
    if (pending) return;
    setPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      // Full navigation is the most reliable (clears UI state + re-checks guards).
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className={
        className ??
        "rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-60"
      }
    >
      {pending ? "Odhlašuji…" : "Odhlásit"}
    </button>
  );
}
