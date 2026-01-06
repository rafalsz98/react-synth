import { useEffect, useId } from "react";
import { useScheduleNote, useTrack } from "../Track.tsx";
import { loadSample } from "../../audio/sampleLoader.ts";
import type { SampleName } from "../../types/music.ts";
import { midiToFrequency } from "../../utils/notes.ts";

type SampleProps = {
  /** Sample name (without extension, e.g., "bd_haus") */
  name: SampleName;
  /** Amplitude/volume (default: 1) */
  amp?: number;
  /**
   * Filter cutoff as MIDI note number (Sonic Pi compatible)
   *
   * Common values:
   * - 60  => ~262 Hz (C4)
   * - 80  => ~831 Hz
   * - 100 => ~2637 Hz
   * - 110 => ~4699 Hz
   * - 130 => ~20kHz (essentially no filtering)
   */
  cutoff?: number;
  /** Playback rate multiplier (default: 1) */
  rate?: number;
  /** Stereo pan position from -1 (left) to 1 (right) (default: 0) */
  pan?: number;
  /** Step index when inside a Sequence (injected by Sequence) */
  __stepIndex?: number;
};

/**
 * Sample component - plays an audio sample file with optional effects
 *
 * @example
 * <Sample name="bd_haus" amp={2} cutoff={100} />
 * <Sample name="drum_cymbal_closed" amp={0.5} rate={1.5} pan={0.1} />
 */
export function Sample({
  name,
  amp = 1,
  cutoff,
  rate = 1,
  pan = 0,
  __stepIndex,
}: SampleProps) {
  const uniqueId = useId();
  const { audioContext } = useTrack();
  const scheduleNote = useScheduleNote();

  useEffect(() => {
    let buffer: AudioBuffer | null = null;

    loadSample(audioContext, name).then((loaded) => {
      buffer = loaded;
    });

    const playSample = (audioTime: number) => {
      if (!buffer) return;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;

      // Build audio graph: source -> [filter] -> [panner] -> gain -> destination
      let currentNode: AudioNode = source;

      if (cutoff !== undefined) {
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        // Convert MIDI note to Hz for Sonic Pi compatibility
        filter.frequency.value = midiToFrequency(cutoff);
        currentNode.connect(filter);
        currentNode = filter;
      }

      if (pan !== 0) {
        const panner = audioContext.createStereoPanner();
        panner.pan.value = pan;
        currentNode.connect(panner);
        currentNode = panner;
      }

      const gainNode = audioContext.createGain();
      gainNode.gain.value = amp;
      currentNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.start(audioTime);
    };

    scheduleNote.scheduleNote(uniqueId, playSample, __stepIndex);
    return () => {
      scheduleNote.unscheduleNote(uniqueId);
    };
  }, [
    audioContext,
    name,
    scheduleNote,
    uniqueId,
    __stepIndex,
    amp,
    cutoff,
    rate,
    pan,
  ]);

  return null;
}
