/**
 * Audio Context singleton
 * Survives hot reloads via globalThis
 */
import { AudioContext } from "node-web-audio-api";
import { type Scheduler, getScheduler } from "./scheduler.ts";

// Extend globalThis to hold our singletons across hot reloads
declare global {
  var __audioContext: AudioContext | undefined;
}

/**
 * Get or create the global AudioContext
 */
export function getAudioContext(): AudioContext {
  if (!globalThis.__audioContext) {
    globalThis.__audioContext = new AudioContext();
    console.log("🔊 Audio context created");
  }
  return globalThis.__audioContext;
}

/**
 * Get the current audio time in seconds
 */
export function getCurrentTime(): number {
  return getAudioContext().currentTime;
}

/**
 * Get or create the scheduler for a given BPM
 */
export function getGlobalScheduler(bpm: number = 120): Scheduler {
  return getScheduler(getAudioContext(), bpm);
}

export { Scheduler } from "./scheduler.ts";

/**
 * Convert beats to seconds based on current BPM
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats * 60) / bpm;
}
