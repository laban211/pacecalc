import { useState, useRef, useEffect } from "react";
import { parseTime, parseTimeDetailed, describeTime, type ParseMode } from "../lib/conversion";

interface TimeInputProps {
  value: string;
  onChange: (value: string, seconds: number | null) => void;
  placeholder?: string;
  label: string;
  mode?: ParseMode;
}

export function TimeInput({
  value,
  onChange,
  placeholder,
  label,
  mode = "duration",
}: TimeInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultPlaceholder = mode === "pace" ? "e.g. 6.30 or 6:30" : "e.g. 1.30 or 1:30:00";
  const errorHint =
    mode === "pace"
      ? "Try 6.30 (6m 30s), 6:30, or 5 (5m)"
      : "Try 1.30 (1h 30m), 1:30:00, or 25 (25m)";

  const parsed = parseTime(value, mode);
  const hasInput = value.trim().length > 0;
  const isInvalid = hasInput && parsed === null;
  const interpretation = hasInput && !isInvalid
    ? (() => { const p = parseTimeDetailed(value, mode); return p ? describeTime(p) : null; })()
    : null;

  useEffect(() => {
    if (inputRef.current && isFocused) {
      const len = value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [value, isFocused]);

  function handleChange(raw: string): void {
    const cleaned = raw.replace(/[^\d:.]/g, "");
    onChange(cleaned, parseTime(cleaned, mode));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-text-secondary font-medium">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder ?? defaultPlaceholder}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full font-mono text-xl tracking-wider ${
            isInvalid ? "!border-red-500 !ring-red-500/30" : ""
          }`}
        />
        {isInvalid && (
          <p className="text-red-400 text-xs mt-1">{errorHint}</p>
        )}
        {interpretation && (
          <p className="text-accent/70 text-xs mt-1">
            = {interpretation}
          </p>
        )}
      </div>
    </div>
  );
}
