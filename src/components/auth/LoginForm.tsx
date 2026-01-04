"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginInput } from "@/schemas/auth";

type ApiValidationIssue = { path: string; message: string };

type LoginApiResponse =
  | { ok: true }
  | {
      ok: false;
      error:
        | "INVALID_JSON"
        | "VALIDATION_ERROR"
        | "INVALID_CREDENTIALS"
        | "INTERNAL_ERROR";
      issues?: ApiValidationIssue[];
    };

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const issuesByField = useMemo(() => {
    const issues = (form.formState.errors ?? {}) as any;
    return issues;
  }, [form.formState.errors]);

  async function onSubmit(values: LoginInput) {
    setServerError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          credentials: "include",
        });

        // Handle common HTTP-level errors first (even if body isn't JSON).
        if (res.status === 429) {
          setServerError("Příliš mnoho pokusů. Zkus to prosím za chvíli.");
          return;
        }

        if (res.status >= 500) {
          setServerError("Došlo k chybě serveru. Zkus to prosím za chvíli.");
          return;
        }

        const data = (await safeJson<LoginApiResponse>(res)) ?? {
          ok: false as const,
          error: "INTERNAL_ERROR" as const,
        };

        if (res.ok && data.ok) {
          // Full navigation is the most reliable after setting httpOnly cookies.
          window.location.assign("/");
          return;
        }

        // Map known error cases
        if (!data.ok) {
          if (data.error === "INVALID_CREDENTIALS") {
            setServerError("Neplatný email nebo heslo.");
            return;
          }

          if (data.error === "VALIDATION_ERROR" && data.issues?.length) {
            // Clear previous server errors on fields (optional, but feels cleaner)
            // form.clearErrors(); // keep client validation errors; only add server ones

            for (const issue of data.issues) {
              if (issue.path === "email" || issue.path === "password") {
                form.setError(issue.path as keyof LoginInput, {
                  type: "server",
                  message: issue.message,
                });
              } else {
                setServerError(issue.message);
              }
            }
            return;
          }

          if (data.error === "INVALID_JSON") {
            setServerError("Neplatná data. Zkus to prosím znovu.");
            return;
          }

          setServerError("Něco se nepovedlo. Zkus to prosím za chvíli.");
          return;
        }

        setServerError("Něco se nepovedlo. Zkus to prosím za chvíli.");
      } catch {
        setServerError("Nepodařilo se připojit k serveru. Zkus to prosím znovu.");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {serverError}
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          {...form.register("email")}
          disabled={isPending}
        />
        {issuesByField.email?.message ? (
          <p className="text-sm text-red-600">{issuesByField.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Heslo
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          {...form.register("password")}
          disabled={isPending}
        />
        {issuesByField.password?.message ? (
          <p className="text-sm text-red-600">{issuesByField.password.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {isPending ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
