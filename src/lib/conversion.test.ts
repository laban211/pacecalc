import { describe, it, expect } from "vitest";
import {
  kmToMiles,
  milesToKm,
  parseTime,
  parseTimeDetailed,
  formatTime,
  formatPace,
  describeTime,
  pacePerKm,
  pacePerMile,
  speedKmh,
  speedMph,
  finishTime,
  paceToSpeedKmh,
  speedKmhToPace,
  paceKmToMile,
  paceMileToKm,
  formatDistance,
  floorToFixed,
  riegelTime,
} from "./conversion";

// --- Unit conversions ---

describe("kmToMiles", () => {
  it("converts km to miles", () => {
    expect(kmToMiles(1.60934)).toBeCloseTo(1, 5);
    expect(kmToMiles(0)).toBe(0);
    expect(kmToMiles(42.195)).toBeCloseTo(26.2188, 3);
  });
});

describe("milesToKm", () => {
  it("converts miles to km", () => {
    expect(milesToKm(1)).toBeCloseTo(1.60934, 5);
    expect(milesToKm(0)).toBe(0);
    expect(milesToKm(26.2188)).toBeCloseTo(42.195, 2);
  });
});

describe("kmToMiles / milesToKm roundtrip", () => {
  it("roundtrips without loss", () => {
    const km = 21.0975;
    expect(milesToKm(kmToMiles(km))).toBeCloseTo(km, 10);
  });
});

// --- Time parsing ---

describe("parseTime", () => {
  describe("duration mode (default)", () => {
    it("parses colon format as hours:minutes", () => {
      expect(parseTime("1:40")).toBe(1 * 3600 + 40 * 60);
      expect(parseTime("3:30")).toBe(3 * 3600 + 30 * 60);
    });

    it("parses three-part colon as h:mm:ss", () => {
      expect(parseTime("1:30:00")).toBe(5400);
      expect(parseTime("0:45:30")).toBe(45 * 60 + 30);
    });

    it("parses dot format as hours.minutes", () => {
      expect(parseTime("1.30")).toBe(1 * 3600 + 30 * 60);
      expect(parseTime("2.15")).toBe(2 * 3600 + 15 * 60);
    });

    it("parses plain number as minutes", () => {
      expect(parseTime("90")).toBe(90 * 60);
      expect(parseTime("5")).toBe(5 * 60);
    });
  });

  describe("pace mode", () => {
    it("parses colon format as minutes:seconds", () => {
      expect(parseTime("4:40", "pace")).toBe(4 * 60 + 40);
      expect(parseTime("5:00", "pace")).toBe(300);
    });

    it("parses dot format as minutes.seconds", () => {
      expect(parseTime("4.40", "pace")).toBe(4 * 60 + 40);
      expect(parseTime("5.05", "pace")).toBe(5 * 60 + 5);
    });

    it("parses plain number as minutes", () => {
      expect(parseTime("5", "pace")).toBe(300);
    });
  });

  describe("three-part dot format (h.mm.ss)", () => {
    it("parses 0.20.30 as 20m 30s in duration mode", () => {
      expect(parseTime("0.20.30")).toBe(20 * 60 + 30);
    });

    it("parses 1.30.00 as 1h 30m in duration mode", () => {
      expect(parseTime("1.30.00")).toBe(1 * 3600 + 30 * 60);
    });

    it("parses 2.5.30 as 2h 5m 30s in duration mode", () => {
      expect(parseTime("2.5.30")).toBe(2 * 3600 + 5 * 60 + 30);
    });
  });

  describe("invalid inputs", () => {
    it("returns null for empty string", () => {
      expect(parseTime("")).toBeNull();
      expect(parseTime("   ")).toBeNull();
    });

    it("returns null for non-numeric input", () => {
      expect(parseTime("abc")).toBeNull();
    });

    it("returns null for negative values", () => {
      expect(parseTime("-5")).toBeNull();
    });

    it("returns null for seconds >= 60 in colon format", () => {
      expect(parseTime("4:60", "pace")).toBeNull();
      expect(parseTime("1:60:00")).toBeNull();
    });

    it("returns null for minor >= 60 in dot format", () => {
      expect(parseTime("4.60", "pace")).toBeNull();
    });

    it("returns null for more than 3 dot parts", () => {
      expect(parseTime("1.2.3.4")).toBeNull();
    });

    it("returns null for more than 3 colon parts", () => {
      expect(parseTime("1:2:3:4")).toBeNull();
    });

    it("returns null for invalid three-part dot values", () => {
      expect(parseTime("1.60.00")).toBeNull();
      expect(parseTime("1.20.60")).toBeNull();
    });
  });
});

