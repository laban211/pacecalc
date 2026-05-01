import { createContext, useContext, useState, type ReactNode } from "react";

interface PaceNavState {
  pacePerKm: number | null;
  setPacePerKm: (value: number | null) => void;
}

const PaceNavContext = createContext<PaceNavState | null>(null);

export function PaceNavProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [pacePerKm, setPacePerKm] = useState<number | null>(null);
  return (
    <PaceNavContext.Provider value={{ pacePerKm, setPacePerKm }}>
      {children}
    </PaceNavContext.Provider>
  );
}

export function usePaceNav(): PaceNavState {
  const ctx = useContext(PaceNavContext);
  if (!ctx) throw new Error("usePaceNav must be used within a PaceNavProvider");
  return ctx;
}
