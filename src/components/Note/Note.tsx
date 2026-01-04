import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "../Track.tsx";
import {
  ADSR_DEFAULTS,
  type ADSRProps,
  applyADSREnvelope,
} from "../../utils/envelope.ts";
import { noteToFrequency } from "../../utils/notes.ts";
import type { NoteName } from "../../types/music.ts";
import { type OscillatorType, useSynth } from "../Synth/index.ts";

type NoteProps = ADSRProps & {
  /** Note name (e.g., "A4", "C#3") or frequency in Hz */
  note: NoteName | number;
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
}: NoteProps) {
  const uniqueId = useId();
  const { audioContext, scheduler } = useTrack();
  const scheduleNote = useScheduleNote();
  const synthConfig = useSynth();

  // Use prop values if specified, otherwise use synth config
  const oscillatorType = type ?? synthConfig.oscillator;
  const filterCutoff = cutoff ?? synthConfig.filter.cutoff;
  const filterResonance = resonance ?? synthConfig.filter.resonance;
  const filterType = synthConfig.filter.type;
  const voiceCount = synthConfig.voices.count;
  const voiceDetune = synthConfig.voices.detune;
  const voiceSpread = synthConfig.voices.spread;

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
        amp / voiceCount, // Normalize amplitude across voices
        (beats) => scheduler.beatsToSeconds(beats),
      );

      // Create oscillators for each voice (for unison/detune effect)
      for (let i = 0; i < voiceCount; i++) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = oscillatorType;
        oscillator.frequency.value = frequency;

        // Apply detune spread across voices
        if (voiceCount > 1 && voiceDetune > 0) {
          // Spread detune evenly: -detune/2 to +detune/2
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
    };

    scheduleNote.scheduleNote(uniqueId, playNote, __stepIndex);
    return () => {
      scheduleNote.unscheduleNote(uniqueId);
    };
  }, [
    note,
    frequency,
    amp,
    oscillatorType,
    filterCutoff,
    filterResonance,
    filterType,
    voiceCount,
    voiceDetune,
    voiceSpread,
    adsrProps,
    audioContext,
    scheduler,
    scheduleNote,
    __stepIndex,
    uniqueId,
  ]);

  return null;
}
