/**
 * TableTennis Drills — Domain model (revized)
 *
 * Goals:
 * - Keep domain keys stable (ASCII, consistent casing) for portability across JSON/DB/APIs.
 * - Keep UI labels elsewhere (CZ dictionaries).
 * - Use const arrays + inferred union types for strong typing with minimal boilerplate.
 *
 * Revize (2026):
 * - ageGroup -> ageGroups (multi-select) with ["ALL"] sentinel
 * - category -> type (main drill type)
 * - add combination-specific dimensions:
 *   - comboPattern (REGULAR | IRREGULAR)
 *   - startModes (SERVE | FEED), where:
 *       ["SERVE"]         = start by serve required
 *       ["SERVE","FEED"]  = start is optional (serve OR feed/rozehra)
 * - add GAMES type (Hry / Soutěže)
 */

export const AGE_GROUPS = ["U9", "U11", "U13", "U15", "U17", "ADULT"] as const;
/** Age groups selectable in UI (filters). Does NOT include "ALL". */
export type AgeGroup = (typeof AGE_GROUPS)[number];

/**
 * Age group stored in data (JSON) as an array.
 * - ["ALL"] means "suitable for all age groups"
 * - otherwise an array of one or more specific groups, e.g. ["U9","U11"]
 */
export const AGE_GROUP_ALL = "ALL" as const;
export type AgeGroupAll = typeof AGE_GROUP_ALL;

export type DrillAgeGroups = readonly [AgeGroupAll] | readonly AgeGroup[];

/** Age group filter state in UI (single select). */
export type AgeGroupFilter = AgeGroup | AgeGroupAll;

export const DRILL_TYPES = [
  "SERVE",
  "COMBINATION",
  "MULTIBALL",
  "WARMUP",
  "STRETCHING",
  "GAMES",
] as const;
export type DrillType = (typeof DRILL_TYPES)[number];

/** Drill type filter state in UI (single select). */
export type DrillTypeFilter = DrillType | "ALL";

export const COMBO_PATTERNS = ["REGULAR", "IRREGULAR"] as const;
export type ComboPattern = (typeof COMBO_PATTERNS)[number];
export type ComboPatternFilter = ComboPattern | "ALL";

export const START_MODES = ["SERVE", "FEED"] as const;
export type StartMode = (typeof START_MODES)[number];
export type StartModeFilter = StartMode | "ALL";

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

export function isAgeGroupFilter(value: string | null | undefined): value is AgeGroupFilter {
  if (!value) return false;
  return value === AGE_GROUP_ALL || (AGE_GROUPS as readonly string[]).includes(value);
}

export function isDrillType(value: string | null | undefined): value is DrillType {
  if (!value) return false;
  return (DRILL_TYPES as readonly string[]).includes(value);
}

export function isDrillTypeFilter(value: string | null | undefined): value is DrillTypeFilter {
  if (!value) return false;
  return value === "ALL" || (DRILL_TYPES as readonly string[]).includes(value);
}

export function isComboPattern(value: string | null | undefined): value is ComboPattern {
  if (!value) return false;
  return (COMBO_PATTERNS as readonly string[]).includes(value);
}

export function isComboPatternFilter(value: string | null | undefined): value is ComboPatternFilter {
  if (!value) return false;
  return value === "ALL" || (COMBO_PATTERNS as readonly string[]).includes(value);
}

export function isStartMode(value: string | null | undefined): value is StartMode {
  if (!value) return false;
  return (START_MODES as readonly string[]).includes(value);
}

export function isStartModeFilter(value: string | null | undefined): value is StartModeFilter {
  if (!value) return false;
  return value === "ALL" || (START_MODES as readonly string[]).includes(value);
}

export function isEquipmentKey(value: string | null | undefined): value is EquipmentKey {
  if (!value) return false;
  return (EQUIPMENT_KEYS as readonly string[]).includes(value);
}

/** Shared fields for all drill types. */
export interface DrillBase {
  /** Stable, unique identifier (slug). Example: "serve-short-backspin-targets" */
  id: string;

  /** Czech title shown in UI */
  title: string;

  /** Czech description shown in UI */
  description: string;

  /** Main drill type used for filtering */
  type: DrillType;

  /**
   * Age groups stored in data.
   * - ["ALL"] means suitable for all
   * - otherwise one or more specific groups
   */
  ageGroups: DrillAgeGroups;

  /** Recommended duration in minutes */
  durationMinutes: number;

  /** Optional image path (served from /public). Example: "/assets/drills/stretching/hamstring.webp" */
  image?: string;

  /** Optional equipment (stable keys), empty array means "no special equipment" */
  equipment: EquipmentKey[];

  /** Tags are free-form for now (CZ), used for future search and grouping */
  tags: string[];
}

/** Additional fields required for combination drills. */
export interface CombinationDrill extends DrillBase {
  type: "COMBINATION";

  /** REGULAR = fixed pattern; IRREGULAR = decision / random target */
  comboPattern: ComboPattern;

  /**
   * Allowed start modes.
   * - ["SERVE"] means serve is required (3rd/5th ball context)
   * - ["SERVE","FEED"] means start is optional (serve OR feed/rozehra)
   */
  startModes: readonly StartMode[];
}

/** Any drill that is not a combination. */
export interface NonCombinationDrill extends DrillBase {
  type: Exclude<DrillType, "COMBINATION">;

  // Ensure these do not accidentally appear on non-combination drills.
  comboPattern?: never;
  startModes?: never;
}

/** Union type for all drills in the app. */
export type Drill = CombinationDrill | NonCombinationDrill;

/**
 * Helper: checks whether a drill is suitable for a given age group filter.
 * - If drill has ["ALL"], it matches any filter value.
 * - Otherwise, it must include the selected group.
 */
export function matchesAgeGroup(drill: Pick<DrillBase, "ageGroups">, filter: AgeGroupFilter): boolean {
  const ag = drill.ageGroups;
  if (ag.length === 1 && ag[0] === AGE_GROUP_ALL) return true;
  if (filter === AGE_GROUP_ALL) return true;
  return (ag as readonly AgeGroup[]).includes(filter);
}

/**
 * Helper: checks whether a drill matches combination-specific filters.
 * Call this only when drill.type === "COMBINATION".
 */
export function matchesCombinationFilters(
  drill: Pick<CombinationDrill, "comboPattern" | "startModes">,
  comboPattern: ComboPatternFilter,
  startMode: StartModeFilter,
): boolean {
  if (comboPattern !== "ALL" && drill.comboPattern !== comboPattern) return false;
  if (startMode !== "ALL" && !drill.startModes.includes(startMode)) return false;
  return true;
}
