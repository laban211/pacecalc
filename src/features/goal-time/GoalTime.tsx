import { useState } from "react";
import { TimeInput } from "../../components/TimeInput";
import { DistancePicker } from "../../components/DistancePicker";
import { ResultCard } from "../../components/ResultCard";
import { useUnit } from "../../context/UnitContext";
import type { Distance } from "../../lib/distances";
import {
  pacePerKm,
  pacePerMile,
  speedKmh,
  speedMph,
  formatPace,
  floorToFixed,
} from "../../lib/conversion";

export function GoalTime(): React.JSX.Element {
  const { unit } = useUnit();
  const [distance, setDistance] = useState<Distance | null>(null);
  const [timeStr, setTimeStr] = useState("");
  const [timeSeconds, setTimeSeconds] = useState<number | null>(null);

  const hasResult = distance !== null && timeSeconds !== null && timeSeconds > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Goal Time</h2>
        <p className="text-text-secondary text-sm">
          What pace do you need to hit your goal?
        </p>
      </div>

      <DistancePicker selected={distance} onSelect={setDistance} />

      <TimeInput
        label="Goal time"
        value={timeStr}
        onChange={(val, sec) => {
          setTimeStr(val);
          setTimeSeconds(sec);
        }}
      />

      {hasResult && (
        <div className="flex flex-col gap-3 animate-in fade-in">
          <ResultCard
            label={unit === "metric" ? "Pace (min/km)" : "Pace (min/mi)"}
            value={
              unit === "metric"
                ? formatPace(pacePerKm(timeSeconds, distance.km))
                : formatPace(pacePerMile(timeSeconds, distance.km))
            }
            subValue={
              unit === "metric"
                ? `${formatPace(pacePerMile(timeSeconds, distance.km))} /mi`
                : `${formatPace(pacePerKm(timeSeconds, distance.km))} /km`
            }
            highlight
          />
          <ResultCard
            label={unit === "metric" ? "Speed (km/h)" : "Speed (mph)"}
            value={
              unit === "metric"
                ? `${floorToFixed(speedKmh(timeSeconds, distance.km), 2)} km/h`
                : `${floorToFixed(speedMph(timeSeconds, distance.km), 2)} mph`
            }
            subValue={
              unit === "metric"
                ? `${floorToFixed(speedMph(timeSeconds, distance.km), 2)} mph`
                : `${floorToFixed(speedKmh(timeSeconds, distance.km), 2)} km/h`
            }
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => { setDistance(null); setTimeStr(""); setTimeSeconds(null); }}
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
