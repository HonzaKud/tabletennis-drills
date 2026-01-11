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
  matchesCombinationFilters,
} from "../types/drill";

/**
 * Returns all drills.
 * In MVP this is a synchronous JSON load.
 *
 * NOTE:
 * - We currently trust the JSON shape at runtime and cast to Drill[].
 * - Once we start filling the DB heavily, we should add Zod validation here.
 */
export function getAllDrills(): Drill[] {
  return rawDrills as Drill[];
}

export type DrillFilterOptions = {
  ageGroup?: AgeGroupFilter;
  type?: DrillTypeFilter;

  /**
   * Combination-specific filters.
   * Only applied when `type === "COMBINATION"` or when filtering a list that includes combinations.
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
 *   - if type is provided and not "ALL", strict match
 * - Combination-specific:
 *   - only applies to drills where drill.type === "COMBINATION"
 *   - is applied only when caller requests it (by passing comboPattern/startMode)
 *
 * Notes:
 * - This function is UI-agnostic and can be reused in server routes / API later.
 */
export function filterDrills(drills: Drill[], options: DrillFilterOptions = {}): Drill[] {
  const {
    ageGroup,
    type,
    comboPattern = "ALL",
    startMode = "ALL",
  } = options;

  return drills.filter((drill) => {
    // Age group filter
    if (ageGroup && !matchesAgeGroup(drill, ageGroup)) return false;

    // Type filter
    if (type && type !== "ALL" && drill.type !== type) return false;

    // Combination-specific filters
    const wantsCombinationFilters = comboPattern !== "ALL" || startMode !== "ALL";
    if (wantsCombinationFilters) {
      // Only combinations can match combo filters.
      if (drill.type !== "COMBINATION") return false;

      if (!matchesCombinationFilters(drill, comboPattern, startMode)) return false;
    }

    return true;
  });
}
