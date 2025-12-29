/**
 * Sequence - Plays children one after another with precise timing
 *
 * When used inside a Loop, the sequence schedules each child at the
 * appropriate offset within the loop interval.
 */
import React, {
  useEffect,
  useId,
  createContext,
  useContext,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
} from "react";
import { useTrack } from "./Track.tsx";
import { useLoop } from "./Loop.tsx";
import type { ScheduleCallback } from "../audio/scheduler.ts";

interface SequenceContextValue {
  /** Register a callback for a specific step in the sequence */
  registerStep: (stepIndex: number, callback: ScheduleCallback) => void;
  /** Unregister a step callback */
  unregisterStep: (stepIndex: number) => void;
  /** The interval between steps in beats */
  stepInterval: number;
  /** Total number of steps */
  totalSteps: number;
}

const SequenceContext = createContext<SequenceContextValue | null>(null);

/**
 * Hook to access the parent sequence context
 */
export function useSequence(): SequenceContextValue | null {
  return useContext(SequenceContext);
}

interface SequenceProps {
  /** Time interval between each child in beats */
  interval: number;
  /** Children to play in sequence */
  children: ReactNode;
}

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
}: SequenceProps): React.ReactElement {
  const uniqueId = useId();
  const { scheduler } = useTrack();
  const loop = useLoop();
  const childArray = Children.toArray(children);
  const totalSteps = childArray.length;

  // Store step callbacks
  const stepCallbacks = React.useRef<Map<number, ScheduleCallback>>(new Map());

  useEffect(() => {
    if (!loop) {
      // If not inside a loop, we need to handle scheduling differently
      // For now, just schedule as one-shot events
      return;
    }

    // Register a single callback with the parent loop that handles all steps
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

    loop.registerCallback(`seq-${uniqueId}`, sequenceCallback);

    return () => {
      loop.unregisterCallback(`seq-${uniqueId}`);
    };
  }, [loop, interval, totalSteps, scheduler, uniqueId]);

  const contextValue: SequenceContextValue = {
    registerStep: (stepIndex: number, callback: ScheduleCallback) => {
      stepCallbacks.current.set(stepIndex, callback);
    },
    unregisterStep: (stepIndex: number) => {
      stepCallbacks.current.delete(stepIndex);
    },
    stepInterval: interval,
    totalSteps,
  };

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
    <SequenceContext.Provider value={contextValue}>
      {childrenWithIndex}
    </SequenceContext.Provider>
  );
}
