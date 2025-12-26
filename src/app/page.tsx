"use client";

import { useMemo, useState } from "react";
import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import { DrillFilters, DrillFilterState } from "@/features/drills/components/DrillFilters";
import { DrillList } from "@/features/drills/components/DrillList";

export default function HomePage() {
  const allDrills = useMemo(() => getAllDrills(), []);

  const [filters, setFilters] = useState<DrillFilterState>({
    ageGroup: "ALL",
    category: "ALL",
  });

  const filtered = useMemo(() => {
    return filterDrills(allDrills, {
      ageGroup: filters.ageGroup === "ALL" ? undefined : filters.ageGroup,
      category: filters.category === "ALL" ? undefined : filters.category,
    });
  }, [allDrills, filters]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      {/* Top bar */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
                🏓 TableTennis Drills
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Tréninková cvičení pro stolní tenis
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                Vyber si věkovou kategorii a typ cvičení. Zobrazí se jednoduchý přehled
                cvičení, který se dá používat přímo v hale na telefonu.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <DrillFilters
          value={filters}
          onChange={setFilters}
          totalCount={allDrills.length}
          filteredCount={filtered.length}
        />

        <DrillList
          drills={filtered}
          onDrillClick={(id) => {
            // MVP: detail route will be added in the next iteration.
            // For now we keep click capability prepared but non-blocking.
            console.log("Drill clicked:", id);
          }}
        />

        {/* Sponsors placeholder (MVP) */}
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Sponzoři (placeholder)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Sem později doplníme loga sponzorů nebo partnerů. V MVP jen placeholder.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col gap-2 border-t border-gray-100 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} TableTennis Drills</span>
          <span className="text-gray-400">MVP • Next.js + TypeScript + Tailwind • Data: JSON</span>
        </footer>
      </section>
    </main>
  );
}
