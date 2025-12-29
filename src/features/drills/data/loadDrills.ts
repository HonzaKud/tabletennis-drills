/**
 * Drill data loader (MVP)
 *
 * Responsibilities:
 * - Load drills from JSON (current MVP source)
 * - Return typed domain objects
 * - Provide domain-level filtering helpers (kept outside UI components)
 *
 * Future:
 * - Validation (Zod)
 * - Database / API source
 * - Caching / pagination
 */

import rawDrills from "@/data/drills/drills.cz.json";
import { Drill } from "../types/drill";

/**
 * Returns all drills.
 * In MVP this is a synchronous JSON load.
 */
export function getAllDrills(): Drill[] {
  return rawDrills as Drill[];
}

/**
 * Returns drills filtered by age group and/or category.
 *
 * Rules:
 * - If `options.ageGroup` is provided, drills with `drill.ageGroup === "ALL"` must always match.
 *   (Meaning: the drill is suitable for all age groups.)
 * - If `options.ageGroup` is not provided, we do not filter by age group.
 * - Category filtering is strict equality when provided.
 */
export function filterDrills(
  drills: Drill[],
  options: {
    ageGroup?: Drill["ageGroup"];
    category?: Drill["category"];
  }
): Drill[] {
  const { ageGroup, category } = options;

  return drills.filter((drill) => {
    // Age group filter:
    // - if user filters by a specific age group, accept drills matching that age group
    //   OR drills marked as "ALL".
    if (ageGroup) {
      const matchesAge = drill.ageGroup === ageGroup || drill.ageGroup === "ALL";
      if (!matchesAge) return false;
    }

    // Category filter (strict match)
    if (category && drill.category !== category) return false;

    return true;
  });
}