describe("parseTimeDetailed", () => {
  it("returns full breakdown for pace colon input", () => {
    const result = parseTimeDetailed("4:40", "pace");
    expect(result).toEqual({
      totalSeconds: 280,
      hours: 0,
      minutes: 4,
      seconds: 40,
    });
  });

  it("returns full breakdown for duration colon input", () => {
    const result = parseTimeDetailed("1:40");
    expect(result).toEqual({
      totalSeconds: 6000,
      hours: 1,
      minutes: 40,
      seconds: 0,
    });
  });

  it("returns full breakdown for three-part colon input", () => {
    const result = parseTimeDetailed("2:05:30");
    expect(result).toEqual({
      totalSeconds: 2 * 3600 + 5 * 60 + 30,
      hours: 2,
      minutes: 5,
      seconds: 30,
    });
  });

  it("returns full breakdown for three-part dot input", () => {
    const result = parseTimeDetailed("0.20.30");
    expect(result).toEqual({
      totalSeconds: 20 * 60 + 30,
      hours: 0,
      minutes: 20,
      seconds: 30,
    });
  });

  it("handles single-digit dot minor by padding", () => {
    // "5.5" → minor "5" padded to "50"
    const result = parseTimeDetailed("5.5", "pace");
    expect(result).toEqual({
      totalSeconds: 5 * 60 + 50,
      hours: 0,
      minutes: 5,
      seconds: 50,
    });
  });
});

// --- Time formatting ---

describe("formatTime", () => {
  it("formats sub-hour as m:ss", () => {
    expect(formatTime(280)).toBe("4:40");
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(59)).toBe("0:59");
  });

  it("formats hour+ as h:mm:ss", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(5400)).toBe("1:30:00");
    expect(formatTime(3661)).toBe("1:01:01");
  });

  it("truncates sub-seconds to match official race chip-time recording", () => {
    // 3:59:59.999 → 3:59:59 — same as World Athletics / major marathon timing
    expect(formatTime(14399.999)).toBe("3:59:59");
    expect(formatTime(280.9)).toBe("4:40");
    expect(formatTime(280.1)).toBe("4:40");
  });
});

describe("formatPace", () => {
  it("formats pace as m:ss", () => {
    expect(formatPace(280)).toBe("4:40");
    expect(formatPace(300)).toBe("5:00");
    expect(formatPace(65)).toBe("1:05");
  });

  it("shows 0:ss for sub-minute paces", () => {
    expect(formatPace(45)).toBe("0:45");
  });

  it("floors fractional seconds to show a slightly faster pace", () => {
    // 4:30.6 → 4:30 (not 4:31) so the runner finishes at or before the goal
    expect(formatPace(270.6)).toBe("4:30");
    expect(formatPace(270.9)).toBe("4:30");
    expect(formatPace(270.1)).toBe("4:30");
  });

  it("never rounds up to a slower pace that would miss the goal", () => {
    // If true pace is 4:59.9/km, displaying 5:00 would cause the runner to
    // finish late. Floor ensures we show 4:59.
    expect(formatPace(299.9)).toBe("4:59");
  });
});

describe("describeTime", () => {
  it("describes hours and minutes", () => {
    expect(describeTime({ totalSeconds: 5400, hours: 1, minutes: 30, seconds: 0 })).toBe("1h 30m");
  });

  it("describes minutes and seconds", () => {
    expect(describeTime({ totalSeconds: 280, hours: 0, minutes: 4, seconds: 40 })).toBe("4m 40s");
  });

  it("describes hours only", () => {
    expect(describeTime({ totalSeconds: 7200, hours: 2, minutes: 0, seconds: 0 })).toBe("2h");
  });

  it("returns null for zero", () => {
    expect(describeTime({ totalSeconds: 0, hours: 0, minutes: 0, seconds: 0 })).toBeNull();
  });
});

// --- Pace & speed calculations ---

describe("pacePerKm", () => {
  it("calculates pace in sec/km", () => {
    // 10K in 50 minutes → 5:00/km = 300 sec/km
    expect(pacePerKm(3000, 10)).toBe(300);
  });
});

describe("pacePerMile", () => {
  it("calculates pace in sec/mile", () => {
    // 10K in 50 minutes → pace per mile = 3000 / (10 / 1.60934)
    const result = pacePerMile(3000, 10);
    expect(result).toBeCloseTo(300 * 1.60934, 2);
  });
});

