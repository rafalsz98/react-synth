import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  getScheduler,
  type ScheduleCallback,
  type Scheduler,
} from "../audio/scheduler.ts";
import type { AudioContext as AudioContextType } from "node-web-audio-api";

export type ScheduleNoteContextValue = {
  /**
   * Schedule a note to be played.
   * @param id - Unique identifier for this note callback
   * @param callback - The audio callback to invoke at the scheduled time
   * @param stepIndex - Optional step index when inside a Sequence
   */
  scheduleNote: (
    id: string,
    callback: ScheduleCallback,
    stepIndex?: number,
  ) => void;

  /**
   * Unschedule a previously scheduled note.
   * @param id - The identifier used when scheduling
   */
  unscheduleNote: (id: string) => void;
};

export const ScheduleNoteContext = createContext<
  ScheduleNoteContextValue | null
>(null);

type TrackContextValue = {
  audioContext: AudioContextType;
  scheduler: Scheduler;
};

const TrackContext = createContext<TrackContextValue | null>(null);

type TrackProps = {
  bpm: number;
  children: ReactNode;
};

/**
 * Track component - wraps your song and provides timing context
 *
 * @example
 * <Track bpm={120}>
 *   <Loop id="drums" interval={1}>
 *     <Note note="C4" />
 *   </Loop>
 * </Track>
 */
export function Track({ bpm, children }: TrackProps) {
  const scheduler = useRef<Scheduler>(getScheduler(bpm));
  const audioContext = scheduler.current.audioContext;

  useEffect(() => {
    scheduler.current.start();
  }, [scheduler]);

  // Default scheduling: immediate playback (for standalone Notes)
  const scheduleContextValue: ScheduleNoteContextValue = useMemo(
    () => ({
      scheduleNote: (_id, callback) => {
        const now = audioContext.currentTime + 0.005;
        callback(now, 0);
      },
      unscheduleNote: () => {
        // Nothing to clean up for one-shot playback
      },
    }),
    [audioContext],
  );

  return (
    <TrackContext.Provider
      value={{
        audioContext,
        scheduler: scheduler.current,
      }}
    >
      <ScheduleNoteContext.Provider value={scheduleContextValue}>
        {children}
      </ScheduleNoteContext.Provider>
    </TrackContext.Provider>
  );
}

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) {
    throw new Error("useTrack must be used inside a <Track> component");
  }
  return ctx;
}

export function useScheduleNote(): ScheduleNoteContextValue {
  const ctx = useContext(ScheduleNoteContext);
  if (!ctx) {
    throw new Error("useScheduleNote must be used inside a <Track> component");
  }

  return ctx;
}
