/**
 * Drill data loader (MVP)
 *
 * Responsibilities:
 * - Load drills from JSON (current MVP source)
 * - Return typed domain objects
 * - Provide domain-level filtering helpers (kept outside UI components)
 *
 * Future:
 * - Runtime validation (Zod)
 * - Database / API source
 * - Caching / pagination
 */

import rawDrills from "@/data/drills/drills.cz.json";

import {
  Drill,
  AgeGroupFilter,
  DrillTypeFilter,
  ComboPatternFilter,
  StartModeFilter,
  matchesAgeGroup,
  matchesType,
  matchesCombinationFilters,
  isCombinationDrill,
} from "../types/drill";

/**
 * Returns all drills.
 * In MVP this is a synchronous JSON load.
 *
 * NOTE:
 * - We currently trust the JSON shape at runtime.
 * - We cast via `unknown` to avoid TS "may be a mistake" warnings with discriminated unions.
 * - Once we start filling the DB heavily, add runtime validation (e.g., Zod) here.
 */
export function getAllDrills(): Drill[] {
  return rawDrills as unknown as Drill[];
}

export type DrillFilterOptions = {
  ageGroup?: AgeGroupFilter;
  type?: DrillTypeFilter;

  /**
   * Combination-specific filters.
   * Only applied when caller requests it (by passing comboPattern/startMode).
   */
  comboPattern?: ComboPatternFilter;
  startMode?: StartModeFilter;
};

/**
 * Returns drills filtered by domain-level rules.
 *
 * Rules:
 * - Age group:
 *   - drills with ageGroups ["ALL"] always match any age filter
 *   - otherwise drill.ageGroups must include the selected group
 * - Type:
 *   - if type is provided, drill.types must include the selected type
 * - Combination-specific:
 *   - only applies to combination drills (drill.types includes "COMBINATION")
 *   - applied only when caller requests it (comboPattern/startMode != "ALL")
 *
 * Notes:
 * - UI-agnostic; reusable in API/server code later.
 */
export function filterDrills(drills: Drill[], options: DrillFilterOptions = {}): Drill[] {
  const { ageGroup, type, comboPattern = "ALL", startMode = "ALL" } = options;

  const wantsCombinationFilters = comboPattern !== "ALL" || startMode !== "ALL";

  return drills.filter((drill) => {
    if (ageGroup && !matchesAgeGroup(drill, ageGroup)) return false;

    // matchesType already treats "ALL" as match-all, so we don't need extra branching here.
    if (type && !matchesType(drill, type)) return false;

    if (wantsCombinationFilters) {
      if (!isCombinationDrill(drill)) return false;
      if (!matchesCombinationFilters(drill, comboPattern, startMode)) return false;
    }

    return true;
  });
}