describe("speedKmh", () => {
  it("calculates speed in km/h", () => {
    // 10 km in 3600 seconds = 10 km/h
    expect(speedKmh(3600, 10)).toBe(10);
    // 42.195 km in 2 hours = 21.0975 km/h
    expect(speedKmh(7200, 42.195)).toBeCloseTo(21.0975, 4);
  });
});

describe("speedMph", () => {
  it("calculates speed in mph", () => {
    // 10 km in 3600 seconds → 10 km/h → ~6.2137 mph
    expect(speedMph(3600, 10)).toBeCloseTo(6.2137, 3);
  });
});

describe("finishTime", () => {
  it("calculates finish time from pace and distance", () => {
    // 5:00/km for 10K = 3000 seconds
    expect(finishTime(300, 10)).toBe(3000);
    // 5:00/km for marathon
    expect(finishTime(300, 42.195)).toBeCloseTo(12658.5, 1);
  });
});

describe("paceToSpeedKmh / speedKmhToPace", () => {
  it("converts pace to speed", () => {
    // 360 sec/km = 10 km/h
    expect(paceToSpeedKmh(360)).toBe(10);
    // 300 sec/km = 12 km/h
    expect(paceToSpeedKmh(300)).toBe(12);
  });

  it("converts speed to pace", () => {
    expect(speedKmhToPace(10)).toBe(360);
    expect(speedKmhToPace(12)).toBe(300);
  });

  it("roundtrips", () => {
    expect(speedKmhToPace(paceToSpeedKmh(280))).toBeCloseTo(280, 10);
  });
});

describe("paceKmToMile / paceMileToKm", () => {
  it("converts sec/km to sec/mile", () => {
    // 300 sec/km → 300 * 1.60934 sec/mile
    expect(paceKmToMile(300)).toBeCloseTo(482.802, 2);
  });

  it("converts sec/mile to sec/km", () => {
    expect(paceMileToKm(482.802)).toBeCloseTo(300, 1);
  });

  it("roundtrips", () => {
    expect(paceMileToKm(paceKmToMile(300))).toBeCloseTo(300, 10);
  });
});

// --- formatDistance ---

describe("formatDistance", () => {
  it("formats metric distances", () => {
    expect(formatDistance(5, "metric")).toBe("5.00 km");
    expect(formatDistance(10, "metric")).toBe("10.0 km");
    expect(formatDistance(42.195, "metric")).toBe("42.2 km");
  });

  it("formats imperial distances", () => {
    expect(formatDistance(1.60934, "imperial")).toBe("1.00 mi");
    expect(formatDistance(42.195, "imperial")).toBe("26.22 mi");
  });
});

// --- floorToFixed ---

describe("floorToFixed", () => {
  it("floors to the specified decimal places", () => {
    expect(floorToFixed(12.349, 2)).toBe("12.34");
    expect(floorToFixed(12.999, 2)).toBe("12.99");
    expect(floorToFixed(9.99, 1)).toBe("9.9");
  });

  it("never rounds up (conservative for speed display)", () => {
    // 12.356 km/h → "12.35" not "12.36"
    expect(floorToFixed(12.356, 2)).toBe("12.35");
    expect(floorToFixed(9.99, 0)).toBe("9");
  });

  it("preserves trailing zeros", () => {
    expect(floorToFixed(10.0, 2)).toBe("10.00");
    expect(floorToFixed(5.1, 2)).toBe("5.10");
  });
});

describe("riegelTime", () => {
  it("returns the same time for the same distance", () => {
    expect(riegelTime(1200, 5, 5)).toBe(1200);
  });

  it("predicts 10K from 5K within expected range", () => {
    // 20:00 5K → roughly 41:30 10K (well-known benchmark)
    const predicted = riegelTime(1200, 5, 10);
    expect(predicted).toBeGreaterThan(2450);
    expect(predicted).toBeLessThan(2550);
  });

  it("predicts shorter distances are proportionally faster", () => {
    const marathon = 3 * 3600 + 30 * 60; // 3:30:00
    const halfPrediction = riegelTime(marathon, 42.195, 21.0975);
    // Half should be less than exactly half the marathon time (exponent > 1)
    expect(halfPrediction).toBeLessThan(marathon / 2);
  });

  it("is symmetric — predicting forward then back returns original time", () => {
    const original = 1200;
    const predicted10k = riegelTime(original, 5, 10);
    const backTo5k = riegelTime(predicted10k, 10, 5);
    expect(backTo5k).toBeCloseTo(original, 5);
  });
});
