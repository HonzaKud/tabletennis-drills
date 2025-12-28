import Link from "next/link";
import Image from "next/image";

import { Drill } from "../types/drill";
import {
  AGE_GROUP_LABELS,
  DRILL_CATEGORY_LABELS,
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

export function DrillDetail({
  drill,
  backHref,
  prevHref,
  nextHref,
  prevLabel = "Předchozí",
  nextLabel = "Další",
}: Props) {
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
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {AGE_GROUP_LABELS[drill.ageGroup]}
            </span>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {DRILL_CATEGORY_LABELS[drill.category]}
            </span>

            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {formatDuration(drill.durationMinutes)}
            </span>

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

      {/* Bottom nav (nice on mobile) */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            ← {prevLabel}
          </Link>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-400">
            ← {prevLabel}
          </span>
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
          >
            {nextLabel} →
          </Link>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-400">
            {nextLabel} →
          </span>
        )}
      </div>
    </main>
  );
}
