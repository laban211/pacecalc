import { useState, useCallback, useEffect } from "react";
import { PRESET_DISTANCES, type Distance } from "../lib/distances";
import { useUnit } from "../context/UnitContext";
import { kmToMiles, milesToKm } from "../lib/conversion";

type MetricSub = "m" | "km";
type ImperialSub = "ft" | "mi";
type SubUnit = MetricSub | ImperialSub;

const KM_PER_FOOT = 0.0003048;

const METRIC_UNITS: MetricSub[] = ["km", "m"];
const IMPERIAL_UNITS: ImperialSub[] = ["mi", "ft"];

function toKm(value: number, subUnit: SubUnit): number {
  switch (subUnit) {
    case "km":
      return value;
    case "m":
      return value / 1000;
    case "mi":
      return milesToKm(value);
    case "ft":
      return value * KM_PER_FOOT;
  }
}

function makeLabel(value: number, subUnit: SubUnit): string {
  return `${value} ${subUnit}`;
}

interface DistancePickerProps {
  selected: Distance | null;
  onSelect: (distance: Distance | null) => void;
}

export function DistancePicker({
  selected,
  onSelect,
}: DistancePickerProps): React.JSX.Element {
  const { unit } = useUnit();
  const [customValue, setCustomValue] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [subUnit, setSubUnit] = useState<SubUnit>(unit === "metric" ? "km" : "mi");

  const availableUnits = unit === "metric" ? METRIC_UNITS : IMPERIAL_UNITS;

  useEffect(() => {
    setSubUnit(unit === "metric" ? "km" : "mi");
    // Only clear custom distance input; preset distances are unit-agnostic
    if (isCustom) {
      setCustomValue("");
      onSelect(null);
    }
  }, [unit]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycleSubUnit = useCallback((): void => {
    const units = unit === "metric" ? METRIC_UNITS : IMPERIAL_UNITS;
    const idx = (units as readonly string[]).indexOf(subUnit);
    const next = units[(idx + 1) % units.length];
    setSubUnit(next);

    if (customValue) {
      const num = parseFloat(customValue);
      if (!isNaN(num) && num > 0) {
        onSelect({ label: makeLabel(num, next), km: toKm(num, next) });
      }
    }
  }, [customValue, onSelect, subUnit, unit]);

  function handlePresetClick(distance: Distance): void {
    setIsCustom(false);
    setCustomValue("");
    onSelect(distance);
  }

  function handleCustomChange(raw: string): void {
    const cleaned = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
    setCustomValue(cleaned);
    setIsCustom(true);

    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) {
      onSelect(null);
      return;
    }

    const km = toKm(num, subUnit);
    onSelect({ label: makeLabel(num, subUnit), km });
  }

  function handleCustomFocus(): void {
    setIsCustom(true);
    if (!customValue) onSelect(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary font-medium">Distance</label>
      <div className="flex flex-wrap gap-2">
        {PRESET_DISTANCES.map((d) => {
          const isSelected = !isCustom && selected?.km === d.km;
          return (
            <button
              key={d.label}
              onClick={() => handlePresetClick(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-accent text-bg"
                  : "bg-surface border border-border text-text-secondary active:bg-surface-alt"
              }`}
            >
              {d.label}
              {unit === "imperial" && (
                <span className="text-xs opacity-60 ml-1">
                  ({kmToMiles(d.km).toFixed(2)} mi)
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-secondary uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Custom distance"
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={handleCustomFocus}
          className={`w-full text-base pr-14 ${
            isCustom && customValue ? "!border-accent" : ""
          }`}
        />
        <button
          type="button"
          onClick={cycleSubUnit}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-alt border border-border rounded-lg px-2.5 py-1 text-sm font-medium text-accent transition-colors active:bg-border"
          aria-label={`Switch distance unit, currently ${subUnit}`}
        >
          {subUnit}
        </button>
      </div>
      {availableUnits.length > 1 && isCustom && (
        <p className="text-xs text-text-secondary">
          Tap <span className="text-accent font-medium">{subUnit}</span> to switch
          to {availableUnits.find((u) => u !== subUnit)}
        </p>
      )}
    </div>
  );
}
