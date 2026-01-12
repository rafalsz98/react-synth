import type { CutoffType } from "../components/Synth/types.ts";
import { midiToFrequency } from "./notes.ts";

/** Generate an array of linearly interpolated values */
export function line(start: number, end: number, steps: number): number[] {
  if (steps < 1) {
    throw new Error("Line must have at least 1 step");
  }

  const increment = (end - start) / steps;
  return Array.from({ length: steps }, (_, i) => start + increment * i);
}

/** Mirror an array: [1,2,3] → [1,2,3,3,2,1] */
export function mirror(values: number[]): number[] {
  return [...values, ...values.toReversed()];
}

export function resolveCutoff(
  cutoff: CutoffType,
  stepIndex: number,
): number {
  if (typeof cutoff === "number") {
    return midiToFrequency(cutoff);
  }

  const values = line(cutoff.from, cutoff.to, cutoff.steps);
  const sequence = cutoff.mirror ? mirror(values) : values;
  const effectiveStep = cutoff.step ?? stepIndex;

  return midiToFrequency(sequence[effectiveStep % sequence.length]);
}
