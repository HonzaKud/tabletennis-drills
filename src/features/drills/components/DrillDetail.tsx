import Link from "next/link";
import Image from "next/image";

import { Drill, AgeGroupAll, AgeGroup, DrillType, isCombinationDrill } from "../types/drill";
import {
  AGE_GROUP_LABELS,
  DRILL_TYPE_LABELS,
  COMBO_PATTERN_LABELS,
  START_MODE_LABELS,
  EQUIPMENT_LABELS,
} from "../constants/labels";

type Props = {
  drill: Drill;

  backHref: string;

  prevHref?: string;
  nextHref?: string;

  prevLabel?: string;
  nextLabel?: string;
};

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  return `${minutes} min`;
}

function formatAgeGroups(ageGroups: readonly [AgeGroupAll] | readonly AgeGroup[]): string {
  if (ageGroups.length === 1 && ageGroups[0] === "ALL") return "Vše";
  return (ageGroups as readonly AgeGroup[])
    .map((g) => AGE_GROUP_LABELS[g] ?? g)
    .join(", ");
}

/**
 * Picks a primary type to show on a single badge.
 *
 * Rule:
 * - Prefer "COMBINATION" if present (most informative)
 * - Otherwise take the first type (keeps author's ordering)
 */
function getPrimaryType(types: readonly DrillType[]): DrillType {
  return (types as readonly DrillType[]).includes("COMBINATION") ? "COMBINATION" : types[0];
}

export function DrillDetail({
  drill,
  backHref,
  prevHref,
  nextHref,
  prevLabel = "Předchozí",
  nextLabel = "Další",
}: Props) {
  const ageLabel = formatAgeGroups(drill.ageGroups);

  const primaryType = getPrimaryType(drill.types);
  const primaryTypeLabel = DRILL_TYPE_LABELS[primaryType] ?? primaryType;

  const combo = isCombinationDrill(drill);

  const comboPatternLabel = combo
    ? (COMBO_PATTERN_LABELS[drill.comboPattern] ?? drill.comboPattern)
    : null;

  // Subtle hint: show start mode only when it's unambiguous (single mode)
  const startModeLabel =
    combo && drill.startModes.length === 1
      ? (START_MODE_LABELS[drill.startModes[0]] ?? drill.startModes[0])
      : null;

  const extraTypeLabels = drill.types
    .filter((t) => t !== primaryType)
    .map((t) => DRILL_TYPE_LABELS[t] ?? t);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      {/* Top nav */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
        >
          <span aria-hidden="true">←</span>
          Zpět na výsledky
        </Link>

        <div className="flex items-center gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
              aria-label="Předchozí cvičení"
            >
              {prevLabel}
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400">
              {prevLabel}
            </span>
          )}

          {nextHref ? (
            <Link
              href={nextHref}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50"
              aria-label="Další cvičení"
            >
              {nextLabel}
            </Link>
          ) : (
            <span className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400">
              {nextLabel}
            </span>
          )}
        </div>
      </div>

      {/* Card */}
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold leading-snug text-gray-900 md:text-2xl">
            {drill.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {/* Age groups */}
            <span
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
              title="Věková kategorie"
            >
              {ageLabel}
            </span>

            {/* Primary type */}
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {primaryTypeLabel}
            </span>

            {/* Extra types (e.g. WARMUP + STRETCHING) */}
            {extraTypeLabels.map((lbl) => (
              <span
                key={lbl}
                className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                title="Další zařazení"
              >
                {lbl}
              </span>
            ))}

            {/* Combination extras */}
            {combo && comboPatternLabel && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {comboPatternLabel}
              </span>
            )}

            {startModeLabel && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {startModeLabel}
              </span>
            )}

            {/* Duration */}
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {formatDuration(drill.durationMinutes)}
            </span>

            {/* Equipment */}
            {drill.equipment.length > 0 && (
              <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                Pomůcky: {drill.equipment.map((k) => EQUIPMENT_LABELS[k]).join(", ")}
              </span>
            )}
          </div>

          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 md:text-base">
            {drill.description}
          </p>

          {/* Image below description (as agreed) */}
          {drill.image && (
            <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
              <Image
                src={drill.image}
                alt={drill.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority={false}
              />
            </div>
          )}

          {drill.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {drill.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
