"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import { DrillFilters, DrillFilterState } from "@/features/drills/components/DrillFilters";
import { Sponsors } from "@/components/Sponsors";
import { HeroLogo } from "@/components/HeroLogo";

function buildDrillsUrl(filters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.category !== "ALL") params.set("category", filters.category);

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

export default function HomePage() {
  const router = useRouter();

  const allDrills = useMemo(() => getAllDrills(), []);

  const [filters, setFilters] = useState<DrillFilterState>({
    ageGroup: "ALL",
    category: "ALL",
  });

  // Landing page only: show "X z Y" preview for the selected filters.
  const filteredCount = useMemo(() => {
    return filterDrills(allDrills, {
      ageGroup: filters.ageGroup === "ALL" ? undefined : filters.ageGroup,
      category: filters.category === "ALL" ? undefined : filters.category,
    }).length;
  }, [allDrills, filters]);

  const handleSearch = () => {
    router.push(buildDrillsUrl(filters));
  };

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
                Vyber si věkovou kategorii a typ cvičení a klikni na <b>Vyhledat</b>. Pokud nic nevybereš,
                zobrazí se všechna cvičení.
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
          filteredCount={filteredCount}
          onSearch={handleSearch}
          searchLabel="Vyhledat"
        />

        <div className="mt-10 flex justify-center">
          <HeroLogo />
        </div>

        <Sponsors />

        {/* Footer */}
        <footer className="mt-10 flex flex-col gap-2 border-t border-gray-100 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} TableTennis Drills</span>
          <span className="text-gray-400">MVP • Next.js + TypeScript + Tailwind • Data: JSON</span>
        </footer>
      </section>
    </main>
  );
}
