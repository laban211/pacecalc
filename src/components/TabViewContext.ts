import { createContext, type RefObject } from "react";

interface Tab {
  name: string;
  content: import("react").ReactNode;
}

export interface HandleTabOptions {
  resetScroll?: boolean;
}

export interface TabViewContextValue {
  handleTab: (name: string, options?: HandleTabOptions) => void;
  scrollRef: RefObject<HTMLElement | null>;
  tabs: Tab[];
  active: string;
  resetKeys: Record<string, number>;
}

export const TabViewContext = createContext<TabViewContextValue | null>(null);
