/**
 * Note - Plays a single note using an oscillator with scheduler integration
 */
import { useEffect, useId } from "react";
import { useTrack } from "../Track.tsx";
import { useLoop } from "../Loop.tsx";
import { useSequence } from "../Sequence.tsx";
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
}: NoteProps): null {
  const uniqueId = useId();
  const { audioContext, beatsToSeconds } = useTrack();
  const loop = useLoop();
  const sequence = useSequence();

  // Convert note name to frequency if needed
  const frequency = typeof note === "number" ? note : noteToFrequency(note);
  const durationSec = beatsToSeconds(duration);

  useEffect(() => {
    // Function to play the note at a specific audio time
    const playNote = (audioTime: number) => {
      const endTime = audioTime + durationSec;
      const releaseStart = Math.max(audioTime + 0.01, endTime - release);

      // Create oscillator
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Envelope: attack -> sustain -> release
      gainNode.gain.setValueAtTime(0.001, audioTime);
      gainNode.gain.linearRampToValueAtTime(amp, audioTime + attack);
      gainNode.gain.setValueAtTime(amp, releaseStart);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      // Play
      oscillator.start(audioTime);
      oscillator.stop(endTime + 0.01);
    };

    // If inside a Sequence, register with the sequence
    if (sequence && __stepIndex !== undefined) {
      sequence.registerStep(__stepIndex, (audioTime: number) => {
        playNote(audioTime);
      });

      return () => {
        sequence.unregisterStep(__stepIndex);
      };
    }

    // TODO: this should be inside loop - extracting children and doing itt automatically
    // If inside a Loop (but not a Sequence), register directly with the loop
    if (loop) {
      loop.registerCallback(`note-${uniqueId}`, (audioTime: number) => {
        playNote(audioTime);
      });

      return () => {
        loop.unregisterCallback(`note-${uniqueId}`);
      };
    }

    // If not inside a Loop or Sequence, play immediately (one-shot)
    const now = audioContext.currentTime + 0.005;
    playNote(now);

    return () => {
      // Nothing to clean up for one-shot
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
    loop,
    sequence,
    __stepIndex,
    uniqueId,
  ]);

  return null;
}
