import { useContext } from "react";
import { PaceNavContext, type PaceNavState } from "../context/PaceNavContextDef";

export function usePaceNav(): PaceNavState {
  const ctx = useContext(PaceNavContext);
  if (!ctx) throw new Error("usePaceNav must be used within a PaceNavProvider");
  return ctx;
}
