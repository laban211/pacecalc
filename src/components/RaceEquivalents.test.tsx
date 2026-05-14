import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UnitProvider } from "../context/UnitContext";
import { RaceEquivalents } from "./RaceEquivalents";

function renderWithProviders(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<UnitProvider>{ui}</UnitProvider>);
}

// 20:00 5K
const props = { timeSeconds: 1200, distanceKm: 5, distanceLabel: "5K" };

describe("RaceEquivalents", () => {
  it("is collapsed by default", () => {
    const { container } = renderWithProviders(<RaceEquivalents {...props} />);
    expect(container.querySelector("button")!.textContent).toContain("Show");
    // Panel is collapsed (grid-rows-[0fr] hides content)
    const panel = container.querySelector(".grid")!;
    expect(panel.classList).toContain("opacity-0");
  });

  it("shows predictions for all distances except the selected one", () => {
    const { container } = renderWithProviders(<RaceEquivalents {...props} />);
    fireEvent.click(container.querySelector("button")!);

    // 5 presets minus 5K = 4 rows
    const rows = container.querySelectorAll(".font-mono");
    expect(rows).toHaveLength(4);
  });

  it("changes button text when expanded", () => {
    const { container } = renderWithProviders(<RaceEquivalents {...props} />);
    const button = container.querySelector("button")!;

    fireEvent.click(button);
    expect(button.textContent).toContain("Hide");

    fireEvent.click(button);
    expect(button.textContent).toContain("Show");
  });

  it("shows the disclaimer when expanded", () => {
    const { container } = renderWithProviders(<RaceEquivalents {...props} />);
    fireEvent.click(container.querySelector("button")!);

    expect(container.textContent).toContain("Riegel");
  });
});
