/**
 * UI labels for drills domain
 *
 * Principles:
 * - Domain uses stable English keys (ASCII, enums/unions).
 * - UI displays Czech, human-readable labels.
 * - This file is the single source of truth for UI naming.
 *
 * IMPORTANT:
 * - Do NOT use labels for logic.
 * - Logic must always rely on domain keys from types/drill.ts.
 */

import { AgeGroup, DrillType, ComboPattern, StartMode, EquipmentKey } from "../types/drill";

/* =========================
   Age groups (UI)
========================= */

/**
 * Labels for selectable age groups in UI.
 * Note: "ALL" is handled in filter UI separately.
 */
export const AGE_GROUP_LABELS: Record<AgeGroup | "ALL", string> = {
  ALL: "Všechny",
  U9: "U9",
  U11: "U11",
  U13: "U13",
  U15: "U15",
  U17: "U17",
  ADULT: "Dospělí",
};

/* =========================
   Drill types (main filter)
========================= */

export const DRILL_TYPE_LABELS: Record<DrillType | "ALL", string> = {
  ALL: "Všechny",
  SERVE: "Servis",
  COMBINATION: "Kombinace",
  MULTIBALL: "Zásobník (multiball)",
  WARMUP: "Rozcvička",
  STRETCHING: "Strečink",
  GAMES: "Hry / Soutěže",
};

/* =========================
   Combination-specific filters
========================= */

/**
 * Structure of combination (pattern).
 * Shown only when type === "COMBINATION".
 */
export const COMBO_PATTERN_LABELS: Record<ComboPattern | "ALL", string> = {
  ALL: "Všechny",
  REGULAR: "Pravidelná kombinace",
  IRREGULAR: "Nepravidelná kombinace",
};

/**
 * Start mode of a drill.
 * Shown only when type === "COMBINATION".
 *
 * Meaning:
 * - SERVE  = start by serve (3rd/5th ball context)
 * - FEED   = start by feed / free rally (without serve)
 */
export const START_MODE_LABELS: Record<StartMode | "ALL", string> = {
  ALL: "Všechny",
  SERVE: "Se servisem",
  FEED: "Bez servisu",
};

/* =========================
   Equipment
========================= */

export const EQUIPMENT_LABELS: Record<EquipmentKey, string> = {
  cones: "Kloboučky",
  barriers: "Ohrádky",
  ladder: "Koordinační žebřík",
  jump_rope: "Švihadlo",
  robot: "Robot",
  multiball_basket: "Zásobník na míčky",
  stopwatch: "Stopky",
};
