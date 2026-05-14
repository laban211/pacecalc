import { createContext } from "react";
import type { UnitSystem } from "../lib/conversion";

export interface UnitContextValue {
  unit: UnitSystem;
  toggle: () => void;
}

export const UnitContext = createContext<UnitContextValue | null>(null);
