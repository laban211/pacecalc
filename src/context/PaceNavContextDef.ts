import { createContext } from "react";

type NavMode = "pace" | "speed";

export interface PaceNavState {
  pacePerKm: number | null;
  navMode: NavMode;
  setPaceNav: (pacePerKm: number | null, mode?: NavMode) => void;
}

export const PaceNavContext = createContext<PaceNavState | null>(null);
