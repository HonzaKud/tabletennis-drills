import Image from "next/image";
import { Drill } from "../types/drill";
import {
  AGE_GROUP_LABELS,
  DRILL_CATEGORY_LABELS,
  EQUIPMENT_LABELS,
} from "../constants/labels";

type Props = {
  drill: Drill;
  /**
   * Optional click handler (future: open detail page).
   * Keeping it optional lets us reuse this card in list/detail contexts.
   */
  onClick?: (drillId: string) => void;
};

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  return `${minutes} min`;
}

export function DrillCard({ drill, onClick }: Props) {
  const clickable = typeof onClick === "function";

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm",
        "transition-shadow hover:shadow-md",
        clickable ? "cursor-pointer" : "",
      ].join(" ")}
      onClick={clickable ? () => onClick(drill.id) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.(drill.id);
            }
          : undefined
      }
      aria-label={clickable ? `Otevřít cvičení: ${drill.title}` : undefined}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-gray-900 md:text-lg">
          {drill.title}
        </h3>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {AGE_GROUP_LABELS[drill.ageGroup]}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
        {drill.description}
      </p>

      {/* Image (optional, placed below description) */}
      {drill.image && (
        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
          <Image
            src={drill.image}
            alt={drill.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false}
          />
        </div>
      )}

      {/* Meta chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {DRILL_CATEGORY_LABELS[drill.category]}
        </span>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {formatDuration(drill.durationMinutes)}
        </span>

        {drill.equipment.length > 0 && (
          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
            Pomůcky:{" "}
            {drill.equipment.map((k) => EQUIPMENT_LABELS[k]).join(", ")}
          </span>
        )}
      </div>

      {/* Tags */}
      {drill.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {drill.tags.slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Subtle sporty accent */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-orange-100 to-transparent opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
    </article>
  );
}
