/**
 * Synth component types
 *
 * These types define the configuration options for synthesizers,
 * inspired by Sonic Pi's synth definitions.
 */

/**
 * Available oscillator waveforms
 */
export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

/**
 * Filter types available in Web Audio
 */
export type FilterType =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "lowshelf"
  | "highshelf"
  | "peaking"
  | "notch"
  | "allpass";

/**
 * Configuration for the synthesizer's filter
 */
export type FilterConfig = {
  /** Filter type (default: "lowpass") */
  type: FilterType;
  /** Cutoff frequency in Hz (default: 20000 - no filtering) */
  cutoff: number;
  /** Resonance/Q factor (default: 1) */
  resonance: number;
};

/**
 * Configuration for oscillator voices (for unison/detune effects)
 */
export type VoiceConfig = {
  /** Number of oscillator voices (default: 1) */
  count: number;
  /** Detune spread in cents between voices (default: 0) */
  detune: number;
  /** Stereo spread for voices 0-1 (default: 0) */
  spread: number;
};

/**
 * Complete synthesizer configuration
 */
export type SynthConfig = {
  /** Oscillator waveform type */
  oscillator: OscillatorType;
  /** Filter configuration */
  filter: FilterConfig;
  /** Voice/unison configuration */
  voices: VoiceConfig;
};

/**
 * Named synth types inspired by Sonic Pi
 */
export type SynthType =
  | "sine"
  | "saw"
  | "square"
  | "tri"
  | "prophet"
  | "hollow"
  | "dark_ambience"
  | "bass"
  | "pluck";

/**
 * Common synth overrides used by Synth, Note, and Chord components
 */
export type SynthOverrides = {
  /** Override the oscillator type */
  oscillator?: OscillatorType;
  /** Override filter settings */
  filter?: Partial<FilterConfig>;
  /** Override voice/unison settings */
  voices?: Partial<VoiceConfig>;
};
