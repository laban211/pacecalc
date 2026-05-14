import { useState } from "react";
import { PRESET_DISTANCES } from "../lib/distances";
import { riegelTime, formatTime, pacePerKm, pacePerMile, formatPace } from "../lib/conversion";
import { useUnit } from "../hooks/useUnit";

interface RaceEquivalentsProps {
  timeSeconds: number;
  distanceKm: number;
  distanceLabel: string;
}

const chevron = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export function RaceEquivalents({
  timeSeconds,
  distanceKm,
  distanceLabel,
}: RaceEquivalentsProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const { unit } = useUnit();

  const targets = PRESET_DISTANCES.filter((d) => d.km !== distanceKm);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 text-text-secondary text-sm py-2 px-4 active:text-text transition-colors"
      >
        <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          {chevron}
        </span>
        {isExpanded ? "Hide" : "Show"} race equivalents
      </button>

      {isExpanded && (
        <div className="animate-in fade-in bg-surface border border-border rounded-2xl p-4 mt-2">
          <p className="text-xs text-text-secondary mb-3">
            Based on your {distanceLabel} time, you could roughly expect:
          </p>

          <div className="flex flex-col gap-2.5">
            {targets.map((d) => {
              const predicted = riegelTime(timeSeconds, distanceKm, d.km);
              const pace =
                unit === "metric"
                  ? pacePerKm(predicted, d.km)
                  : pacePerMile(predicted, d.km);

              return (
                <div key={d.label} className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary font-medium">
                    {d.label}
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-text">
                      {formatTime(predicted)}
                    </span>
                    <span className="text-xs text-text-secondary ml-2">
                      {formatPace(pace)} /{unit === "metric" ? "km" : "mi"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-text-secondary/60 mt-3">
            Estimates use{" "}
            <a
              href="https://en.wikipedia.org/wiki/Peter_Riegel"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Riegel&apos;s formula
            </a>
            {" "}and assume similar training across distances.
          </p>
        </div>
      )}
    </div>
  );
}
