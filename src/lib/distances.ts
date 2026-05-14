import type { UnitSystem } from "./conversion";

export interface Distance {
  readonly label: string;
  readonly km: number;
}

export const PRESET_DISTANCES: readonly Distance[] = [
  { label: "1K", km: 1 },
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "Half Marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

const SPECIAL_DISTANCES: readonly Distance[] = [
  { label: "Half Marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

/** Standard checkpoint distances highlighted in the split table. */
const HIGHLIGHT_KM = new Set([1, 5, 10, 15, 20, 25, 30, 35, 40]);
const HIGHLIGHT_MI = new Set([1, 5, 10, 15, 20, 25]);

const KM_PER_MILE = 1.60934;

export interface SplitRow {
  readonly label: string;
  readonly km: number;
  readonly highlight: boolean;
}

/** Generate split rows at every km (metric) or every mile (imperial),
 *  plus half marathon and marathon at their exact positions. */
export function generateSplitRows(unit: UnitSystem): readonly SplitRow[] {
  if (unit === "imperial") {
    return generateMileSplits(27);
  }
  return generateKmSplits(43);
}

function generateKmSplits(maxKm: number): SplitRow[] {
  const rows: SplitRow[] = [];

  for (let km = 1; km <= maxKm; km++) {
    insertSpecialsBefore(rows, km - 1, km);
    rows.push({ label: `${km} km`, km, highlight: HIGHLIGHT_KM.has(km) });
  }

  return rows;
}

function generateMileSplits(maxMiles: number): SplitRow[] {
  const rows: SplitRow[] = [];

  for (let mi = 1; mi <= maxMiles; mi++) {
    const km = mi * KM_PER_MILE;
    const prevKm = (mi - 1) * KM_PER_MILE;
    insertSpecialsBefore(rows, prevKm, km);
    rows.push({ label: `${mi} mi`, km, highlight: HIGHLIGHT_MI.has(mi) });
  }

  return rows;
}

function insertSpecialsBefore(rows: SplitRow[], afterKm: number, beforeKm: number): void {
  for (const special of SPECIAL_DISTANCES) {
    if (special.km > afterKm && special.km < beforeKm) {
      rows.push({ label: special.label, km: special.km, highlight: true });
    }
  }
}
