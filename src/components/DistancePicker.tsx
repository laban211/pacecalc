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

function fromKm(km: number, subUnit: SubUnit): number {
  switch (subUnit) {
    case "km":
      return km;
    case "m":
      return km * 1000;
    case "mi":
      return kmToMiles(km);
    case "ft":
      return km / KM_PER_FOOT;
  }
}

function formatForInput(km: number, subUnit: SubUnit): string {
  const value = fromKm(km, subUnit);
  return parseFloat(value.toFixed(4)).toString();
}

function makeLabel(value: number, subUnit: SubUnit): string {
  return `${value} ${subUnit}`;
}

interface DistancePickerProps {
  selected: Distance | null;
  onSelect: (distance: Distance | null) => void;
}

export function DistancePicker({
  onSelect,
}: DistancePickerProps): React.JSX.Element {
  const { unit } = useUnit();
  const [customValue, setCustomValue] = useState("");
  const [subUnit, setSubUnit] = useState<SubUnit>(unit === "metric" ? "km" : "mi");
  const [activePreset, setActivePreset] = useState<Distance | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const newSubUnit = unit === "metric" ? "km" : "mi";
    setSubUnit(newSubUnit);
    if (activePreset) {
      // Re-format preset value in the new unit; distance stays the same
      setCustomValue(formatForInput(activePreset.km, newSubUnit));
    } else {
      setCustomValue("");
      onSelect(null);
    }
  }, [unit]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycleSubUnit = useCallback((): void => {
    const units = unit === "metric" ? METRIC_UNITS : IMPERIAL_UNITS;
    const idx = (units as readonly string[]).indexOf(subUnit);
    const next = units[(idx + 1) % units.length];
    setSubUnit(next);

    if (activePreset) {
      setCustomValue(formatForInput(activePreset.km, next));
    } else if (customValue) {
      const num = parseFloat(customValue);
      if (!isNaN(num) && num > 0) {
        const km = toKm(num, next);
        const matched = findMatchingPreset(km);
        setActivePreset(matched);
        onSelect(matched ?? { label: makeLabel(num, next), km });
      }
    }
  }, [customValue, onSelect, subUnit, unit, activePreset]);

  function handlePresetClick(distance: Distance): void {
    if (activePreset?.km === distance.km) {
      setActivePreset(null);
      setCustomValue("");
      onSelect(null);
      return;
    }

    setActivePreset(distance);
    setCustomValue(formatForInput(distance.km, subUnit));
    onSelect(distance);
  }

  function findMatchingPreset(km: number): Distance | null {
    const EPSILON = 0.001;
    return PRESET_DISTANCES.find((d) => Math.abs(d.km - km) < EPSILON) ?? null;
  }

  function handleCustomChange(raw: string): void {
    const cleaned = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");
    setCustomValue(cleaned);

    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) {
      setActivePreset(null);
      onSelect(null);
      return;
    }

    const km = toKm(num, subUnit);
    const matched = findMatchingPreset(km);
    setActivePreset(matched);
    onSelect(matched ?? { label: makeLabel(num, subUnit), km });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-text-secondary font-medium">Distance</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Enter distance"
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full text-base pr-14"
        />
        <button
          type="button"
          onClick={cycleSubUnit}
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-alt border border-border rounded-lg px-2.5 py-1 text-sm font-medium text-accent transition-colors active:bg-border"
          aria-label={`Switch distance unit, currently ${subUnit}`}
        >
          {subUnit}
        </button>
      </div>
      {isFocused && (
        <p className="text-xs text-text-secondary">
          Tap <button type="button" onClick={cycleSubUnit} onMouseDown={(e) => e.preventDefault()} className="text-accent font-medium">{subUnit}</button> to
          switch to {(unit === "metric" ? METRIC_UNITS : IMPERIAL_UNITS).find((u) => u !== subUnit)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {PRESET_DISTANCES.map((d) => {
          const isSelected = activePreset?.km === d.km;
          return (
            <button
              key={d.label}
              onClick={() => handlePresetClick(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                isSelected
                  ? "bg-accent text-bg border-accent"
                  : "bg-surface border-border text-text-secondary active:bg-surface-alt"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
