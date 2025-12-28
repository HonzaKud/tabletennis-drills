// src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
        Stránka nebyla nalezena
      </h1>

      <p className="mt-3 text-sm text-gray-600 md:text-base">
        Požadované cvičení nebo stránka neexistuje, případně byla odstraněna.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/drills"
          className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
        >
          Zpět na cvičení
        </Link>

        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Domů
        </Link>
      </div>
    </main>
  );
}
