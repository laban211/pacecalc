import { useState, useRef, useEffect } from "react";
import {
  parseTime,
  parseTimeDetailed,
  describeTime,
  speedKmhToPace,
  paceKmToMile,
  type UnitSystem,
} from "../lib/conversion";

type InputMode = "pace" | "speed";

export type { InputMode };

const KM_PER_MILE = 1.60934;

interface PaceInputProps {
  /**
   * Callback with pace in the user's active unit system:
   * - metric: seconds per km
   * - imperial: seconds per mile
   */
  onPaceChange: (paceSeconds: number | null, mode: InputMode) => void;
  unit: UnitSystem;
  /** Pre-fill with a pace value (seconds in user's unit). */
  initialPace?: number | null;
}

function formatPaceValue(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PaceInput({ onPaceChange, unit, initialPace }: PaceInputProps): React.JSX.Element {
  const [inputMode, setInputMode] = useState<InputMode>("pace");
  const [value, setValue] = useState(() =>
    initialPace != null && initialPace > 0 ? formatPaceValue(initialPace) : ""
  );

  // Sync value when initialPace changes from outside (e.g. navigating from Goal Time)
  const [prevInitialPace, setPrevInitialPace] = useState(initialPace);
  if (initialPace !== prevInitialPace) {
    setPrevInitialPace(initialPace);
    if (initialPace != null && initialPace > 0) {
      setValue(formatPaceValue(initialPace));
    }
  }
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const paceUnitLabel = unit === "metric" ? "min/km" : "min/mi";
  const speedUnitLabel = unit === "metric" ? "km/h" : "mph";

  // Reset input when global unit system changes to avoid stale values
  // being silently reinterpreted in the wrong unit
  useEffect(() => {
    setValue("");
    onPaceChange(null, inputMode);
  }, [unit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep cursor at end after value transformation (e.g. comma → dot).
  // iOS Safari scrolls the page when setSelectionRange is called on a
  // focused input, so we save and restore scroll position as a workaround.
  // See: https://bugs.webkit.org/show_bug.cgi?id=224425
  useEffect(() => {
    const el = inputRef.current;
    if (el && isFocused) {
      const len = value.length;
      const scrollY = window.scrollY;
      el.setSelectionRange(len, len);
      if (window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    }
  }, [value, isFocused]);

  function computePace(raw: string, mode: InputMode): number | null {
    if (!raw.trim()) return null;

    if (mode === "speed") {
      const speed = parseFloat(raw);
      if (isNaN(speed) || speed <= 0) return null;
      // Convert to km/h regardless of unit system, then to sec/km
      const speedKmh = unit === "imperial" ? speed * KM_PER_MILE : speed;
      const paceSecPerKm = speedKmhToPace(speedKmh);
      // Return in the user's unit system
      return unit === "imperial" ? paceKmToMile(paceSecPerKm) : paceSecPerKm;
    }

    // Pace mode: parse as mm:ss — result is already in the user's unit
    return parseTime(raw, "pace");
  }

  function handleChange(raw: string): void {
    const normalized = raw.replace(/,/g, ".");
    const cleaned =
      inputMode === "speed"
        ? normalized.replace(/[^\d.]/g, "")
        : normalized.replace(/[^\d:.]/g, "");
    setValue(cleaned);
    onPaceChange(computePace(cleaned, inputMode), inputMode);
  }

  function handleModeSwitch(): void {
    const next: InputMode = inputMode === "pace" ? "speed" : "pace";
    setValue("");
    onPaceChange(null, next);
    setInputMode(next);
  }

  // Feedback text
  const hasInput = value.trim().length > 0;
  let interpretation: string | null = null;
  let isInvalid = false;

  if (hasInput) {
    if (inputMode === "pace") {
      const sec = parseTime(value, "pace");
      isInvalid = sec === null;
      if (!isInvalid) {
        const parsed = parseTimeDetailed(value, "pace");
        interpretation = parsed ? describeTime(parsed) : null;
      }
    } else {
      const speed = parseFloat(value);
      isInvalid = isNaN(speed) || speed <= 0;
      if (!isInvalid) {
        interpretation = `${speed} ${speedUnitLabel}`;
      }
    }
  }

  const placeholder =
    inputMode === "pace" ? "e.g. 6.30 or 6:30" : "e.g. 9.5";

  const errorHint =
    inputMode === "pace"
      ? "Try 6.30 (6m 30s), 6:30, or 5 (5m)"
      : "Enter speed as a number (e.g. 9.5)";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-text-secondary font-medium">
        {inputMode === "pace" ? `Pace (${paceUnitLabel})` : `Speed (${speedUnitLabel})`}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full font-mono text-xl tracking-wider pr-20 ${
            isInvalid ? "!border-red-500 !ring-red-500/30" : ""
          }`}
        />
        <button
          type="button"
          onClick={handleModeSwitch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-alt border border-border rounded-lg px-2.5 py-1 text-xs font-medium text-accent transition-colors active:bg-border whitespace-nowrap"
          aria-label={`Switch to ${inputMode === "pace" ? "speed" : "pace"} input`}
        >
          {inputMode === "pace" ? paceUnitLabel : speedUnitLabel}
        </button>
      </div>
      {isInvalid && hasInput && (
        <p className="text-red-400 text-xs">{errorHint}</p>
      )}
      {interpretation && !isInvalid && (
        <p className="text-accent/70 text-xs">= {interpretation}</p>
      )}
    </div>
  );
}
