/**
 * Track - The root component that sets BPM and provides audio context + scheduler
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { type Scheduler, getScheduler } from "../audio/scheduler.ts";
import type { AudioContext as AudioContextType } from "node-web-audio-api";

interface TrackContextValue {
  bpm: number;
  audioContext: AudioContextType;
  scheduler: Scheduler;
}

const TrackContext = createContext<TrackContextValue | null>(null);

/**
 * Hook to access the track context from child components
 */
export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) {
    throw new Error("useTrack must be used inside a <Track> component");
  }
  return ctx;
}

interface TrackProps {
  bpm: number;
  children: ReactNode;
}

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
export function Track({ bpm, children }: TrackProps): React.ReactElement {
  const scheduler = useRef<Scheduler>(getScheduler(bpm));

  // Initialize scheduler
  useEffect(() => {
    // Start the scheduler when Track mounts
    scheduler.current.start();

    return () => {
      // Don't stop on unmount to survive hot reloads
      // scheduler.stop();
    };
  }, [scheduler]);

  const contextValue: TrackContextValue = {
    bpm,
    audioContext: scheduler.current.audioContext,
    scheduler: scheduler.current,
  };

  return (
    <TrackContext.Provider value={contextValue}>
      {children}
    </TrackContext.Provider>
  );
}
