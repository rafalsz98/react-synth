import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "./Track.tsx";
import {
  ADSR_DEFAULTS,
  type ADSRProps,
  applyADSREnvelope,
} from "../utils/envelope.ts";
import { noteToFrequency, resolveChordNotes } from "../utils/notes.ts";
import type { NoteName } from "../types/music.ts";
import { type OscillatorType, useSynth } from "./Synth/index.ts";

type ChordProps = ADSRProps & {
  /**
   * Chord specification - can be:
   * - A chord name string (e.g., "Cmaj7", "Am", "F#m7", "Dm/F")
   * - An array of note names (e.g., ["A4", "C#3", "E4"])
   * - An array of frequencies in Hz (e.g., [440, 550, 660])
   *
   * When using chord names, specify the octave with a colon (e.g., "Cmaj7:4" for octave 4)
   * Default octave is 3 if not specified.
   */
  notes: string | (NoteName | number)[];
  /** Amplitude 0-1 (default: 0.3) */
  amp?: number;
  /**
   * Oscillator type - overrides synth config if specified
   * When inside a Synth component, this defaults to the synth's oscillator type
   */
  type?: OscillatorType;
  /** Filter cutoff - overrides synth config if specified */
  cutoff?: number;
  /** Filter resonance - overrides synth config if specified */
  resonance?: number;
  /** Step index when inside a Sequence (injected by Sequence) */
  __stepIndex?: number;
};

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
 * // Using chord names (powered by Tonal)
 * <Chord notes="Cmaj7" amp={0.5} />
 * <Chord notes="Am:4" type="sawtooth" />  // A minor in octave 4
 * <Chord notes="Dm7/F" release={2} />     // D minor 7 with F bass
 *
 * // Using note arrays
 * <Chord notes={["a3", "c4", "e4"]} amp={0.5} attack={0.1} sustain={2} release={0.5} />
 * <Chord notes={[440, 550, 660]} type="sawtooth" decay={0.2} sustain_level={0.7} />
 */
export function Chord({
  notes,
  amp = 0.3,
  type,
  cutoff,
  resonance,
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
  const synthConfig = useSynth();

  // Use prop values if specified, otherwise use synth config
  const oscillatorType = type ?? synthConfig.oscillator;
  const filterCutoff = cutoff ?? synthConfig.filter.cutoff;
  const filterResonance = resonance ?? synthConfig.filter.resonance;
  const filterType = synthConfig.filter.type;
  const voiceCount = synthConfig.voices.count;
  const voiceDetune = synthConfig.voices.detune;
  const voiceSpread = synthConfig.voices.spread;

  const resolvedNotes = resolveChordNotes(notes);
  const frequencies = resolvedNotes.map((note) =>
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

  // Total number of oscillators = chord notes × voices per note
  const totalOscillators = frequencies.length * voiceCount;

  useEffect(() => {
    const playChord = (audioTime: number) => {
      const gainNode = audioContext.createGain();

      // Create filter if cutoff is below maximum (20000 Hz)
      if (filterCutoff < 20000) {
        const filter = audioContext.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterCutoff;
        filter.Q.value = filterResonance;
        gainNode.connect(filter);
        filter.connect(audioContext.destination);
      } else {
        gainNode.connect(audioContext.destination);
      }

      const endTime = applyADSREnvelope(
        gainNode,
        audioTime,
        adsrProps,
        amp / totalOscillators, // Normalize amplitude across all oscillators
        (beats) => scheduler.beatsToSeconds(beats),
      );

      // Create oscillators for each chord note
      for (const frequency of frequencies) {
        // Create voices for each note (for unison/detune effect)
        for (let i = 0; i < voiceCount; i++) {
          const oscillator = audioContext.createOscillator();
          oscillator.type = oscillatorType;
          oscillator.frequency.value = frequency;

          // Apply detune spread across voices
          if (voiceCount > 1 && voiceDetune > 0) {
            const detuneOffset = (i / (voiceCount - 1) - 0.5) * voiceDetune;
            oscillator.detune.value = detuneOffset;
          }

          // Apply stereo spread if multiple voices
          if (voiceCount > 1 && voiceSpread > 0) {
            const panner = audioContext.createStereoPanner();
            const panValue = (i / (voiceCount - 1) - 0.5) * 2 * voiceSpread;
            panner.pan.value = panValue;
            oscillator.connect(panner);
            panner.connect(gainNode);
          } else {
            oscillator.connect(gainNode);
          }

          oscillator.start(audioTime);
          oscillator.stop(endTime + 0.01);
        }
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
    oscillatorType,
    filterCutoff,
    filterResonance,
    filterType,
    voiceCount,
    voiceDetune,
    voiceSpread,
    totalOscillators,
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
