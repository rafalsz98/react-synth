import { JSDOM } from "jsdom";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

// Create fake DOM for React
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>');

// Polyfill globals that React needs
// deno-lint-ignore no-explicit-any
(globalThis as any).document = dom.window.document;
// deno-lint-ignore no-explicit-any
(globalThis as any).window = dom.window;

let root: Root | null = null;

/**
 * Renders and plays a react-synth track.
 *
 * Usage:
 * ```tsx
 * import { playSong, Track, Loop, Sample } from "@react-synth/synth";
 *
 * playSong(
 *   <Track bpm={120}>
 *     <Loop interval={1}>
 *       <Sample name="bd_haus" />
 *     </Loop>
 *   </Track>
 * );
 * ```
 *
 * Run with hot reload: `deno run --watch --allow-all song.tsx`
 */
export function playSong(track: ReactNode): void {
  const container = document.getElementById("root")!;

  if (!root) {
    root = createRoot(container);
  }

  root.render(track);

  console.log("🎹 Playing...");
  console.log("   Press Ctrl+C to stop");
}
