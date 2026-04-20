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

/** Standard race distances recognized by World Athletics + 1K as a baseline reference.
 *  Half Marathon and Marathon are highlighted via the special-distance insertion logic. */
const HIGHLIGHT_KM = new Set([1, 5, 10, 15, 25, 30]);

export interface SplitRow {
  readonly label: string;
  readonly km: number;
  readonly highlight: boolean;
}

/** Generate split rows: every km from 1–maxKm, plus half marathon and marathon at their exact positions */
export function generateSplitRows(maxKm: number = 43): readonly SplitRow[] {
  const rows: SplitRow[] = [];
  const specialDistances = [
    { label: "Half Marathon", km: 21.0975 },
    { label: "Marathon", km: 42.195 },
  ];

  for (let km = 1; km <= maxKm; km++) {
    // Insert special distances that fall before this km
    for (const special of specialDistances) {
      if (special.km > km - 1 && special.km < km) {
        rows.push({
          label: special.label,
          km: special.km,
          highlight: true,
        });
      }
    }

    rows.push({
      label: `${km} km`,
      km,
      highlight: HIGHLIGHT_KM.has(km),
    });
  }

  return rows;
}
