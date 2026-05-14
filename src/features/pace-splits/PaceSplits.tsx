import { useState, useMemo, useEffect } from "react";
import { PaceInput, type InputMode } from "../../components/PaceInput";
import { ResultCard } from "../../components/ResultCard";
import { useUnit } from "../../context/UnitContext";
import { usePaceNav } from "../../context/PaceNavContext";
import { generateSplitRows } from "../../lib/distances";
import {
  finishTime,
  formatTime,
  formatPace,
  paceKmToMile,
  paceMileToKm,
  paceToSpeedKmh,
  kmToMiles,
  floorToFixed,
} from "../../lib/conversion";

const OFFSET_OPTIONS = [5, 10, 15, 20, 30, 60] as const;

export function PaceSplits(): React.JSX.Element {
  const { unit } = useUnit();
  const { pacePerKm: navPacePerKm, navMode, setPaceNav } = usePaceNav();
  const [paceSeconds, setPaceSeconds] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("pace");
  const [offsetSeconds, setOffsetSeconds] = useState<number | null>(10);
  const [resetKey, setResetKey] = useState(0);
  const [initialSpeed, setInitialSpeed] = useState<number | null>(null);

  // When pace is set from Goal Time tab, apply it
  useEffect(() => {
    if (navPacePerKm != null && navPacePerKm > 0) {
      const paceInUserUnit = unit === "imperial" ? paceKmToMile(navPacePerKm) : navPacePerKm;
      setPaceSeconds(paceInUserUnit);
      setInputMode(navMode);
      if (navMode === "speed") {
        const speedKmh = paceToSpeedKmh(navPacePerKm);
        setInitialSpeed(unit === "imperial" ? kmToMiles(speedKmh) : speedKmh);
      } else {
        setInitialSpeed(null);
      }
      setPaceNav(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire when a navigation event sets a new pace; other deps are stable setters or handled by separate effects
  }, [navPacePerKm]);

  const hasPace = paceSeconds !== null && paceSeconds > 0;

  // PaceInput returns pace in the user's unit (sec/km or sec/mi)
  // Convert to sec/km for internal calculations
  const pacePerKm: number | null = hasPace
    ? unit === "imperial"
      ? paceMileToKm(paceSeconds!)
      : paceSeconds
    : null;

  const rows = useMemo(() => generateSplitRows(43), []);

  const offsetLabel = unit === "metric" ? "/km" : "/mi";
  const offsetLabel2 =
    offsetSeconds !== null
      ? `${offsetSeconds >= 60 ? `${offsetSeconds / 60}min` : `${offsetSeconds}s`}${offsetLabel}`
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Pace &rarr; Finish Times</h2>
        <p className="text-text-secondary text-sm">
          See what you can run at this pace
        </p>
      </div>

      <PaceInput
        key={resetKey}
        unit={unit}
        initialPace={paceSeconds}
        initialSpeed={initialSpeed}
        onPaceChange={(sec, mode) => {
          setPaceSeconds(sec);
          setInputMode(mode);
        }}
      />

      {hasPace && pacePerKm !== null && pacePerKm > 0 && (
        <div className="flex flex-col gap-4">
          {/* Summary cards — highlight whichever the user entered */}
          <div className="flex gap-3">
            <ResultCard
              label="Pace"
              value={`${formatPace(
                unit === "metric" ? pacePerKm : paceKmToMile(pacePerKm)
              )} /${unit === "metric" ? "km" : "mi"}`}
              subValue={`${formatPace(
                unit === "metric" ? paceKmToMile(pacePerKm) : pacePerKm
              )} /${unit === "metric" ? "mi" : "km"}`}
              highlight={inputMode === "pace"}
            />
            <ResultCard
              label="Speed"
              value={
                unit === "metric"
                  ? `${floorToFixed(paceToSpeedKmh(pacePerKm), 1)} km/h`
                  : `${floorToFixed(kmToMiles(paceToSpeedKmh(pacePerKm)), 1)} mph`
              }
              subValue={
                unit === "metric"
                  ? `${floorToFixed(kmToMiles(paceToSpeedKmh(pacePerKm)), 1)} mph`
                  : `${floorToFixed(paceToSpeedKmh(pacePerKm), 1)} km/h`
              }
              highlight={inputMode === "speed"}
            />
          </div>

          {/* Offset picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wider">
              Compare &plusmn; offset
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOffsetSeconds(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  offsetSeconds === null
                    ? "bg-accent text-bg"
                    : "bg-surface border border-border text-text-secondary active:bg-surface-alt"
                }`}
              >
                None
              </button>
              {OFFSET_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => setOffsetSeconds(o)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    offsetSeconds === o
                      ? "bg-accent text-bg"
                      : "bg-surface border border-border text-text-secondary active:bg-surface-alt"
                  }`}
                >
                  {o >= 60 ? `${o / 60}min` : `${o}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Split table */}
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-text-secondary text-xs uppercase tracking-wider">
                  <th className="text-left py-2 pr-2 font-medium sticky left-0 bg-bg">
                    Dist
                  </th>
                  {offsetSeconds !== null && (
                    <th className="text-right py-2 px-2 font-medium text-sky-300/70 whitespace-nowrap">
                      -{offsetLabel2}
                    </th>
                  )}
                  <th className="text-right py-2 px-2 font-medium text-accent whitespace-nowrap">
                    Time
                  </th>
                  {offsetSeconds !== null && (
                    <th className="text-right py-2 pl-2 font-medium text-rose-300/70 whitespace-nowrap">
                      +{offsetLabel2}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const mainTime = finishTime(pacePerKm, row.km);

                  let fasterTime: number | null = null;
                  let slowerTime: number | null = null;
                  if (offsetSeconds !== null) {
                    const fasterPace = pacePerKm - offsetSeconds;
                    fasterTime = fasterPace > 0 ? finishTime(fasterPace, row.km) : null;
                    slowerTime = finishTime(pacePerKm + offsetSeconds, row.km);
                  }

                  const zebra = !row.highlight && i % 2 === 1;

                  return (
                    <tr
                      key={row.km}
                      className={
                        row.highlight
                          ? "bg-surface/60"
                          : zebra
                            ? "bg-surface"
                            : ""
                      }
                    >
                      <td
                        className={`py-2 pr-2 sticky left-0 whitespace-nowrap ${
                          row.highlight
                            ? "font-bold text-text bg-surface/60"
                            : zebra
                              ? "text-text-secondary bg-surface"
                              : "text-text-secondary bg-bg"
                        }`}
                      >
                        {row.label}
                      </td>
                      {offsetSeconds !== null && (
                        <td className="text-right py-2 px-2 font-mono text-sky-300/70">
                          {fasterTime !== null ? formatTime(fasterTime) : "—"}
                        </td>
                      )}
                      <td
                        className={`text-right py-2 px-2 font-mono ${
                          row.highlight
                            ? "text-accent font-bold"
                            : "text-text font-semibold"
                        }`}
                      >
                        {formatTime(mainTime)}
                      </td>
                      {offsetSeconds !== null && (
                        <td className="text-right py-2 pl-2 font-mono text-rose-300/70">
                          {slowerTime !== null ? formatTime(slowerTime) : "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => { setPaceSeconds(null); setResetKey((k) => k + 1); }}
              className="text-text-secondary text-sm py-2 px-4 active:text-text transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
