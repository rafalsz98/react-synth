import { type ReactNode, useEffect, useMemo, useRef } from "react";
import {
  ScheduleNoteContext,
  type ScheduleNoteContextValue,
  useTrack,
} from "./Track.tsx";
import type { ScheduleCallback } from "../audio/scheduler.ts";

type LoopProps = {
  /** Unique identifier for this loop */
  id: string;
  /** Interval in beats between each loop iteration */
  interval: number;
  /** Content to play on each loop */
  children: ReactNode;
};

/**
 * Loop component - plays its children repeatedly at the specified interval
 *
 * Children should use the useLoop() hook to register their audio callbacks,
 * which will be called with precise timing by the scheduler.
 *
 * @example
 * <Loop id="kick" interval={1}>
 *   <Note note="C2" />
 * </Loop>
 */
export function Loop({
  id,
  interval,
  children,
}: LoopProps) {
  const { scheduler } = useTrack();
  const callbacksRef = useRef<Map<string, ScheduleCallback>>(new Map());

  useEffect(() => {
    const loopId = id;
    const callbacks = callbacksRef.current;

    const runAllCallbacks: ScheduleCallback = (audioTime, beatTime) => {
      for (const callback of callbacks.values()) {
        callback(audioTime, beatTime);
      }
    };

    scheduler.addLoop(loopId, interval, runAllCallbacks);

    return () => {
      scheduler.remove(loopId);
    };
  }, [id, interval, scheduler]);

  const scheduleContextValue: ScheduleNoteContextValue = useMemo(
    () => ({
      scheduleNote: (noteId, callback) => {
        callbacksRef.current.set(noteId, callback);
      },
      unscheduleNote: (noteId) => {
        callbacksRef.current.delete(noteId);
      },
    }),
    [],
  );

  return (
    <ScheduleNoteContext.Provider value={scheduleContextValue}>
      {children}
    </ScheduleNoteContext.Provider>
  );
}
