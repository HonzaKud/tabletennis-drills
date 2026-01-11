"use client";

/**
 * Drill filters (UI)
 *
 * Revize:
 * - category -> type
 * - when type === "COMBINATION", show two additional filters:
 *   - comboPattern (REGULAR / IRREGULAR)
 *   - startMode (SERVE / FEED)
 *
 * Notes:
 * - Filters are intentionally simple (single-select).
 * - Data itself can contain multiple age groups (ageGroups[]), but the UI filter remains single choice.
 * - Validation for external values is centralized in types/drill.ts (type-guards).
 */

import {
  AGE_GROUPS,
  AgeGroupFilter,
  DrillTypeFilter,
  DRILL_TYPES,
  ComboPatternFilter,
  StartModeFilter,
  COMBO_PATTERNS,
  START_MODES,
  isAgeGroupFilter,
  isDrillTypeFilter,
  isComboPatternFilter,
  isStartModeFilter,
} from "../types/drill";

import {
  AGE_GROUP_LABELS,
  DRILL_TYPE_LABELS,
  COMBO_PATTERN_LABELS,
  START_MODE_LABELS,
} from "../constants/labels";

export type DrillFilterState = {
  ageGroup: AgeGroupFilter;
  type: DrillTypeFilter;

  /** Used only when type === "COMBINATION" (kept in state for URL sync). */
  comboPattern: ComboPatternFilter;
  startMode: StartModeFilter;
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

function normalizeCombinationFilters(
  next: DrillFilterState,
  prev: DrillFilterState,
): DrillFilterState {
  // If user switches away from COMBINATION, reset combination-only filters to "ALL"
  // so they don't accidentally constrain results when returning later.
  if (next.type !== "COMBINATION") {
    return { ...next, comboPattern: "ALL", startMode: "ALL" };
  }

  // If user just switched to COMBINATION, keep previous selections if they exist,
  // otherwise default to "ALL" (neutral).
  return {
    ...next,
    comboPattern: next.comboPattern ?? prev.comboPattern ?? "ALL",
    startMode: next.startMode ?? prev.startMode ?? "ALL",
  };
}

export function DrillFilters({
  value,
  onChange,
  onSearch,
  searchLabel = "Vyhledat",
}: Props) {
  const showCombinationFilters = value.type === "COMBINATION";

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
                const nextAgeGroup = isAgeGroupFilter(raw) ? raw : value.ageGroup;

                onChange({ ...value, ageGroup: nextAgeGroup });
              }}
            >
              <option value="ALL">{AGE_GROUP_LABELS.ALL}</option>
              {AGE_GROUPS.map((k) => (
                <option key={k} value={k}>
                  {AGE_GROUP_LABELS[k] ?? k}
                </option>
              ))}
            </select>
          </label>

          {/* Drill type */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-600">Typ cvičení</span>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={value.type}
              onChange={(e) => {
                const raw = e.target.value;
                const nextType = isDrillTypeFilter(raw) ? raw : value.type;

                onChange(normalizeCombinationFilters({ ...value, type: nextType }, value));
              }}
            >
              <option value="ALL">{DRILL_TYPE_LABELS.ALL}</option>
              {DRILL_TYPES.map((k) => (
                <option key={k} value={k}>
                  {DRILL_TYPE_LABELS[k] ?? k}
                </option>
              ))}
            </select>
          </label>

          {/* Combination: pattern */}
          {showCombinationFilters && (
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Struktura kombinace</span>
              <select
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={value.comboPattern}
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = isComboPatternFilter(raw) ? raw : value.comboPattern;
                  onChange({ ...value, comboPattern: next });
                }}
              >
                <option value="ALL">{COMBO_PATTERN_LABELS.ALL}</option>
                {COMBO_PATTERNS.map((k) => (
                  <option key={k} value={k}>
                    {COMBO_PATTERN_LABELS[k] ?? k}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Combination: start mode */}
          {showCombinationFilters && (
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Start</span>
              <select
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={value.startMode}
                onChange={(e) => {
                  const raw = e.target.value;
                  const next = isStartModeFilter(raw) ? raw : value.startMode;
                  onChange({ ...value, startMode: next });
                }}
              >
                <option value="ALL">{START_MODE_LABELS.ALL}</option>
                {START_MODES.map((k) => (
                  <option key={k} value={k}>
                    {START_MODE_LABELS[k] ?? k}
                  </option>
                ))}
              </select>
            </label>
          )}
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
