import React, {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import {
  ScheduleNoteContext,
  type ScheduleNoteContextValue,
  useScheduleNote,
  useTrack,
} from "./Track.tsx";
import type { ScheduleCallback } from "../audio/scheduler.ts";

type SequenceProps = {
  /** Time interval between each child in beats */
  interval: number;
  /** Children to play in sequence */
  children: ReactNode;
  /** Step index when nested inside another Sequence (injected by parent Sequence) */
  __stepIndex?: number;
};

/**
 * Sequence component - plays children one after another with precise timing
 *
 * @example
 * <Sequence interval={0.25}>
 *   <Note note="C4" />
 *   <Note note="E4" />
 *   <Note note="G4" />
 * </Sequence>
 */
export function Sequence({
  interval,
  children,
  __stepIndex,
}: SequenceProps): ReactNode {
  const uniqueId = useId();
  const { scheduler } = useTrack();
  const { scheduleNote, unscheduleNote } = useScheduleNote();
  const childArray = Children.toArray(children);
  const totalSteps = childArray.length;

  // Store step callbacks (keyed by step index)
  const stepCallbacks = React.useRef<Map<number, ScheduleCallback>>(new Map());
  // Map from note ID to step index (for unscheduling)
  const idToStepIndex = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const sequenceCallback: ScheduleCallback = (audioTime, beatTime) => {
      for (let i = 0; i < totalSteps; i++) {
        const stepOffset = scheduler.beatsToSeconds(i * interval);
        const stepAudioTime = audioTime + stepOffset;
        const stepBeatTime = beatTime + i * interval;

        const callback = stepCallbacks.current.get(i);
        if (callback) {
          callback(stepAudioTime, stepBeatTime);
        }
      }
    };

    scheduleNote(`seq-${uniqueId}`, sequenceCallback, __stepIndex);

    return () => {
      unscheduleNote(`seq-${uniqueId}`);
    };
  }, [
    interval,
    totalSteps,
    scheduler,
    uniqueId,
    scheduleNote,
    unscheduleNote,
    __stepIndex,
  ]);

  // Scheduling context for Notes inside this Sequence
  const scheduleContextValue: ScheduleNoteContextValue = useMemo(
    () => ({
      scheduleNote: (noteId, callback, stepIndex) => {
        if (stepIndex !== undefined) {
          idToStepIndex.current.set(noteId, stepIndex);
          stepCallbacks.current.set(stepIndex, callback);
        }
      },
      unscheduleNote: (noteId) => {
        const stepIndex = idToStepIndex.current.get(noteId);
        if (stepIndex !== undefined) {
          stepCallbacks.current.delete(stepIndex);
          idToStepIndex.current.delete(noteId);
        }
      },
    }),
    [],
  );

  // Clone children with their step index
  const childrenWithIndex = childArray.map((child, index) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        key: `step-${index}`,
        __stepIndex: index,
      } as Record<string, unknown>);
    }
    return child;
  });

  return (
    <ScheduleNoteContext.Provider value={scheduleContextValue}>
      {childrenWithIndex}
    </ScheduleNoteContext.Provider>
  );
}
