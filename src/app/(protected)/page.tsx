"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import {
  DrillFilters,
  DrillFilterState,
} from "@/features/drills/components/DrillFilters";

import { Sponsors } from "@/components/Sponsors";
import { HeroLogo } from "@/components/HeroLogo";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

function buildDrillsUrl(filters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.type !== "ALL") params.set("type", filters.type);

  if (filters.type === "COMBINATION") {
    if (filters.comboPattern !== "ALL") params.set("comboPattern", filters.comboPattern);
    if (filters.startMode !== "ALL") params.set("startMode", filters.startMode);
  }

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

export default function HomePage() {
  const router = useRouter();

  const allDrills = useMemo(() => getAllDrills(), []);

  const [filters, setFilters] = useState<DrillFilterState>({
    ageGroup: "ALL",
    type: "ALL",
    comboPattern: "ALL",
    startMode: "ALL",
  });

  // Landing page only: internal preview (not displayed in UI).
  const filteredCount = useMemo(() => {
    return filterDrills(allDrills, {
      ageGroup: filters.ageGroup === "ALL" ? undefined : filters.ageGroup,
      type: filters.type === "ALL" ? undefined : filters.type,
      comboPattern: filters.type === "COMBINATION" ? filters.comboPattern : "ALL",
      startMode: filters.type === "COMBINATION" ? filters.startMode : "ALL",
    }).length;
  }, [allDrills, filters]);

  const handleSearch = () => {
    router.push(buildDrillsUrl(filters));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      <Header title="Trénink stolního tenisu" />

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="mb-4 max-w-3xl text-sm text-gray-700 md:text-base">
          Vyber si věkovou kategorii a typ cvičení a klikni na <b>Vyhledat</b>.
          U <b>Kombinací</b> se objeví i upřesnění (pravidelná/nepravidelná + start).
        </p>

        <DrillFilters
          value={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          searchLabel="Vyhledat"
        />

        {/* (volitelné) jen pokud chceš někde ukázat počet */}
        <div className="mt-3 text-sm text-gray-600">
          Nalezeno: <span className="font-medium text-gray-900">{filteredCount}</span>
        </div>

        <div className="mt-10 flex justify-center">
          <HeroLogo />
        </div>

        <Sponsors />

        <Footer />
      </section>
    </main>
  );
}
