import {
  AudioContext,
  type AudioContext as AudioContextType,
} from "node-web-audio-api";

export type ScheduleCallback = (audioTime: number, beatTime: number) => void;

type ScheduledEvent = {
  id: string;
  nextBeatTime: number;
  intervalBeats: number;
  callback: ScheduleCallback;
  active: boolean;
  /** Timestamp when the loop was marked for removal (for grace period during HMR) */
  pendingRemoval?: number;
};

let schedulerInstance: Scheduler | undefined;
let audioContextInstance: AudioContextType | undefined;

export class Scheduler {
  private context: AudioContextType;
  private _bpm: number;
  private startTime: number;
  private events: Map<string, ScheduledEvent> = new Map();
  private timerID: ReturnType<typeof setInterval> | null = null;
  private running = false;

  private readonly lookahead = 0.1;
  private readonly scheduleInterval = 25;
  /** Grace period before actually removing a loop - allows React HMR to re-add it */
  private readonly removalGracePeriod = 100;

  constructor(bpm: number) {
    if (!audioContextInstance) {
      audioContextInstance = new AudioContext();
    }
    this.context = audioContextInstance;
    this._bpm = bpm;
    this.startTime = this.context.currentTime;
  }

  // --- Public API ---

  get audioContext(): AudioContextType {
    return this.context;
  }

  get bpm(): number {
    return this._bpm;
  }

  set bpm(value: number) {
    this._bpm = value;
  }

  start(): void {
    if (this.running) return;

    this.startTime = this.context.currentTime;
    this.running = true;

    for (const event of this.events.values()) {
      if (event.intervalBeats > 0) {
        event.nextBeatTime = 0;
        event.active = true;
      }
    }

    this.timerID = setInterval(() => this.schedule(), this.scheduleInterval);
  }

  stop(): void {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
    this.running = false;
    console.debug("[scheduler] stopped");
  }

  clear(): void {
    this.events.clear();
  }

  addLoop(
    id: string,
    intervalBeats: number,
    callback: ScheduleCallback,
    startBeat?: number,
  ): void {
    const existing = this.events.get(id);

    // HMR optimization: if loop exists (even if pending removal), update in-place
    // This preserves timing across hot reloads
    if (existing && existing.intervalBeats === intervalBeats) {
      existing.callback = callback;
      existing.active = true;
      existing.pendingRemoval = undefined; // Cancel pending removal
      // console.debug(`[scheduler] loop "${id}" updated (HMR)`);
      return;
    }

    const currentBeat = this.getCurrentBeat();
    let nextBeat: number;

    if (startBeat !== undefined) {
      nextBeat = startBeat;
    } else {
      nextBeat = Math.ceil(currentBeat / intervalBeats) * intervalBeats;
      if (nextBeat <= currentBeat) {
        nextBeat += intervalBeats;
      }
    }

    this.events.delete(id);
    this.events.set(id, {
      id,
      nextBeatTime: nextBeat,
      intervalBeats,
      callback,
      active: true,
    });

    console.debug(
      `[scheduler] loop "${id}" added, interval=${intervalBeats} beats, start=${
        nextBeat.toFixed(2)
      }`,
    );
  }

  remove(id: string): void {
    const event = this.events.get(id);
    if (event) {
      // Don't remove immediately - mark for removal with grace period
      // This allows React's HMR unmount/remount cycle to re-add the loop
      // and preserve its timing
      event.pendingRemoval = Date.now();
    }
  }

  beatsToSeconds(beats: number): number {
    return (beats * 60) / this._bpm;
  }

  // --- Private ---

  private secondsToBeats(seconds: number): number {
    return (seconds * this._bpm) / 60;
  }

  private getCurrentBeat(): number {
    const elapsed = this.context.currentTime - this.startTime;
    return this.secondsToBeats(elapsed);
  }

  private beatToAudioTime(beatTime: number): number {
    return this.startTime + this.beatsToSeconds(beatTime);
  }

  private schedule(): void {
    const currentAudioTime = this.context.currentTime;
    const currentBeat = this.getCurrentBeat();
    const scheduleUntilBeat = currentBeat + this.secondsToBeats(this.lookahead);
    const now = Date.now();

    for (const event of this.events.values()) {
      // Skip events pending removal
      if (event.pendingRemoval !== undefined) continue;
      if (!event.active) continue;

      while (event.nextBeatTime < scheduleUntilBeat) {
        const audioTime = this.beatToAudioTime(event.nextBeatTime);

        if (audioTime >= currentAudioTime) {
          event.callback(audioTime, event.nextBeatTime);
        }

        if (event.intervalBeats > 0) {
          event.nextBeatTime += event.intervalBeats;
        } else {
          event.active = false;
          break;
        }
      }
    }

    // Clean up events
    for (const [id, event] of this.events) {
      if (!event.active && event.intervalBeats === 0) {
        this.events.delete(id);
      } else if (
        event.pendingRemoval !== undefined &&
        now - event.pendingRemoval > this.removalGracePeriod
      ) {
        this.events.delete(id);
        console.debug(`[scheduler] loop "${id}" removed`);
      }
    }
  }
}

export function getScheduler(bpm: number): Scheduler {
  if (!schedulerInstance) {
    schedulerInstance = new Scheduler(bpm);
  } else {
    schedulerInstance.bpm = bpm;
  }
  return schedulerInstance;
}

export function resetScheduler(bpm: number): Scheduler {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance.clear();
  }
  schedulerInstance = new Scheduler(bpm);
  return schedulerInstance;
}
