import { useState, useRef, useCallback, createContext, useContext, type ReactNode, type RefObject } from "react";

interface Tab {
  name: string;
  content: ReactNode;
}

interface HandleTabOptions {
  resetScroll?: boolean;
}

interface TabViewContextValue {
  handleTab: (name: string, options?: HandleTabOptions) => void;
  scrollRef: RefObject<HTMLElement | null>;
  tabs: Tab[];
  active: string;
  resetKeys: Record<string, number>;
}

const TabViewContext = createContext<TabViewContextValue | null>(null);

/** Switch to a tab, or reset it if already active. Pass `{ resetScroll: true }` to scroll to top. */
export function useTabAction(): (name: string, options?: HandleTabOptions) => void {
  const ctx = useContext(TabViewContext);
  if (!ctx) throw new Error("useTabAction must be used within a TabView");
  return ctx.handleTab;
}

interface TabViewProps {
  tabs: Tab[];
  active: string;
  onTab: (name: string) => void;
  children: ReactNode;
}

/**
 * Provider that manages tab state: keeps all screens mounted (preserving state),
 * saves/restores scroll position per tab, and resets a screen when its tab is
 * tapped while already active.
 *
 * Use `<TabViewScreens>` to render the actual screen content, and `useTabAction()`
 * in nav buttons to switch/reset tabs.
 */
export function TabView({ tabs, active, onTab, children }: TabViewProps): React.JSX.Element {
  const [resetKeys, setResetKeys] = useState<Record<string, number>>(() =>
    Object.fromEntries(tabs.map((t) => [t.name, 0]))
  );
  const scrollRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef<Record<string, number>>({});

  const handleTab = useCallback((name: string, options?: HandleTabOptions) => {
    if (name === active) {
      setResetKeys((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else {
      if (scrollRef.current) scrollPositions.current[active] = scrollRef.current.scrollTop;
      if (options?.resetScroll) scrollPositions.current[name] = 0;
      onTab(name);
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollPositions.current[name] ?? 0;
      });
    }
  }, [active, onTab]);

  return (
    <TabViewContext.Provider value={{ handleTab, scrollRef, tabs, active, resetKeys }}>
      {children}
    </TabViewContext.Provider>
  );
}

/** Renders the tab screens. Place this where the scrollable content area should be. */
export function TabViewScreens({ className }: { className?: string }): React.JSX.Element {
  const ctx = useContext(TabViewContext);
  if (!ctx) throw new Error("TabViewScreens must be used within a TabView");
  const { scrollRef, tabs, active, resetKeys } = ctx;

  return (
    <main ref={scrollRef} className={className}>
      {tabs.map((tab) => (
        <div key={tab.name} className={tab.name === active ? undefined : "hidden"}>
          <TabScreen key={resetKeys[tab.name] ?? 0}>{tab.content}</TabScreen>
        </div>
      ))}
    </main>
  );
}

function TabScreen({ children }: { children: ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
