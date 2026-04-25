import { useState } from "react";
import { UnitProvider } from "./context/UnitContext";
import { UnitToggle } from "./components/UnitToggle";
import { GoalTime } from "./features/goal-time/GoalTime";
import { PaceSplits } from "./features/pace-splits/PaceSplits";

type Tab = "goal" | "pace";

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

export function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("goal");

  return (
    <UnitProvider>
      <div className="min-h-dvh flex flex-col md:flex-row">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 pt-safe-top py-4 border-b border-border">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-accent">Pace</span>Calc
          </h1>
          <UnitToggle />
        </header>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 border-r border-border p-5 z-10">
          <h1 className="text-lg font-bold tracking-tight mb-8">
            <span className="text-accent">Pace</span>Calc
          </h1>
          <nav className="flex flex-col gap-1">
            <SidebarButton active={tab === "goal"} onClick={() => setTab("goal")} icon={goalIcon} label="Goal Time" />
            <SidebarButton active={tab === "pace"} onClick={() => setTab("pace")} icon={paceIcon} label="Pace" />
          </nav>
          <div className="mt-auto">
            <UnitToggle />
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 px-5 py-6 pb-24 md:pb-6 max-w-lg w-full mx-auto md:ml-[max(14rem,calc(50vw-16rem))]">
          {tab === "goal" ? <GoalTime /> : <PaceSplits />}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg/80 backdrop-blur-lg border-t border-border pb-safe-bottom">
          <div className="flex max-w-lg mx-auto">
            <TabButton active={tab === "goal"} onClick={() => setTab("goal")} icon={goalIcon} label="Goal Time" />
            <TabButton active={tab === "pace"} onClick={() => setTab("pace")} icon={paceIcon} label="Pace" />
          </div>
        </nav>
      </div>
    </UnitProvider>
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
      className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
        active ? "text-accent" : "text-text-secondary"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
