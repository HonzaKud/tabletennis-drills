"use client";

/**
 * Drills page client (filters + list)
 *
 * URL is the source of truth so Back/Forward works naturally.
 * Users edit "draft" filters and apply via the Search button.
 *
 * Revize:
 * - category -> type
 * - add combination-only filters: comboPattern + startMode
 * - query params:
 *   - ageGroup=U13 | (omitted for ALL)
 *   - type=COMBINATION | (omitted for ALL)
 *   - comboPattern=REGULAR | IRREGULAR | (omitted for ALL)
 *   - startMode=SERVE | FEED | (omitted for ALL)
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import {
  DrillFilters,
  DrillFilterState,
} from "@/features/drills/components/DrillFilters";

import { DrillList } from "@/features/drills/components/DrillList";
import {
  isAgeGroupFilter,
  isDrillTypeFilter,
  isComboPatternFilter,
  isStartModeFilter,
} from "@/features/drills/types/drill";

function parseFilterStateFromSearchParams(params: URLSearchParams): DrillFilterState {
  const ageGroupRaw = params.get("ageGroup");
  const typeRaw = params.get("type");
  const comboPatternRaw = params.get("comboPattern");
  const startModeRaw = params.get("startMode");

  const type = isDrillTypeFilter(typeRaw) ? typeRaw : "ALL";

  // Only meaningful for combinations; keep them in state for URL roundtrips anyway.
  const comboPattern = isComboPatternFilter(comboPatternRaw) ? comboPatternRaw : "ALL";
  const startMode = isStartModeFilter(startModeRaw) ? startModeRaw : "ALL";

  return {
    ageGroup: isAgeGroupFilter(ageGroupRaw) ? ageGroupRaw : "ALL",
    type,
    comboPattern: type === "COMBINATION" ? comboPattern : "ALL",
    startMode: type === "COMBINATION" ? startMode : "ALL",
  };
}

function buildDrillsUrl(filters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.type !== "ALL") params.set("type", filters.type);

  // Only persist combination-only filters when type === COMBINATION
  if (filters.type === "COMBINATION") {
    if (filters.comboPattern !== "ALL") params.set("comboPattern", filters.comboPattern);
    if (filters.startMode !== "ALL") params.set("startMode", filters.startMode);
  }

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

function buildDrillDetailUrl(drillId: string, urlFilters: DrillFilterState): string {
  const params = new URLSearchParams();

  if (urlFilters.ageGroup !== "ALL") params.set("ageGroup", urlFilters.ageGroup);
  if (urlFilters.type !== "ALL") params.set("type", urlFilters.type);

  if (urlFilters.type === "COMBINATION") {
    if (urlFilters.comboPattern !== "ALL") params.set("comboPattern", urlFilters.comboPattern);
    if (urlFilters.startMode !== "ALL") params.set("startMode", urlFilters.startMode);
  }

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
      type: urlFilters.type === "ALL" ? undefined : urlFilters.type,
      comboPattern: urlFilters.type === "COMBINATION" ? urlFilters.comboPattern : "ALL",
      startMode: urlFilters.type === "COMBINATION" ? urlFilters.startMode : "ALL",
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
