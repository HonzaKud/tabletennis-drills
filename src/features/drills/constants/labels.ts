/**
 * UI labels for drills domain
 *
 * Notes:
 * - Data uses stable English keys
 * - UI shows Czech human-readable labels
 * - This file is the single source of truth for UI naming
 */

import {
  AgeGroup,
  DrillCategory,
  EquipmentKey,
} from "../types/drill";

/* =========================
   Age groups
========================= */

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  U9: "U9",
  U11: "U11",
  U13: "U13",
  U15: "U15",
  U17: "U17",
  ADULT: "Dospělí",
};

/* =========================
   Drill categories
========================= */

export const DRILL_CATEGORY_LABELS: Record<DrillCategory, string> = {
  serve: "Servis",
  serve_combo: "Kombinace se servisem",
  no_serve_combo: "Kombinace bez servisu",
  regular_combo: "Pravidelné kombinace",
  irregular_combo: "Nepravidelné kombinace",
  mixed_regular_irregular: "Pravidelně–nepravidelné kombinace",
  warmup: "Rozcvička",
  stretching: "Strečink",
  multiball: "Zásobník (multiball)",
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
  multiball_basket: "Zásobník",
  stopwatch: "Stopky",
};
