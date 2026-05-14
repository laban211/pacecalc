# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

PaceCalc is a mobile-first running pace calculator PWA. Users enter a goal time + distance to see required pace/speed, or enter a pace to see finish times across all standard race distances. It supports metric and imperial units.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
```

Run a single test file: `npx vitest run src/lib/conversion.test.ts`

## Architecture

### Two features, one shared pace pipeline

The app has two tabs (features) that share a single internal representation: **pace in seconds per km**.

- **Goal Time** (`src/features/goal-time/GoalTime.tsx`): distance + time input -> computes pace and speed. Tapping a result card navigates to the Pace tab with that value pre-filled.
- **Pace Splits** (`src/features/pace-splits/PaceSplits.tsx`): pace or speed input -> split table showing finish times at every km, with optional +/- offset columns.

Cross-tab navigation uses `PaceNavContext` to pass a pace value (always sec/km internally) from Goal Time to Pace Splits. The `TabView` component keeps both screens mounted to preserve state and manages per-tab scroll positions.

### Unit system

`UnitContext` provides metric/imperial toggle (persisted to localStorage). All internal calculations use km; conversion to/from miles happens at the UI boundary. When the unit changes, inputs reset to avoid silently reinterpreting values in the wrong unit.

### Core computation (`src/lib/conversion.ts`)

Pure functions for pace, speed, time parsing/formatting, and unit conversion. Two parse modes:
- `"duration"`: ambiguous inputs read as hours-first (e.g. "1:40" = 1h 40m)
- `"pace"`: ambiguous inputs read as minutes-first (e.g. "4:40" = 4m 40s)

Supports colon, dot, and plain number formats. `riegelTime` implements Riegel's formula for race equivalents.

### Styling

Tailwind CSS v4 with a custom dark theme defined in `src/index.css` using `@theme` directive. Semantic color tokens: `bg`, `surface`, `surface-alt`, `accent`, `text`, `text-secondary`, `border`. Custom utilities `pt-safe-top` and `pb-safe-bottom` handle iOS safe areas.

### PWA

Configured via `vite-plugin-pwa` in `vite.config.ts`. Deployed at base path `/pacecalc/`.
