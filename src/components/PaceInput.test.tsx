import { describe, it, expect } from "vitest";
import { useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import { PaceInput, type InputMode } from "./PaceInput";

/**
 * Wrapper that mirrors the parent-child feedback loop in PaceSplits:
 * the computed pace is passed straight back as initialPace.
 * Without this round-trip the sync guard is never exercised.
 */
function PaceInputHarness({ initial = null }: { initial?: number | null }): React.JSX.Element {
  const [pace, setPace] = useState<number | null>(initial);
  return (
    <PaceInput
      unit="metric"
      initialPace={pace}
      onPaceChange={(sec: number | null, _mode: InputMode) => setPace(sec)}
    />
  );
}

function getInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector("input")!;
}

describe("PaceInput — input ownership contract", () => {
  it("does not reformat user input while typing", () => {
    const { container } = render(<PaceInputHarness />);
    const input = getInput(container);

    fireEvent.focus(input);

    // "4" is valid (4 min) — parent gets 240s and mirrors it back.
    // The input must stay "4", not become "4:00".
    fireEvent.change(input, { target: { value: "4" } });
    expect(input).toHaveValue("4");

    // Intermediate state: not yet a complete value.
    fireEvent.change(input, { target: { value: "4." } });
    expect(input).toHaveValue("4.");

    // Two-part value: must not be reformatted to "4:30".
    fireEvent.change(input, { target: { value: "4.3" } });
    expect(input).toHaveValue("4.3");
  });

  it("accepts an external pre-fill when the input is not focused", () => {
    // Simulate the Goal Time → Pace navigation: component first renders
    // empty, then receives a pace value via prop change.
    const { container, rerender } = render(
      <PaceInput unit="metric" initialPace={null} onPaceChange={() => {}} />,
    );
    const input = getInput(container);
    expect(input).toHaveValue("");

    // External source sets pace (300s = 5:00) while input is not focused
    rerender(
      <PaceInput unit="metric" initialPace={300} onPaceChange={() => {}} />,
    );
    expect(input).toHaveValue("5:00");
  });

  it("updates from external source after the user blurs", () => {
    const { container, rerender } = render(
      <PaceInput unit="metric" initialPace={null} onPaceChange={() => {}} />,
    );
    const input = getInput(container);

    // User types and then blurs
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "4" } });
    fireEvent.blur(input);

    // External source sets a different pace (360s = 6:00)
    rerender(
      <PaceInput unit="metric" initialPace={360} onPaceChange={() => {}} />,
    );

    expect(input).toHaveValue("6:00");
  });
});
