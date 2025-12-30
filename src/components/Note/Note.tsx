import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "../Track.tsx";
import {
  ADSR_DEFAULTS,
  type ADSRProps,
  applyADSREnvelope,
} from "../../utils/envelope.ts";
import { noteToFrequency } from "./utils.ts";

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

interface NoteProps extends ADSRProps {
  /** Note name (e.g., "A4", "C#3") or frequency in Hz */
  note: string | number;
  /** Amplitude 0-1 (default: 0.3) */
  amp?: number;
  /** Oscillator type (default: "sine") */
  type?: OscillatorType;
  /** Step index when inside a Sequence (injected by Sequence) */
  __stepIndex?: number;
}

/**
 * Note component - plays a note using Web Audio oscillator with ADSR envelope
 *
 * When used inside a Loop or Sequence, the note will be scheduled
 * with sample-accurate timing via the scheduler.
 *
 * The note duration is determined by the ADSR envelope:
 * total duration = attack + decay + sustain + release
 *
 * @example
 * <Note note="A4" amp={0.5} attack={0.1} sustain={0.5} release={0.2} />
 * <Note note={440} type="sawtooth" attack={0.05} decay={0.1} sustain_level={0.7} />
 */
export function Note({
  note,
  amp = 0.3,
  type = "sine",
  attack = ADSR_DEFAULTS.attack,
  attack_level = ADSR_DEFAULTS.attack_level,
  decay = ADSR_DEFAULTS.decay,
  decay_level,
  sustain = ADSR_DEFAULTS.sustain,
  sustain_level = ADSR_DEFAULTS.sustain_level,
  release = ADSR_DEFAULTS.release,
  __stepIndex,
}: NoteProps) {
  const uniqueId = useId();
  const { audioContext, scheduler } = useTrack();
  const scheduleNote = useScheduleNote();

  const frequency = typeof note === "number" ? note : noteToFrequency(note);
  const adsrProps = {
    attack,
    attack_level,
    decay,
    decay_level,
    sustain,
    sustain_level,
    release,
  };

  useEffect(() => {
    const playNote = (audioTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const endTime = applyADSREnvelope(
        gainNode,
        audioTime,
        adsrProps,
        amp,
        (beats) => scheduler.beatsToSeconds(beats),
      );

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
    amp,
    type,
    adsrProps,
    audioContext,
    scheduler,
    scheduleNote,
    __stepIndex,
    uniqueId,
  ]);

  return null;
}
