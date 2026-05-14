import { useContext } from "react";
import { TabViewContext, type HandleTabOptions } from "../components/TabViewContext";

/** Switch to a tab, or reset it if already active. Pass `{ resetScroll: true }` to scroll to top. */
export function useTabAction(): (name: string, options?: HandleTabOptions) => void {
  const ctx = useContext(TabViewContext);
  if (!ctx) throw new Error("useTabAction must be used within a TabView");
  return ctx.handleTab;
}
