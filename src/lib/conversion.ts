export type UnitSystem = "metric" | "imperial";

const KM_PER_MILE = 1.60934;

// --- Unit conversions ---

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

// --- Time helpers ---

export interface ParsedTime {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Parse mode determines how ambiguous inputs are interpreted:
 *   "duration" — for goal/finish times (hours-first)
 *     "1:40"  → 1h 40m     "1.30" → 1h 30m     "90" → 90m
 *   "pace" — for per-km/per-mi pace (minutes-first)
 *     "4:40"  → 4m 40s     "4.40" → 4m 40s      "5"  → 5m
 *
 * Three-part colon format (h:mm:ss or 0:mm:ss) is unambiguous in both modes.
 */
export type ParseMode = "duration" | "pace";

export function parseTime(input: string, mode: ParseMode = "duration"): number | null {
  const result = parseTimeDetailed(input, mode);
  return result?.totalSeconds ?? null;
}

export function parseTimeDetailed(input: string, mode: ParseMode = "duration"): ParsedTime | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Dot format
  if (trimmed.includes(".")) {
    const dotParts = trimmed.split(".");
    if (dotParts.length !== 2) return null;
    const major = parseInt(dotParts[0], 10);
    const rawMinor = dotParts[1];
    if (rawMinor.length > 2) return null;
    const minor = parseInt(rawMinor.length === 1 ? rawMinor + "0" : rawMinor, 10);
    if (isNaN(major) || isNaN(minor) || major < 0 || minor < 0 || minor >= 60) return null;

    if (mode === "pace") {
      // "4.40" → 4m 40s
      const totalSeconds = major * 60 + minor;
      return { totalSeconds, hours: 0, minutes: major, seconds: minor };
    }
    // duration: "1.30" → 1h 30m
    const totalSeconds = major * 3600 + minor * 60;
    return { totalSeconds, hours: major, minutes: minor, seconds: 0 };
  }

  // Colon format
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map(Number);
    if (parts.some((p) => isNaN(p) || p < 0)) return null;

    if (parts.length === 3) {
      const [h, m, s] = parts;
      if (m >= 60 || s >= 60) return null;
      const totalSeconds = h * 3600 + m * 60 + s;
      return { totalSeconds, hours: h, minutes: m, seconds: s };
    }

    if (parts.length === 2) {
      const [a, b] = parts;
      if (b >= 60) return null;

      if (mode === "pace") {
        // "4:40" → 4m 40s
        const totalSeconds = a * 60 + b;
        return { totalSeconds, hours: 0, minutes: a, seconds: b };
      }
      // duration: "1:40" → 1h 40m
      const totalSeconds = a * 3600 + b * 60;
      return { totalSeconds, hours: a, minutes: b, seconds: 0 };
    }

    return null;
  }

  // Plain number: treat as minutes
  const mins = parseInt(trimmed, 10);
  if (isNaN(mins) || mins < 0) return null;
  const totalSeconds = mins * 60;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return { totalSeconds, hours, minutes, seconds: 0 };
}

/** Format total seconds into "h:mm:ss" or "m:ss" */
export function formatTime(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  if (h > 0) {
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

/** Format pace as "m:ss" per unit (always shows minutes, even if 0) */
export function formatPace(secondsPerUnit: number): string {
  const rounded = Math.round(secondsPerUnit);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Describe a parsed time as a human-readable string like "1h 30m" or "4m 40s" */
export function describeTime(parsed: ParsedTime): string | null {
  if (parsed.totalSeconds === 0) return null;
  const parts: string[] = [];
  if (parsed.hours > 0) parts.push(`${parsed.hours}h`);
  if (parsed.minutes > 0) parts.push(`${parsed.minutes}m`);
  if (parsed.seconds > 0) parts.push(`${parsed.seconds}s`);
  return parts.length > 0 ? parts.join(" ") : null;
}

// --- Pace & speed calculations ---

/** Given total seconds and distance in km, get pace in seconds per km */
export function pacePerKm(totalSeconds: number, distanceKm: number): number {
  return totalSeconds / distanceKm;
}

/** Given total seconds and distance in km, get pace in seconds per mile */
export function pacePerMile(totalSeconds: number, distanceKm: number): number {
  return totalSeconds / kmToMiles(distanceKm);
}

/** Given total seconds and distance in km, get speed in km/h */
export function speedKmh(totalSeconds: number, distanceKm: number): number {
  return (distanceKm / totalSeconds) * 3600;
}

/** Given total seconds and distance in km, get speed in mph */
export function speedMph(totalSeconds: number, distanceKm: number): number {
  return (kmToMiles(distanceKm) / totalSeconds) * 3600;
}

/** Given pace in seconds per km, get finish time in seconds for a distance */
export function finishTime(paceSecondsPerKm: number, distanceKm: number): number {
  return paceSecondsPerKm * distanceKm;
}

/** Convert pace (sec/km) to speed (km/h) */
export function paceToSpeedKmh(paceSecondsPerKm: number): number {
  return 3600 / paceSecondsPerKm;
}

/** Convert speed (km/h) to pace (sec/km) */
export function speedKmhToPace(speed: number): number {
  return 3600 / speed;
}

/** Convert pace (sec/km) to pace (sec/mi) */
export function paceKmToMile(paceSecondsPerKm: number): number {
  return paceSecondsPerKm * KM_PER_MILE;
}

/** Convert pace (sec/mi) to pace (sec/km) */
export function paceMileToKm(paceSecondsPerMile: number): number {
  return paceSecondsPerMile / KM_PER_MILE;
}

/** Format a distance label, adapting to unit system */
export function formatDistance(km: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    return `${kmToMiles(km).toFixed(2)} mi`;
  }
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
}
