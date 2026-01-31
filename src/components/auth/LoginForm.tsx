"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

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
        | "INTERNAL_ERROR"
        | "RATE_LIMITED";
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

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;

  // Only allow internal relative paths to prevent open redirects.
  // Examples allowed: "/drills", "/drills/123", "/"
  // Disallowed: "http://evil.com", "//evil.com", "javascript:..."
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;

  // Optional: disallow redirecting back to login itself
  if (raw === "/login") return null;

  return raw;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const nextPath = safeNextPath(searchParams.get("next")) ?? "/drills";

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
          // ✅ Redirect back to protected page (or default)
          router.replace(nextPath);
          return;
        }

        if (!data.ok) {
          if (data.error === "INVALID_CREDENTIALS") {
            setServerError("Neplatný email nebo heslo.");
            return;
          }

          if (data.error === "RATE_LIMITED") {
            setServerError("Příliš mnoho pokusů. Zkus to prosím za chvíli.");
            return;
          }

          if (data.error === "VALIDATION_ERROR" && data.issues?.length) {
            let anyFieldIssue = false;

            for (const issue of data.issues) {
              if (issue.path === "email" || issue.path === "password") {
                anyFieldIssue = true;
                form.setError(issue.path as keyof LoginInput, {
                  type: "server",
                  message: issue.message,
                });
              }
            }

            // If validation issues don't map to known fields, show the first message.
            if (!anyFieldIssue) {
              setServerError(data.issues[0]?.message ?? "Neplatná data.");
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {serverError}
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className={[
            "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
            "outline-none transition",
            "focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
            "disabled:opacity-60",
          ].join(" ")}
          {...form.register("email")}
          disabled={isPending}
        />
        {issuesByField.email?.message ? (
          <p className="text-sm text-red-600">{issuesByField.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-800">
          Heslo
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={[
            "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
            "outline-none transition",
            "focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
            "disabled:opacity-60",
          ].join(" ")}
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
        className={[
          "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
          "bg-blue-600 hover:bg-blue-700",
          "focus:outline-none focus:ring-4 focus:ring-blue-200",
          "disabled:opacity-60 disabled:hover:bg-blue-600",
          "transition",
        ].join(" ")}
      >
        {isPending ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
