"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import {
  DrillFilters,
  DrillFilterState,
} from "@/features/drills/components/DrillFilters";
import { DrillList } from "@/features/drills/components/DrillList";
import { isAgeGroup, isDrillCategory } from "@/features/drills/types/drill";

function parseFilterStateFromSearchParams(
  params: URLSearchParams
): DrillFilterState {
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

function buildDrillDetailUrl(drillId: string, urlFilters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (urlFilters.ageGroup !== "ALL") params.set("ageGroup", urlFilters.ageGroup);
  if (urlFilters.category !== "ALL") params.set("category", urlFilters.category);

  const qs = params.toString();
  const base = `/drills/${encodeURIComponent(drillId)}`;
  return qs ? `${base}?${qs}` : base;
}

function formatCzCount(n: number): string {
  if (n === 1) return "1 cvičení";
  return `${n} cvičení`;
}

export function DrillsClient() {
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

  const applySearch = () => {
    router.push(buildDrillsUrl(draftFilters));
  };

  const openDrillDetail = (drillId: string) => {
    router.push(buildDrillDetailUrl(drillId, urlFilters));
  };

  return (
    <>
      <DrillFilters
        value={draftFilters}
        onChange={setDraftFilters}
        onSearch={applySearch}
        searchLabel="Vyhledat"
      />

      <div className="mt-3 text-sm text-gray-600">
        Nalezeno:{" "}
        <span className="font-medium text-gray-900">
          {formatCzCount(filtered.length)}
        </span>
      </div>

      <div className="mt-6">
        <DrillList drills={filtered} onDrillClick={openDrillDetail} />
      </div>
    </>
  );
}
