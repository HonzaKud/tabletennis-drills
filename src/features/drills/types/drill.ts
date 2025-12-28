/**
 * TableTennis Drills — Domain model (MVP)
 *
 * Principles:
 * - Domain values use stable keys (no diacritics, consistent casing) to keep data portable
 *   across JSON, DB, i18n, and future APIs.
 * - UI strings (Czech labels) are mapped elsewhere via dictionaries.
 * - Prefer "const arrays + inferred union types" for strong typing with minimal boilerplate.
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

/**
 * Type-guards for parsing from external sources (URL query, JSON, etc.).
 * Keeps validation in one place and avoids duplicating enum lists.
 */
export function isAgeGroup(value: string | null | undefined): value is AgeGroup {
  if (!value) return false;
  return (AGE_GROUPS as readonly string[]).includes(value);
}

export function isDrillCategory(value: string | null | undefined): value is DrillCategory {
  if (!value) return false;
  return (DRILL_CATEGORIES as readonly string[]).includes(value);
}

export function isEquipmentKey(value: string | null | undefined): value is EquipmentKey {
  if (!value) return false;
  return (EQUIPMENT_KEYS as readonly string[]).includes(value);
}

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

  /** Optional image path (served from /public). Example: "/assets/drills/stretching/hamstring-stretch-seated.webp" */
  image?: string;

  /** Optional equipment (stable keys), empty array means "no special equipment" */
  equipment: EquipmentKey[];

  /** Tags are free-form for now (CZ), used for future search and grouping */
  tags: string[];
}
