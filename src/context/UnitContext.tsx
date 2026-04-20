import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { UnitSystem } from "../lib/conversion";

interface UnitContextValue {
  unit: UnitSystem;
  toggle: () => void;
}

const UnitContext = createContext<UnitContextValue | null>(null);

const STORAGE_KEY = "paceup-unit";

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

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be used within UnitProvider");
  return ctx;
}
