import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import { App } from "./App";

/**
 * Structural tests for the iOS PWA safe-area layout fix (a79c081).
 *
 * The app uses a flex-column layout (h-full / flex-col / overflow-hidden) so
 * the bottom nav sits naturally at the end of the flex container instead of
 * being position:fixed.  This avoids a WebKit bug where env(safe-area-inset-*)
 * isn't resolved correctly for fixed elements on initial load in standalone
 * PWA mode (WebKit #191872).
 *
 * Uses h-full (100%) instead of h-dvh (100dvh) because dvh units don't
 * recalculate correctly after orientation changes in iOS standalone PWA mode.
 * html/body have height: 100% in index.css to make the percentage chain work.
 *
 * These tests assert the CSS class invariants that make the fix work.
 * If a refactor removes any of them, the test fails — forcing a conscious
 * decision about whether the iOS fix is still intact.
 */

function hasClasses(el: Element, classes: string[]): void {
  const classList = el.className.split(/\s+/);
  for (const cls of classes) {
    expect(classList, `expected class "${cls}" on <${el.tagName.toLowerCase()}>`).toContain(cls);
  }
}

function lacksClasses(el: Element, classes: string[]): void {
  const classList = el.className.split(/\s+/);
  for (const cls of classes) {
    expect(classList, `unexpected class "${cls}" on <${el.tagName.toLowerCase()}>`).not.toContain(cls);
  }
}

describe("iOS PWA layout invariants", () => {
  it("app shell uses full-height flex column with hidden overflow", () => {
    const { container } = render(<App />);
    const shell = container.querySelector(".h-full")!;
    expect(shell, "could not find app shell with h-full").toBeTruthy();
    hasClasses(shell, ["h-full", "flex", "flex-col", "overflow-hidden"]);
  });

  it("mobile nav is NOT position:fixed (uses flexbox flow instead)", () => {
    const { container } = render(<App />);
    // Mobile bottom nav is the last <nav> that has md:hidden
    const navs = container.querySelectorAll("nav");
    const mobileNav = Array.from(navs).find((n) =>
      n.className.includes("md:hidden") && n.className.includes("border-t")
    );
    expect(mobileNav, "could not find mobile bottom nav").toBeTruthy();
    lacksClasses(mobileNav!, ["fixed", "bottom-0"]);
    hasClasses(mobileNav!, ["shrink-0"]);
  });

  it("main content area is the scrollable region", () => {
    const { container } = render(<App />);
    const main = container.querySelector("main")!;
    hasClasses(main, ["flex-1", "overflow-y-auto"]);
  });

  it("mobile header does not grow (shrink-0)", () => {
    const { container } = render(<App />);
    const header = container.querySelector("header")!;
    hasClasses(header, ["shrink-0"]);
  });

  it("mobile header uses pt-safe-top for safe-area padding", () => {
    const { container } = render(<App />);
    const header = container.querySelector("header")!;
    hasClasses(header, ["pt-safe-top"]);
  });

  it("desktop sidebar uses pt-safe-top for safe-area padding", () => {
    const { container } = render(<App />);
    const sidebar = container.querySelector("aside")!;
    hasClasses(sidebar, ["pt-safe-top"]);
  });

  it("pt-safe-top utility has a minimum fallback so it never collapses to zero", () => {
    const css = readFileSync(resolve(__dirname, "index.css"), "utf-8");
    const match = css.match(/@utility pt-safe-top\s*\{([^}]+)\}/);
    expect(match, "pt-safe-top utility not found in index.css").toBeTruthy();
    const body = match![1];
    expect(body, "pt-safe-top should use max() to guarantee minimum padding").toMatch(
      /max\([^,]+,\s*env\(safe-area-inset-top\)\)/
    );
  });
});
