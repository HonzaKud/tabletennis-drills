"use client";

import { AGE_GROUPS, DRILL_CATEGORIES, AgeGroup, DrillCategory } from "../types/drill";
import { AGE_GROUP_LABELS, DRILL_CATEGORY_LABELS } from "../constants/labels";

export type DrillFilterState = {
  ageGroup: AgeGroup | "ALL";
  category: DrillCategory | "ALL";
};

type Props = {
  value: DrillFilterState;
  onChange: (next: DrillFilterState) => void;

  /**
   * Primary action (landing + results page).
   * Triggers navigation / search.
   */
  onSearch: () => void;
  searchLabel?: string;
};

function isAgeGroup(v: string): v is AgeGroup {
  return (AGE_GROUPS as readonly string[]).includes(v);
}

function isCategory(v: string): v is DrillCategory {
  return (DRILL_CATEGORIES as readonly string[]).includes(v);
}

export function DrillFilters({ value, onChange, onSearch, searchLabel = "Vyhledat" }: Props) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
      aria-label="Filtry cvičení"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex-1">
          {/* Age group */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Věková kategorie</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={value.ageGroup}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  ageGroup: raw === "ALL" ? "ALL" : isAgeGroup(raw) ? raw : value.ageGroup,
                });
              }}
            >
              <option value="ALL">Všechny</option>
              {AGE_GROUPS.map((k) => (
                <option key={k} value={k}>
                  {AGE_GROUP_LABELS[k] ?? k}
                </option>
              ))}
            </select>
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Typ cvičení</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={value.category}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({
                  ...value,
                  category: raw === "ALL" ? "ALL" : isCategory(raw) ? raw : value.category,
                });
              }}
            >
              <option value="ALL">Všechny</option>
              {DRILL_CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {DRILL_CATEGORY_LABELS[k] ?? k}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Search */}
        <div className="md:pl-3">
          <button
            type="button"
            className={[
              "inline-flex h-11 w-full items-center justify-center rounded-xl px-6 text-sm font-medium text-white shadow-sm",
              "bg-[#256CC6] hover:bg-[#1F5AA6]",
              "focus:outline-none focus:ring-2 focus:ring-blue-200",
              "md:w-auto",
            ].join(" ")}
            onClick={onSearch}
          >
            {searchLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
