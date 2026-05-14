import { describe, it, expect } from "vitest";
import { PRESET_DISTANCES, generateSplitRows } from "./distances";

describe("PRESET_DISTANCES", () => {
  it("contains the standard race distances", () => {
    const labels = PRESET_DISTANCES.map((d) => d.label);
    expect(labels).toEqual(["1K", "5K", "10K", "Half Marathon", "Marathon"]);
  });

  it("has correct km values", () => {
    const byLabel = Object.fromEntries(PRESET_DISTANCES.map((d) => [d.label, d.km]));
    expect(byLabel["1K"]).toBe(1);
    expect(byLabel["5K"]).toBe(5);
    expect(byLabel["10K"]).toBe(10);
    expect(byLabel["Half Marathon"]).toBe(21.0975);
    expect(byLabel["Marathon"]).toBe(42.195);
  });
});

describe("generateSplitRows (metric)", () => {
  it("generates rows up to 43 km", () => {
    const rows = generateSplitRows("metric");
    const last = rows[rows.length - 1];
    expect(last.km).toBe(43);
    expect(last.label).toBe("43 km");
  });

  it("labels rows with km", () => {
    const rows = generateSplitRows("metric");
    expect(rows[0].label).toBe("1 km");
    expect(rows[4].label).toBe("5 km");
  });

  it("inserts Half Marathon between km 21 and 22", () => {
    const rows = generateSplitRows("metric");
    const halfIndex = rows.findIndex((r) => r.label === "Half Marathon");
    expect(halfIndex).toBeGreaterThan(-1);
    expect(rows[halfIndex].km).toBe(21.0975);
    expect(rows[halfIndex].highlight).toBe(true);

    const km21Index = rows.findIndex((r) => r.km === 21);
    const km22Index = rows.findIndex((r) => r.km === 22);
    expect(halfIndex).toBeGreaterThan(km21Index);
    expect(halfIndex).toBeLessThan(km22Index);
  });

  it("inserts Marathon between km 42 and 43", () => {
    const rows = generateSplitRows("metric");
    const marathonIndex = rows.findIndex((r) => r.label === "Marathon");
    expect(marathonIndex).toBeGreaterThan(-1);
    expect(rows[marathonIndex].km).toBe(42.195);
    expect(rows[marathonIndex].highlight).toBe(true);

    const km42Index = rows.findIndex((r) => r.km === 42);
    const km43Index = rows.findIndex((r) => r.km === 43);
    expect(marathonIndex).toBeGreaterThan(km42Index);
    expect(marathonIndex).toBeLessThan(km43Index);
  });

  it("highlights standard checkpoint km values", () => {
    const rows = generateSplitRows("metric");
    const highlightedKm = [1, 5, 10, 15, 20, 25, 30, 35, 40];
    for (const km of highlightedKm) {
      const row = rows.find((r) => r.km === km);
      expect(row?.highlight, `km ${km} should be highlighted`).toBe(true);
    }
  });

  it("does not highlight non-checkpoint km values", () => {
    const rows = generateSplitRows("metric");
    const nonHighlighted = [2, 3, 4, 6, 7, 8, 9, 11, 12];
    for (const km of nonHighlighted) {
      const row = rows.find((r) => r.km === km);
      expect(row?.highlight, `km ${km} should not be highlighted`).toBe(false);
    }
  });
});

describe("generateSplitRows (imperial)", () => {
  it("generates rows up to 27 mi", () => {
    const rows = generateSplitRows("imperial");
    const last = rows[rows.length - 1];
    expect(last.label).toBe("27 mi");
  });

  it("labels rows with mi", () => {
    const rows = generateSplitRows("imperial");
    expect(rows[0].label).toBe("1 mi");
    expect(rows[4].label).toBe("5 mi");
  });

  it("inserts Half Marathon at its correct position", () => {
    const rows = generateSplitRows("imperial");
    const halfIndex = rows.findIndex((r) => r.label === "Half Marathon");
    expect(halfIndex).toBeGreaterThan(-1);
    expect(rows[halfIndex].km).toBe(21.0975);

    // Half marathon (13.1 mi) should appear between mile 13 and mile 14
    const mi13Index = rows.findIndex((r) => r.label === "13 mi");
    const mi14Index = rows.findIndex((r) => r.label === "14 mi");
    expect(halfIndex).toBeGreaterThan(mi13Index);
    expect(halfIndex).toBeLessThan(mi14Index);
  });

  it("inserts Marathon at its correct position", () => {
    const rows = generateSplitRows("imperial");
    const marathonIndex = rows.findIndex((r) => r.label === "Marathon");
    expect(marathonIndex).toBeGreaterThan(-1);
    expect(rows[marathonIndex].km).toBe(42.195);

    // Marathon (26.2 mi) should appear between mile 26 and mile 27
    const mi26Index = rows.findIndex((r) => r.label === "26 mi");
    const mi27Index = rows.findIndex((r) => r.label === "27 mi");
    expect(marathonIndex).toBeGreaterThan(mi26Index);
    expect(marathonIndex).toBeLessThan(mi27Index);
  });

  it("highlights standard checkpoint mile values", () => {
    const rows = generateSplitRows("imperial");
    const highlightedMi = [1, 5, 10, 15, 20, 25];
    for (const mi of highlightedMi) {
      const row = rows.find((r) => r.label === `${mi} mi`);
      expect(row?.highlight, `mi ${mi} should be highlighted`).toBe(true);
    }
  });
});
