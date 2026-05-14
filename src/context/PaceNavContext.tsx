import { useState, type ReactNode } from "react";
import { PaceNavContext } from "./PaceNavContextDef";

type NavMode = "pace" | "speed";

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
