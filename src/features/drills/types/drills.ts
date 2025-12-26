/**
 * TableTennis Drills — Domain model (MVP)
 *
 * Notes:
 * - Data uses stable keys (English) for long-term compatibility (e.g. DB, i18n).
 * - UI will show Czech labels mapped from these keys.
 */

export const AGE_GROUPS = ["U9", "U11", "U13", "U15", "U17", "ADULT"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const DRILL_CATEGORIES = [
  "serve",
  "serve_combo",
  "no_serve_combo",
  "regular_combo",
  "irregular_combo",
  "mixed_regular_irregular",
  "warmup",
  "stretching",
  "multiball",
] as const;
export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

export const EQUIPMENT_KEYS = [
  "cones",
  "barriers",
  "ladder",
  "jump_rope",
  "robot",
  "multiball_basket",
  "stopwatch",
] as const;
export type EquipmentKey = (typeof EQUIPMENT_KEYS)[number];

export interface Drill {
  /** Stable, unique identifier (slug). Example: "serve-short-backspin-targets" */
  id: string;

  /** Czech title shown in UI */
  title: string;

  /** Czech description shown in UI */
  description: string;

  /** Stable category key used for filtering */
  category: DrillCategory;

  /** Stable age group key used for filtering */
  ageGroup: AgeGroup;

  /** Recommended duration in minutes */
  durationMinutes: number;

  /** Optional equipment (stable keys), empty array means "no special equipment" */
  equipment: EquipmentKey[];

  /** Tags are free-form for now (CZ), used for future search and grouping */
  tags: string[];
}
