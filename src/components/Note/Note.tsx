import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "../Track.tsx";
import { noteToFrequency } from "./utils.ts";

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

interface NoteProps {
  /** Note name (e.g., "A4", "C#3") or frequency in Hz */
  note: string | number;
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
 * Note component - plays a note using Web Audio oscillator
 *
 * When used inside a Loop or Sequence, the note will be scheduled
 * with sample-accurate timing via the scheduler.
 *
 * @example
 * <Note note="A4" duration={0.5} amp={0.5} />
 * <Note note={440} type="sawtooth" />
 */
export function Note({
  note,
  duration = 0.5,
  amp = 0.3,
  type = "sine",
  attack = 0.01,
  release = 0.1,
  __stepIndex,
}: NoteProps) {
  const uniqueId = useId();
  const { audioContext, scheduler } = useTrack();
  const scheduleNote = useScheduleNote();

  const frequency = typeof note === "number" ? note : noteToFrequency(note);
  const durationSec = scheduler.beatsToSeconds(duration);

  useEffect(() => {
    const playNote = (audioTime: number) => {
      const endTime = audioTime + durationSec;
      const releaseStart = Math.max(audioTime + 0.01, endTime - release);

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0.001, audioTime);
      gainNode.gain.linearRampToValueAtTime(amp, audioTime + attack);
      gainNode.gain.setValueAtTime(amp, releaseStart);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      oscillator.start(audioTime);
      oscillator.stop(endTime + 0.01);
    };

    scheduleNote.scheduleNote(uniqueId, playNote, __stepIndex);
    return () => {
      scheduleNote.unscheduleNote(uniqueId);
    };
  }, [
    note,
    frequency,
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
