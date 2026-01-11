import { notFound } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import {
  Drill,
  isAgeGroupFilter,
  isDrillTypeFilter,
  isComboPatternFilter,
  isStartModeFilter,
  AgeGroupFilter,
  DrillTypeFilter,
  ComboPatternFilter,
  StartModeFilter,
} from "@/features/drills/types/drill";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type UrlFilters = {
  ageGroup?: AgeGroupFilter;
  type?: DrillTypeFilter;
  comboPattern?: ComboPatternFilter;
  startMode?: StartModeFilter;
};

function parseUrlFilters(sp: Record<string, string | string[] | undefined>): UrlFilters {
  const ageGroupRaw = firstParam(sp.ageGroup);
  const typeRaw = firstParam(sp.type);
  const comboPatternRaw = firstParam(sp.comboPattern);
  const startModeRaw = firstParam(sp.startMode);

  const type = isDrillTypeFilter(typeRaw) ? typeRaw : undefined;
  const isCombination = type === "COMBINATION";

  return {
    ageGroup: isAgeGroupFilter(ageGroupRaw) ? ageGroupRaw : undefined,
    type,
    comboPattern: isCombination && isComboPatternFilter(comboPatternRaw) ? comboPatternRaw : undefined,
    startMode: isCombination && isStartModeFilter(startModeRaw) ? startModeRaw : undefined,
  };
}

function buildDrillsResultsUrl(filters: UrlFilters): string {
  const params = new URLSearchParams();

  if (filters.ageGroup && filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);

  // Persist combo filters only when type === COMBINATION
  if (filters.type === "COMBINATION") {
    if (filters.comboPattern && filters.comboPattern !== "ALL")
      params.set("comboPattern", filters.comboPattern);
    if (filters.startMode && filters.startMode !== "ALL") params.set("startMode", filters.startMode);
  }

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

function buildDrillDetailUrl(id: string, filters: UrlFilters): string {
  const params = new URLSearchParams();

  if (filters.ageGroup && filters.ageGroup !== "ALL") params.set("ageGroup", filters.ageGroup);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);

  if (filters.type === "COMBINATION") {
    if (filters.comboPattern && filters.comboPattern !== "ALL")
      params.set("comboPattern", filters.comboPattern);
    if (filters.startMode && filters.startMode !== "ALL") params.set("startMode", filters.startMode);
  }

  const qs = params.toString();
  const base = `/drills/${encodeURIComponent(id)}`;
  return qs ? `${base}?${qs}` : base;
}

function getAdjacentIds(drills: Drill[], currentId: string): { prevId?: string; nextId?: string } {
  const idx = drills.findIndex((d) => d.id === currentId);
  if (idx < 0) return {};

  return {
    prevId: idx > 0 ? drills[idx - 1].id : undefined,
    nextId: idx < drills.length - 1 ? drills[idx + 1].id : undefined,
  };
}

export default async function DrillDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const urlFilters = parseUrlFilters(sp);

  const all = getAllDrills();
  const drill = all.find((d) => d.id === id);
  if (!drill) notFound();

  // Build a filtered list so prev/next navigation respects current results context.
  const filtered = filterDrills(all, {
    ageGroup: urlFilters.ageGroup && urlFilters.ageGroup !== "ALL" ? urlFilters.ageGroup : undefined,
    type: urlFilters.type && urlFilters.type !== "ALL" ? urlFilters.type : undefined,
    comboPattern: urlFilters.type === "COMBINATION" ? urlFilters.comboPattern ?? "ALL" : "ALL",
    startMode: urlFilters.type === "COMBINATION" ? urlFilters.startMode ?? "ALL" : "ALL",
  });

  const { prevId, nextId } = getAdjacentIds(filtered, drill.id);

  const backHref = buildDrillsResultsUrl(urlFilters);
  const prevHref = prevId ? buildDrillDetailUrl(prevId, urlFilters) : undefined;
  const nextHref = nextId ? buildDrillDetailUrl(nextId, urlFilters) : undefined;

  return <DrillDetail drill={drill} backHref={backHref} prevHref={prevHref} nextHref={nextHref} />;
}
