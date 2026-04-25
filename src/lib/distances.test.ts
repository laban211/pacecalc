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

describe("generateSplitRows", () => {
  it("generates rows up to maxKm", () => {
    const rows = generateSplitRows(5);
    const kmValues = rows.map((r) => r.km);
    expect(kmValues).toEqual([1, 2, 3, 4, 5]);
  });

  it("defaults to 43 km", () => {
    const rows = generateSplitRows();
    const last = rows[rows.length - 1];
    expect(last.km).toBe(43);
  });

  it("inserts Half Marathon between km 21 and 22", () => {
    const rows = generateSplitRows(22);
    const halfIndex = rows.findIndex((r) => r.label === "Half Marathon");
    expect(halfIndex).toBeGreaterThan(-1);
    expect(rows[halfIndex].km).toBe(21.0975);
    expect(rows[halfIndex].highlight).toBe(true);

    // Should appear after km 21 and before km 22
    const km21Index = rows.findIndex((r) => r.km === 21);
    const km22Index = rows.findIndex((r) => r.km === 22);
    expect(halfIndex).toBeGreaterThan(km21Index);
    expect(halfIndex).toBeLessThan(km22Index);
  });

  it("inserts Marathon between km 42 and 43", () => {
    const rows = generateSplitRows();
    const marathonIndex = rows.findIndex((r) => r.label === "Marathon");
    expect(marathonIndex).toBeGreaterThan(-1);
    expect(rows[marathonIndex].km).toBe(42.195);
    expect(rows[marathonIndex].highlight).toBe(true);

    const km42Index = rows.findIndex((r) => r.km === 42);
    const km43Index = rows.findIndex((r) => r.km === 43);
    expect(marathonIndex).toBeGreaterThan(km42Index);
    expect(marathonIndex).toBeLessThan(km43Index);
  });

  it("highlights standard race km values", () => {
    const rows = generateSplitRows();
    const highlightedKm = [1, 5, 10, 15, 25, 30];
    for (const km of highlightedKm) {
      const row = rows.find((r) => r.km === km);
      expect(row?.highlight, `km ${km} should be highlighted`).toBe(true);
    }
  });

  it("does not highlight non-standard km values", () => {
    const rows = generateSplitRows();
    const nonHighlighted = [2, 3, 4, 6, 7, 8, 9, 11, 12, 20];
    for (const km of nonHighlighted) {
      const row = rows.find((r) => r.km === km);
      expect(row?.highlight, `km ${km} should not be highlighted`).toBe(false);
    }
  });

  it("does not include Half Marathon when maxKm < 22", () => {
    const rows = generateSplitRows(20);
    const half = rows.find((r) => r.label === "Half Marathon");
    expect(half).toBeUndefined();
  });
});
