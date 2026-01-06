/**
 * Line utility for creating value sweeps
 *
 * Inspired by Sonic Pi's `line(start, end, steps:)` function.
 * Creates a sequence of values interpolated from start to end.
 *
 * @example
 * const sweep = line(60, 110, 32);
 * sweep.values // [60, 61.6, 63.2, ...]
 * sweep.mirror.values // [60, ..., 110, ..., 60]
 * sweep.at(0) // 60
 * sweep.at(15) // ~85
 */

import type { CutoffType } from "../components/Synth/types.ts";
import { midiToFrequency } from "./notes.ts";

/**
 * Represents a line/ramp of interpolated values
 */
export type Line = {
  /** The array of interpolated values */
  readonly values: readonly number[];
  /** Number of steps in this line */
  readonly steps: number;
  /** Get value at index (wraps around if index > steps) */
  at: (index: number) => number;
  /** Create a mirrored version (up then down) */
  readonly mirror: Line;
  /** Create a tick function that auto-advances through values */
  tick: () => () => number;
};

/**
 * Creates a line of interpolated values from start to end
 *
 * @param start - Starting value
 * @param end - Ending value
 * @param steps - Number of steps (values) to generate
 * @returns A Line object with values, mirror, at(), and tick() methods
 *
 * @example
 * // Basic sweep
 * const filter = line(60, 110, 32);
 *
 * // Mirrored sweep (up then down)
 * const sweep = line(60, 110, 32).mirror;
 *
 * // Get value at specific step
 * filter.at(16) // middle value
 *
 * // Auto-advancing tick
 * const next = filter.tick();
 * next() // 60
 * next() // 61.6...
 * TODO: Clean this shit
 */
export function line(start: number, end: number, steps: number): Line {
  if (steps < 1) {
    throw new Error("Line must have at least 1 step");
  }

  const values: number[] = [];
  const increment = (end - start) / steps;
  for (let i = 0; i < steps; i++) {
    values.push(start + increment * i);
  }

  const frozenValues = Object.freeze(values);

  const createLine = (vals: readonly number[]): Line => ({
    values: vals,
    steps: vals.length,

    at(index: number): number {
      const wrappedIndex = index % vals.length;
      return vals[wrappedIndex];
    },

    get mirror(): Line {
      // Create mirrored values: original + reversed (Sonic Pi compatible)
      // Sonic Pi's mirror includes duplicate at peak: [60...108, 108...60]
      // This creates 2N values total (not 2N-2)
      const reversed = [...vals].reverse();
      const mirrored = [...vals, ...reversed];
      return createLine(Object.freeze(mirrored));
    },

    tick(): () => number {
      let index = 0;
      return () => {
        const value = vals[index % vals.length];
        index++;
        return value;
      };
    },
  });

  return createLine(frozenValues);
}

/**
 * Resolves a CutoffValue to an array of frequency values (in Hz)
 *
 * @param cutoff - Static number or dynamic line configuration
 * @param stepIndex - Current step index (for dynamic values)
 * @param midiToHz - Function to convert MIDI note to Hz
 * @returns Cutoff frequency in Hz
 */
export function resolveCutoff(
  cutoff: CutoffType,
  stepIndex: number,
): number {
  if (typeof cutoff === "number") {
    return midiToFrequency(cutoff);
  }

  // Dynamic cutoff using line interpolation
  const lineObj = line(cutoff.from, cutoff.to, cutoff.steps);
  const values = cutoff.mirror ? lineObj.mirror : lineObj;
  // Use manual step override if provided, otherwise use stepIndex from Sequence
  const effectiveStep = cutoff.step ?? stepIndex;
  const midiValue = values.at(effectiveStep);
  return midiToFrequency(midiValue);
}
