/**
 * Scheduler - Lookahead scheduling for sample-accurate timing
 *
 * Uses the "two clocks" pattern:
 * - JavaScript timer (setInterval) runs frequently but imprecisely
 * - Web Audio clock schedules precisely in the lookahead window
 *
 * This gives us the best of both worlds: infinite loops with sample-accurate timing.
 */
import {
  AudioContext,
  type AudioContext as AudioContextType,
} from "node-web-audio-api";

export type ScheduleCallback = (audioTime: number, beatTime: number) => void;

interface ScheduledEvent {
  id: string;
  /** When this event next occurs (in beats) */
  nextBeatTime: number;
  /** Interval between occurrences (in beats), 0 = one-shot */
  intervalBeats: number;
  /** Callback to execute - receives audio time and beat time */
  callback: ScheduleCallback;
  /** Whether this event is active */
  active: boolean;
}

declare global {
  var __scheduler: Scheduler | undefined;
  var __audioContext: AudioContextType | undefined;
}

export class Scheduler {
  private _audioContext: AudioContextType;
  private bpm: number;
  private startTime: number; // Audio context time when playback started
  private events: Map<string, ScheduledEvent> = new Map();
  private timerID: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  private lookahead: number = 0.1; // Schedule 100ms ahead
  private scheduleInterval: number = 25; // Check every 25ms

  constructor(bpm: number) {
    this._audioContext = this.getOrCreateAudioContext();
    this.bpm = bpm;
    this.startTime = this._audioContext.currentTime;
  }

  private getOrCreateAudioContext(): AudioContextType {
    if (!globalThis.__audioContext) {
      globalThis.__audioContext = new AudioContext();
    }
    return globalThis.__audioContext;
  }

  get audioContext(): AudioContextType {
    return this._audioContext;
  }

  /**
   * Convert beats to seconds
   */
  beatsToSeconds(beats: number): number {
    return (beats * 60) / this.bpm;
  }

  /**
   * Convert seconds to beats
   */
  secondsToBeats(seconds: number): number {
    return (seconds * this.bpm) / 60;
  }

  /**
   * Get current beat position
   */
  getCurrentBeat(): number {
    const elapsed = this._audioContext.currentTime - this.startTime;
    return this.secondsToBeats(elapsed);
  }

  /**
   * Convert beat time to audio context time
   */
  beatToAudioTime(beatTime: number): number {
    return this.startTime + this.beatsToSeconds(beatTime);
  }

  /**
   * Update BPM (affects future scheduling)
   */
  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  /**
   * Get current BPM
   */
  getBpm(): number {
    return this.bpm;
  }

  /**
   * Register a looping event
   *
   * @param id - Unique identifier for this event
   * @param intervalBeats - Interval between occurrences in beats
   * @param callback - Function to call with (audioTime, beatTime)
   * @param startBeat - Optional beat to start from (defaults to next beat boundary)
   */
  addLoop(
    id: string,
    intervalBeats: number,
    callback: ScheduleCallback,
    startBeat?: number,
  ): void {
    // Calculate start time - either specified or next interval boundary
    const currentBeat = this.getCurrentBeat();
    let nextBeat: number;

    if (startBeat !== undefined) {
      nextBeat = startBeat;
    } else {
      // Start at the next interval boundary
      nextBeat = Math.ceil(currentBeat / intervalBeats) * intervalBeats;
      // If we're right on the boundary, use the next one
      if (nextBeat <= currentBeat) {
        nextBeat += intervalBeats;
      }
    }

    // Remove existing event with same ID
    this.events.delete(id);

    this.events.set(id, {
      id,
      nextBeatTime: nextBeat,
      intervalBeats,
      callback,
      active: true,
    });

    console.log(
      `🔁 Scheduled loop [${id}] every ${intervalBeats} beats, starting at beat ${
        nextBeat.toFixed(
          2,
        )
      }`,
    );
  }

  /**
   * Register a one-shot event
   */
  addOneShot(id: string, beatTime: number, callback: ScheduleCallback): void {
    this.events.set(id, {
      id,
      nextBeatTime: beatTime,
      intervalBeats: 0, // One-shot
      callback,
      active: true,
    });
  }

  /**
   * Remove an event
   */
  remove(id: string): void {
    const event = this.events.get(id);
    if (event) {
      console.log(`⏹️  Removed event [${id}]`);
      this.events.delete(id);
    }
  }

  /**
   * Check if an event exists
   */
  has(id: string): boolean {
    return this.events.has(id);
  }

  /**
   * The core scheduler loop - runs frequently, schedules ahead
   */
  private schedule(): void {
    const currentAudioTime = this._audioContext.currentTime;
    const currentBeat = this.getCurrentBeat();
    const lookaheadBeats = this.secondsToBeats(this.lookahead);
    const scheduleUntilBeat = currentBeat + lookaheadBeats;

    for (const event of this.events.values()) {
      if (!event.active) continue;

      // Schedule all occurrences that fall within our lookahead window
      while (event.nextBeatTime < scheduleUntilBeat) {
        // Only schedule if it's in the future (not already passed)
        if (event.nextBeatTime >= currentBeat - 0.001) {
          const audioTime = this.beatToAudioTime(event.nextBeatTime);

          // Only schedule if audio time is in the future
          if (audioTime >= currentAudioTime) {
            event.callback(audioTime, event.nextBeatTime);
          }
        }

        // Move to next occurrence
        if (event.intervalBeats > 0) {
          event.nextBeatTime += event.intervalBeats;
        } else {
          // One-shot event - deactivate it
          event.active = false;
          break;
        }
      }
    }

    // Clean up inactive one-shot events
    for (const [id, event] of this.events) {
      if (!event.active && event.intervalBeats === 0) {
        this.events.delete(id);
      }
    }
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) return;

    this.startTime = this._audioContext.currentTime;
    this.isRunning = true;

    // Reset all events to start from beat 0
    for (const event of this.events.values()) {
      if (event.intervalBeats > 0) {
        event.nextBeatTime = 0;
        event.active = true;
      }
    }

    this.timerID = setInterval(() => this.schedule(), this.scheduleInterval);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
    this.isRunning = false;
    console.log(`⏸️  Scheduler stopped`);
  }

  /**
   * Check if scheduler is running
   */
  isPlaying(): boolean {
    return this.isRunning;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
  }
}

/**
 * Get or create the global scheduler
 */
export function getScheduler(bpm: number): Scheduler {
  if (!globalThis.__scheduler) {
    globalThis.__scheduler = new Scheduler(bpm);
  } else {
    // Update BPM if it changed
    globalThis.__scheduler.setBpm(bpm);
  }
  return globalThis.__scheduler;
}

/**
 * Reset the global scheduler
 */
export function resetScheduler(bpm: number): Scheduler {
  if (globalThis.__scheduler) {
    globalThis.__scheduler.stop();
    globalThis.__scheduler.clear();
  }
  globalThis.__scheduler = new Scheduler(bpm);
  return globalThis.__scheduler;
}
