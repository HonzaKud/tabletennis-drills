import { notFound } from "next/navigation";

import { getAllDrills, filterDrills } from "@/features/drills/data/loadDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import { Drill } from "@/features/drills/types/drill";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function buildDrillsResultsUrl(opts: { ageGroup?: string; category?: string }): string {
  const params = new URLSearchParams();
  if (opts.ageGroup) params.set("ageGroup", opts.ageGroup);
  if (opts.category) params.set("category", opts.category);

  const qs = params.toString();
  return qs ? `/drills?${qs}` : "/drills";
}

function buildDrillDetailUrl(id: string, opts: { ageGroup?: string; category?: string }): string {
  const params = new URLSearchParams();
  if (opts.ageGroup) params.set("ageGroup", opts.ageGroup);
  if (opts.category) params.set("category", opts.category);

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

  const ageGroup = firstParam(sp.ageGroup);
  const category = firstParam(sp.category);

  const all = getAllDrills();
  const drill = all.find((d) => d.id === id);
  if (!drill) notFound();

  const filtered = filterDrills(all, {
    ageGroup: ageGroup as Drill["ageGroup"] | undefined,
    category: category as Drill["category"] | undefined,
  });

  const { prevId, nextId } = getAdjacentIds(filtered, drill.id);

  const backHref = buildDrillsResultsUrl({ ageGroup, category });
  const prevHref = prevId ? buildDrillDetailUrl(prevId, { ageGroup, category }) : undefined;
  const nextHref = nextId ? buildDrillDetailUrl(nextId, { ageGroup, category }) : undefined;

  return (
    <DrillDetail
      drill={drill}
      backHref={backHref}
      prevHref={prevHref}
      nextHref={nextHref}
    />
  );
}
