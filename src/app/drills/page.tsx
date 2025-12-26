"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import { DrillFilters, DrillFilterState } from "@/features/drills/components/DrillFilters";
import { DrillList } from "@/features/drills/components/DrillList";
import { isAgeGroup, isDrillCategory } from "@/features/drills/types/drill";

function parseFilterStateFromSearchParams(params: URLSearchParams): DrillFilterState {
  const ageGroupRaw = params.get("ageGroup");
  const categoryRaw = params.get("category");

  return {
    ageGroup: isAgeGroup(ageGroupRaw) ? ageGroupRaw : "ALL",
    category: isDrillCategory(categoryRaw) ? categoryRaw : "ALL",
  };
}

function buildDrillsUrl(filters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.category !== "ALL") params.set("category", filters.category);

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

export default function DrillsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const allDrills = useMemo(() => getAllDrills(), []);

  // Source of truth: URL (so Back/Forward works naturally).
  const urlFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    return parseFilterStateFromSearchParams(params);
  }, [searchParams]);

  // Draft state: user can change selects without immediately changing the results.
  const [draftFilters, setDraftFilters] = useState<DrillFilterState>(urlFilters);

  // Keep draft in sync with URL on Back/Forward navigation.
  useEffect(() => {
    setDraftFilters(urlFilters);
  }, [urlFilters]);

  const filtered = useMemo(() => {
    return filterDrills(allDrills, {
      ageGroup: urlFilters.ageGroup === "ALL" ? undefined : urlFilters.ageGroup,
      category: urlFilters.category === "ALL" ? undefined : urlFilters.category,
    });
  }, [allDrills, urlFilters]);

  const draftFilteredCount = useMemo(() => {
    return filterDrills(allDrills, {
      ageGroup: draftFilters.ageGroup === "ALL" ? undefined : draftFilters.ageGroup,
      category: draftFilters.category === "ALL" ? undefined : draftFilters.category,
    }).length;
  }, [allDrills, draftFilters]);

  const applySearch = () => {
    router.push(buildDrillsUrl(draftFilters));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-white">
      {/* Top bar (compact) */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-800">
              🏓 TableTennis Drills
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
              Cvičení
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <DrillFilters
          value={draftFilters}
          onChange={setDraftFilters}
          totalCount={allDrills.length}
          filteredCount={draftFilteredCount}
          onSearch={applySearch}
          searchLabel="Vyhledat"
        />

        <div className="mt-6">
          <DrillList
            drills={filtered}
            onDrillClick={(id) => {
              // MVP: detail route will be added in the next iteration.
              console.log("Drill clicked:", id);
            }}
          />
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-gray-100 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} TableTennis Drills</span>
          <span className="text-gray-400">MVP • Next.js + TypeScript + Tailwind • Data: JSON</span>
        </footer>
      </section>
    </main>
  );
}
