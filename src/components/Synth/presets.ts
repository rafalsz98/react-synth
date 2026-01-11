import type { SynthConfig, SynthType } from "./types.ts";

export const SYNTH_PRESETS: Record<SynthType, SynthConfig> = {
  /**
   * Pure sine wave - clean, fundamental tone
   */
  sine: {
    oscillator: "sine",
    filter: { type: "lowpass", cutoff: 135.08, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Sawtooth wave - bright, harmonically rich
   */
  saw: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 135.08, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Square wave - hollow, clarinet-like
   */
  square: {
    oscillator: "square",
    filter: { type: "lowpass", cutoff: 135.08, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Triangle wave - soft, flute-like
   */
  tri: {
    oscillator: "triangle",
    filter: { type: "lowpass", cutoff: 135.08, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Prophet - Sequential Circuits Prophet-5 inspired
   * Warm analog sound with detuned voices and resonant filter
   * Great for leads and pads
   */
  prophet: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 102.23, resonance: 4 },
    voices: { count: 3, detune: 12, spread: 0.5 },
  },

  /**
   * Hollow - Ethereal pad sound
   * Filtered square wave with soft resonance
   * Good for atmospheric backgrounds
   */
  hollow: {
    oscillator: "square",
    filter: { type: "bandpass", cutoff: 86.37, resonance: 2 },
    voices: { count: 2, detune: 8, spread: 0.7 },
  },

  /**
   * Dark Ambience - Deep atmospheric pad
   * Low-passed sawtooth with multiple detuned voices
   */
  dark_ambience: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 79.35, resonance: 3 },
    voices: { count: 4, detune: 15, spread: 0.8 },
  },

  /**
   * Bass - Punchy bass sound
   * Filtered sawtooth with slight detune for thickness
   */
  bass: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 74.37, resonance: 5 },
    voices: { count: 2, detune: 5, spread: 0.2 },
  },

  /**
   * Pluck - Bright plucked string sound
   * Square wave with high cutoff for attack brightness
   */
  pluck: {
    oscillator: "square",
    filter: { type: "lowpass", cutoff: 111.08, resonance: 2 },
    voices: { count: 2, detune: 6, spread: 0.3 },
  },
};

export function getSynthPreset(type: SynthType): SynthConfig {
  return SYNTH_PRESETS[type];
}

export const DEFAULT_SYNTH_CONFIG: SynthConfig = SYNTH_PRESETS.sine;
