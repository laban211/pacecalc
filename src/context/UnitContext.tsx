import { useState, useEffect, type ReactNode } from "react";
import type { UnitSystem } from "../lib/conversion";
import { UnitContext } from "./UnitContextDef";

const STORAGE_KEY = "pacecalc-unit";

function getStoredUnit(): UnitSystem {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "imperial") return "imperial";
  } catch {
    // localStorage unavailable
  }
  return "metric";
}

export function UnitProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [unit, setUnit] = useState<UnitSystem>(getStoredUnit);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, unit);
    } catch {
      // ignore
    }
  }, [unit]);

  const toggle = (): void => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"));
  };

  return (
    <UnitContext.Provider value={{ unit, toggle }}>
      {children}
    </UnitContext.Provider>
  );
}
