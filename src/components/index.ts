/**
 * React Synth Components
 *
 * Transform React code into music!
 */

// Core components
export { Track, useTrack } from "./Track.tsx";
export { Loop, useLoop } from "./Loop.tsx";
export * from "./Note/index.ts";
export { Sequence, useSequence } from "./Sequence.tsx";

export { Scheduler, getScheduler } from "../audio/scheduler.ts";

// Renderer
export { renderSynth, unmountSynth } from "../bootstrap.ts";
