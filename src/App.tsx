import { useState } from "react";
import { UnitProvider } from "./context/UnitContext";
import { PaceNavProvider } from "./context/PaceNavContext";
import { UnitToggle } from "./components/UnitToggle";
import { TabView, TabViewScreens, useTabAction } from "./components/TabView";
import { GoalTime } from "./features/goal-time/GoalTime";
import { PaceSplits } from "./features/pace-splits/PaceSplits";

type Tab = "goal" | "pace";

const logoMark = (
  <svg className="w-6 h-6" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle cx="100" cy="114" r="58" stroke="currentColor" strokeWidth="6" />
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <line x1="100" y1="60" x2="100" y2="68" />
      <line x1="154" y1="114" x2="146" y2="114" />
      <line x1="100" y1="168" x2="100" y2="160" />
      <line x1="46" y1="114" x2="54" y2="114" />
    </g>
    <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.55">
      <line x1="127" y1="68" x2="125" y2="73" />
      <line x1="146" y1="86" x2="142" y2="89" />
      <line x1="146" y1="142" x2="142" y2="139" />
      <line x1="127" y1="160" x2="125" y2="155" />
      <line x1="73" y1="160" x2="75" y2="155" />
      <line x1="54" y1="142" x2="58" y2="139" />
      <line x1="54" y1="86" x2="58" y2="89" />
      <line x1="73" y1="68" x2="75" y2="73" />
    </g>
    <line x1="100" y1="114" x2="134" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <circle cx="100" cy="114" r="5" fill="currentColor" />
    <rect x="92" y="36" width="16" height="14" rx="3" fill="currentColor" />
    <rect x="84" y="48" width="32" height="8" rx="3" fill="currentColor" />
    <rect x="146" y="58" width="10" height="8" rx="2" fill="currentColor" transform="rotate(45 151 62)" />
  </svg>
);

const goalIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const paceIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TAB_SCREENS = [
  { name: "goal", content: <GoalTime /> },
  { name: "pace", content: <PaceSplits /> },
];

export function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("goal");

  return (
    <UnitProvider>
      <PaceNavProvider>
      <TabView tabs={TAB_SCREENS} active={tab} onTab={(name) => setTab(name as Tab)}>
        <div className="h-full flex flex-col md:flex-row overflow-hidden">
          {/* Mobile header */}
          <header className="md:hidden shrink-0 flex items-center justify-between px-5 pt-safe-top pb-4 border-b border-border">
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span className="text-accent">{logoMark}</span>
              <span><span className="text-accent">Pace</span>Calc</span>
            </h1>
            <UnitToggle />
          </header>

          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 border-r border-border pt-safe-top px-5 pb-5 z-10">
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-8">
              <span className="text-accent">{logoMark}</span>
              <span><span className="text-accent">Pace</span>Calc</span>
            </h1>
            <SidebarNav active={tab} />
            <div className="mt-auto">
              <UnitToggle />
            </div>
          </aside>

          {/* Content */}
          <TabViewScreens className="flex-1 overflow-y-auto px-5 py-6 max-w-lg w-full mx-auto md:ml-[max(14rem,calc(50vw-16rem))]" />

          {/* Mobile bottom tab bar */}
          <MobileNav active={tab} />
        </div>
      </TabView>
      </PaceNavProvider>
    </UnitProvider>
  );
}

function SidebarNav({ active }: { active: Tab }): React.JSX.Element {
  const handleTab = useTabAction();
  return (
    <nav className="flex flex-col gap-1">
      <SidebarButton active={active === "goal"} onClick={() => handleTab("goal")} icon={goalIcon} label="Goal Time" />
      <SidebarButton active={active === "pace"} onClick={() => handleTab("pace")} icon={paceIcon} label="Pace" />
    </nav>
  );
}

function MobileNav({ active }: { active: Tab }): React.JSX.Element {
  const handleTab = useTabAction();
  return (
    <nav className="md:hidden shrink-0 bg-bg/80 backdrop-blur-lg border-t border-border">
      <div className="flex max-w-lg mx-auto">
        <TabButton active={active === "goal"} onClick={() => handleTab("goal")} icon={goalIcon} label="Goal Time" />
        <TabButton active={active === "pace"} onClick={() => handleTab("pace")} icon={paceIcon} label="Pace" />
      </div>
    </nav>
  );
}

function SidebarButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-surface-alt text-accent"
          : "text-text-secondary hover:bg-surface hover:text-text"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-1 transition-colors ${
        active ? "text-accent" : "text-text-secondary"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
