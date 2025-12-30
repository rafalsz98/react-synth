import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "./Track.tsx";
import {
  ADSR_DEFAULTS,
  type ADSRProps,
  applyADSREnvelope,
} from "../utils/envelope.ts";
import { noteToFrequency } from "./Note/utils.ts";

type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

interface ChordProps extends ADSRProps {
  /** Array of note names (e.g., ["A4", "C#3", "E4"]) or frequencies in Hz */
  notes: (string | number)[];
  /** Amplitude 0-1 (default: 0.3) */
  amp?: number;
  /** Oscillator type (default: "sine") */
  type?: OscillatorType;
  /** Step index when inside a Sequence (injected by Sequence) */
  __stepIndex?: number;
}

/**
 * Chord component - plays multiple notes simultaneously using Web Audio oscillators
 *
 * When used inside a Loop or Sequence, the chord will be scheduled
 * with sample-accurate timing via the scheduler.
 *
 * The chord duration is determined by the ADSR envelope:
 * total duration = attack + decay + sustain + release
 *
 * @example
 * <Chord notes={["a3", "c4", "e4"]} amp={0.5} attack={0.1} sustain={2} release={0.5} />
 * <Chord notes={[440, 550, 660]} type="sawtooth" decay={0.2} sustain_level={0.7} />
 */
export function Chord({
  notes,
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
}: ChordProps) {
  const uniqueId = useId();
  const { audioContext, scheduler } = useTrack();
  const { scheduleNote, unscheduleNote } = useScheduleNote();

  const frequencies = notes.map((note) =>
    typeof note === "number" ? note : noteToFrequency(note)
  );
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
    const playChord = (audioTime: number) => {
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);

      const endTime = applyADSREnvelope(
        gainNode,
        audioTime,
        adsrProps,
        amp,
        (beats) => scheduler.beatsToSeconds(beats),
      );

      // Create one oscillator per note, all connected to the shared gain node
      for (const frequency of frequencies) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        oscillator.start(audioTime);
        oscillator.stop(endTime + 0.01);
      }
    };

    scheduleNote(uniqueId, playChord, __stepIndex);
    return () => {
      unscheduleNote(uniqueId);
    };
  }, [
    notes,
    frequencies,
    amp,
    type,
    adsrProps,
    audioContext,
    scheduler,
    scheduleNote,
    unscheduleNote,
    __stepIndex,
    uniqueId,
  ]);

  return null;
}
