/**
 * Loop - Repeats its children at a regular interval using the scheduler
 *
 * This component registers a loop with the central scheduler, which handles
 * sample-accurate timing via the Web Audio API's clock.
 */
import {
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useTrack } from "./Track.tsx";
import type { ScheduleCallback } from "../audio/scheduler.ts";

interface LoopContextValue {
  /** Register a callback to be called on each loop iteration */
  registerCallback: (id: string, callback: ScheduleCallback) => void;
  /** Unregister a callback */
  unregisterCallback: (id: string) => void;
  /** The loop's interval in beats */
  interval: number;
}

const LoopContext = createContext<LoopContextValue | null>(null);

/**
 * Hook to access the parent loop context
 */
export function useLoop(): LoopContextValue | null {
  return useContext(LoopContext);
}

interface LoopProps {
  /** Unique identifier for this loop */
  id: string;
  /** Interval in beats between each loop iteration */
  interval: number;
  /** Content to play on each loop */
  children: ReactNode;
}

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
}: LoopProps): React.ReactElement {
  const { scheduler } = useTrack();
  const callbacksRef = useRef<Map<string, ScheduleCallback>>(new Map());

  useEffect(() => {
    const loopId = id;
    const callbacks = callbacksRef.current;

    // Create the master callback that calls all registered child callbacks
    const masterCallback: ScheduleCallback = (audioTime, beatTime) => {
      for (const callback of callbacks.values()) {
        callback(audioTime, beatTime);
      }
    };

    // Register the loop with the scheduler
    scheduler.addLoop(loopId, interval, masterCallback);

    return () => {
      scheduler.remove(loopId);
    };
  }, [id, interval, scheduler]);

  const contextValue: LoopContextValue = {
    registerCallback: (callbackId: string, callback: ScheduleCallback) => {
      callbacksRef.current.set(callbackId, callback);
    },
    unregisterCallback: (callbackId: string) => {
      callbacksRef.current.delete(callbackId);
    },
    interval,
  };

  return (
    <LoopContext.Provider value={contextValue}>{children}</LoopContext.Provider>
  );
}
