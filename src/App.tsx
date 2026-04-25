import { useState } from "react";
import { UnitProvider } from "./context/UnitContext";
import { UnitToggle } from "./components/UnitToggle";
import { GoalTime } from "./features/goal-time/GoalTime";
import { PaceSplits } from "./features/pace-splits/PaceSplits";

type Tab = "goal" | "pace";

export function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("goal");

  return (
    <UnitProvider>
      <div className="min-h-dvh flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-safe-top py-4 border-b border-border">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-accent">Pace</span>Calc
          </h1>
          <UnitToggle />
        </header>

        {/* Content */}
        <main className="flex-1 px-5 py-6 pb-24 max-w-lg mx-auto w-full">
          {tab === "goal" ? <GoalTime /> : <PaceSplits />}
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-bg/80 backdrop-blur-lg border-t border-border pb-safe-bottom">
          <div className="flex max-w-lg mx-auto">
            <TabButton
              active={tab === "goal"}
              onClick={() => setTab("goal")}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              }
              label="Goal Time"
            />
            <TabButton
              active={tab === "pace"}
              onClick={() => setTab("pace")}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              label="Pace"
            />
          </div>
        </nav>
      </div>
    </UnitProvider>
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
