"use client";

import { useMemo, useState } from "react";

type Props = {
  token: string;
};

type ApiResponse =
  | { ok: true }
  | { ok: false; error: "INVALID_JSON" }
  | {
      ok: false;
      error: "VALIDATION_ERROR";
      issues: Array<{ path: string; message: string }>;
    }
  | { ok: false; error: "INVITE_INVALID_OR_EXPIRED" }
  | { ok: false; error: "USER_ALREADY_EXISTS" }
  | { ok: false; error: "INTERNAL_ERROR" };

export default function InviteSetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const disabled = useMemo(() => isSubmitting, [isSubmitting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setFormError(null);
    setPasswordError(null);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/invite/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });

      const data = (await res.json()) as ApiResponse;

      if (data.ok) {
        // Auto-login succeeded (cookie set by server). Go to the home page.
        window.location.href = "/";
        return;
      }

      if (data.error === "VALIDATION_ERROR") {
        const pwIssue = data.issues.find((i) => i.path === "password");
        if (pwIssue) setPasswordError(pwIssue.message);
        else setFormError("Zkontroluj prosím zadané údaje.");
        return;
      }

      if (data.error === "INVITE_INVALID_OR_EXPIRED") {
        setFormError("Pozvánka je neplatná nebo expirovaná. Požádej o novou.");
        return;
      }

      if (data.error === "USER_ALREADY_EXISTS") {
        setFormError(
          "Účet pro tento email už existuje. Zkus se přihlásit na stránce Přihlášení."
        );
        return;
      }

      setFormError("Něco se nepovedlo. Zkus to prosím znovu.");
    } catch {
      setFormError("Nepodařilo se připojit k serveru. Zkus to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-800"
        >
          Nové heslo
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          className={[
            "w-full rounded-xl border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition",
            passwordError
              ? "border-red-300 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 focus:ring-2 focus:ring-gray-200",
            disabled ? "opacity-60" : "",
          ].join(" ")}
          placeholder="Zadej nové heslo"
        />
        {passwordError ? (
          <p className="mt-1 text-xs text-red-600">{passwordError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Heslo musí mít minimálně 8 znaků.
          </p>
        )}
      </div>

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className={[
          "inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition",
          disabled ? "opacity-70" : "hover:bg-gray-800",
        ].join(" ")}
      >
        {isSubmitting ? "Nastavuji heslo…" : "Nastavit heslo a pokračovat"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Máš už účet?{" "}
        <a href="/login" className="font-medium text-gray-900 hover:underline">
          Přihlásit se
        </a>
      </p>
    </form>
  );
}
