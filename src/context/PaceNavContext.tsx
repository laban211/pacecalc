import { createContext, useContext, useState, type ReactNode } from "react";

type NavMode = "pace" | "speed";

interface PaceNavState {
  pacePerKm: number | null;
  navMode: NavMode;
  setPaceNav: (pacePerKm: number | null, mode?: NavMode) => void;
}

const PaceNavContext = createContext<PaceNavState | null>(null);

export function PaceNavProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [pacePerKm, setPacePerKm] = useState<number | null>(null);
  const [navMode, setNavMode] = useState<NavMode>("pace");

  function setPaceNav(value: number | null, mode: NavMode = "pace"): void {
    setPacePerKm(value);
    setNavMode(mode);
  }

  return (
    <PaceNavContext.Provider value={{ pacePerKm, navMode, setPaceNav }}>
      {children}
    </PaceNavContext.Provider>
  );
}

export function usePaceNav(): PaceNavState {
  const ctx = useContext(PaceNavContext);
  if (!ctx) throw new Error("usePaceNav must be used within a PaceNavProvider");
  return ctx;
}
