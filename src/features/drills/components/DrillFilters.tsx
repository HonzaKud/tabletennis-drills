"use client";

import {
  AGE_GROUPS,
  DRILL_CATEGORIES,
  AgeGroup,
  DrillCategory,
} from "../types/drill";
import { AGE_GROUP_LABELS, DRILL_CATEGORY_LABELS } from "../constants/labels";

export type DrillFilterState = {
  ageGroup: AgeGroup | "ALL";
  category: DrillCategory | "ALL";
};

type Props = {
  value: DrillFilterState;
  onChange: (next: DrillFilterState) => void;
  totalCount: number;
  filteredCount: number;

  /**
   * Optional action button (Landing / Results page).
   * When provided, the component renders a primary "Search" button.
   */
  onSearch?: () => void;
  searchLabel?: string;
};

function isAgeGroup(v: string): v is AgeGroup {
  return (AGE_GROUPS as readonly string[]).includes(v);
}

function isCategory(v: string): v is DrillCategory {
  return (DRILL_CATEGORIES as readonly string[]).includes(v);
}

export function DrillFilters({
  value,
  onChange,
  totalCount,
  filteredCount,
  onSearch,
  searchLabel = "Vyhledat",
}: Props) {
  const isDefault = value.ageGroup === "ALL" && value.category === "ALL";

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
      aria-label="Filtry cvičení"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-3xl md:flex-1">
          {/* Age group */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">
              Věková kategorie
            </span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              value={value.ageGroup}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  ageGroup:
                    raw === "ALL" ? "ALL" : isAgeGroup(raw) ? raw : value.ageGroup,
                });
              }}
            >
              <option value="ALL">Všechny</option>
              {AGE_GROUPS.map((k) => (
                <option key={k} value={k}>
                  {AGE_GROUP_LABELS[k]}
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">
              Typ cvičení
            </span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              value={value.category}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  category:
                    raw === "ALL" ? "ALL" : isCategory(raw) ? raw : value.category,
                });
              }}
            >
              <option value="ALL">Všechny</option>
              {DRILL_CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {DRILL_CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div className="text-sm text-gray-600" aria-live="polite">
            <span className="font-medium text-gray-900">{filteredCount}</span>{" "}
            z <span className="font-medium text-gray-900">{totalCount}</span>
          </div>

          <div className="flex items-center gap-3">
            {onSearch ? (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-100"
                onClick={onSearch}
                title={searchLabel}
              >
                {searchLabel}
              </button>
            ) : null}

            <button
              type="button"
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onChange({ ageGroup: "ALL", category: "ALL" })}
              disabled={isDefault}
              aria-disabled={isDefault}
              title="Resetovat filtry"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
