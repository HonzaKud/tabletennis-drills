import { Suspense } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DrillsClient } from "./DrillsClient";

export default function DrillsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      <Header title="Cvičení" />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<div className="text-sm text-gray-600">Načítám…</div>}>
          <DrillsClient />
        </Suspense>

        <Footer />
      </section>
    </main>
  );
}
