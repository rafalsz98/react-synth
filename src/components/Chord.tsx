import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "./Track.tsx";
import { noteToFrequency } from "./Note/utils.ts";

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

interface ChordProps {
  /** Array of note names (e.g., ["A4", "C#3", "E4"]) or frequencies in Hz */
  notes: (string | number)[];
  /** Duration in beats (default: 0.5) */
  duration?: number;
  /** Amplitude 0-1 (default: 0.3) */
  amp?: number;
  /** Oscillator type (default: "sine") */
  type?: OscillatorType;
  /** Attack time in seconds (default: 0.01) */
  attack?: number;
  /** Release time in seconds (default: 0.1) */
  release?: number;
  /** Step index when inside a Sequence (injected by Sequence) */
  __stepIndex?: number;
}

/**
 * Chord component - plays multiple notes simultaneously using Web Audio oscillators
 *
 * When used inside a Loop or Sequence, the chord will be scheduled
 * with sample-accurate timing via the scheduler.
 *
 * @example
 * <Chord notes={["a3", "c4", "e4"]} duration={4} amp={0.5} />
 * <Chord notes={[440, 550, 660]} type="sawtooth" />
 */
export function Chord({
  notes,
  duration = 0.5,
  amp = 0.3,
  type = "sine",
  attack = 0.01,
  release = 0.1,
  __stepIndex,
}: ChordProps) {
  const uniqueId = useId();
  const { audioContext, scheduler } = useTrack();
  const { scheduleNote, unscheduleNote } = useScheduleNote();

  const frequencies = notes.map((note) =>
    typeof note === "number" ? note : noteToFrequency(note)
  );
  const durationSec = scheduler.beatsToSeconds(duration);

  useEffect(() => {
    const playChord = (audioTime: number) => {
      const endTime = audioTime + durationSec;
      const releaseStart = Math.max(audioTime + 0.01, endTime - release);

      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      // Create one oscillator per note, all connected to the shared gain node
      for (const frequency of frequencies) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        oscillator.start(audioTime);
        oscillator.stop(endTime + 0.01);
      }

      // Single envelope for all oscillators
      gainNode.gain.setValueAtTime(0.001, audioTime);
      gainNode.gain.linearRampToValueAtTime(amp, audioTime + attack);
      gainNode.gain.setValueAtTime(amp, releaseStart);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
    };

    scheduleNote(uniqueId, playChord, __stepIndex);
    return () => {
      unscheduleNote(uniqueId);
    };
  }, [
    notes,
    frequencies,
    duration,
    durationSec,
    amp,
    type,
    attack,
    release,
    audioContext,
    scheduleNote,
    __stepIndex,
    uniqueId,
  ]);

  return null;
}
