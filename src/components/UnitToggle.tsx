import { useUnit } from "../context/UnitContext";

export function UnitToggle(): React.JSX.Element {
  const { unit, toggle } = useUnit();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 md:gap-0 md:w-full bg-surface border border-border rounded-full px-4 md:px-0 py-2 text-sm font-medium transition-colors active:bg-surface-alt"
      aria-label={`Switch to ${unit === "metric" ? "imperial" : "metric"} units`}
    >
      <span className={`md:flex-1 md:text-center ${unit === "metric" ? "text-accent" : "text-text-secondary"}`}>
        km
      </span>
      <span className="text-border md:self-center">/</span>
      <span className={`md:flex-1 md:text-center ${unit === "imperial" ? "text-accent" : "text-text-secondary"}`}>
        mi
      </span>
    </button>
  );
}
