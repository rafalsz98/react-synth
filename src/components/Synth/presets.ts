/**
 * Synth presets inspired by Sonic Pi's synthesizer definitions
 *
 * Each preset defines oscillator type, filter settings, and voice configuration
 * to create distinct sonic characteristics.
 */

import type { SynthConfig, SynthType } from "./types.ts";

/**
 * Synth presets mapped by type name
 */
export const SYNTH_PRESETS: Record<SynthType, SynthConfig> = {
  /**
   * Pure sine wave - clean, fundamental tone
   */
  sine: {
    oscillator: "sine",
    filter: { type: "lowpass", cutoff: 20000, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Sawtooth wave - bright, harmonically rich
   */
  saw: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 20000, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Square wave - hollow, clarinet-like
   */
  square: {
    oscillator: "square",
    filter: { type: "lowpass", cutoff: 20000, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Triangle wave - soft, flute-like
   */
  tri: {
    oscillator: "triangle",
    filter: { type: "lowpass", cutoff: 20000, resonance: 1 },
    voices: { count: 1, detune: 0, spread: 0 },
  },

  /**
   * Prophet - Sequential Circuits Prophet-5 inspired
   * Warm analog sound with detuned voices and resonant filter
   * Great for leads and pads
   */
  prophet: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 3000, resonance: 4 },
    voices: { count: 3, detune: 12, spread: 0.5 },
  },

  /**
   * Hollow - Ethereal pad sound
   * Filtered square wave with soft resonance
   * Good for atmospheric backgrounds
   */
  hollow: {
    oscillator: "square",
    filter: { type: "bandpass", cutoff: 1200, resonance: 2 },
    voices: { count: 2, detune: 8, spread: 0.7 },
  },

  /**
   * Dark Ambience - Deep atmospheric pad
   * Low-passed sawtooth with multiple detuned voices
   */
  dark_ambience: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 800, resonance: 3 },
    voices: { count: 4, detune: 15, spread: 0.8 },
  },

  /**
   * Bass - Punchy bass sound
   * Filtered sawtooth with slight detune for thickness
   */
  bass: {
    oscillator: "sawtooth",
    filter: { type: "lowpass", cutoff: 600, resonance: 5 },
    voices: { count: 2, detune: 5, spread: 0.2 },
  },

  /**
   * Pluck - Bright plucked string sound
   * Square wave with high cutoff for attack brightness
   */
  pluck: {
    oscillator: "square",
    filter: { type: "lowpass", cutoff: 5000, resonance: 2 },
    voices: { count: 2, detune: 6, spread: 0.3 },
  },
};

/**
 * Get a synth preset by type name
 */
export function getSynthPreset(type: SynthType): SynthConfig {
  return SYNTH_PRESETS[type];
}

/**
 * Default synth configuration (sine wave, no filtering)
 */
export const DEFAULT_SYNTH_CONFIG: SynthConfig = SYNTH_PRESETS.sine;
