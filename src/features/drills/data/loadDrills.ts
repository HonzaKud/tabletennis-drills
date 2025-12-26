/**
 * Drill data loader (MVP)
 *
 * Responsibilities:
 * - Load drills from JSON (current MVP source)
 * - Return typed domain objects
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
 * This keeps filtering logic outside UI components.
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
    if (ageGroup && drill.ageGroup !== ageGroup) return false;
    if (category && drill.category !== category) return false;
    return true;
  });
}
