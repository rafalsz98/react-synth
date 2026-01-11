export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

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
 * Cutoff value that can be either a static number or a dynamic line pattern
 */
export type CutoffType =
  | number
  | {
    /** Starting value (MIDI note number) */
    from: number;
    /** Ending value (MIDI note number) */
    to: number;
    /** Number of interpolation steps */
    steps: number;
    /** Whether to mirror the values (up then down) */
    mirror?: boolean;
    /**
     * Manual step index override.
     * Use this when you need a global step counter across nested sequences.
     * If omitted, uses __stepIndex from the parent Sequence.
     */
    step?: number;
  };

/**
 * Configuration for the synthesizer's filter
 */
export type FilterConfig = {
  /** Filter type */
  type: FilterType;
  /** Cutoff type */
  cutoff: CutoffType;
  /** Resonance/Q factor */
  resonance: number;
};

/**
 * Configuration for oscillator voices (for unison/detune effects)
 */
export type VoiceConfig = {
  /** Number of oscillator voices */
  count: number;
  /** Detune spread in cents between voices */
  detune: number;
  /** Stereo spread for voices 0-1 */
  spread: number;
};

export type SynthConfig = {
  /** Oscillator waveform type */
  oscillator: OscillatorType;
  /** Filter configuration */
  filter: FilterConfig;
  /** Voice/unison configuration */
  voices: VoiceConfig;
};

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

export type SynthOverrides = {
  oscillator?: OscillatorType;
  filter?: Partial<FilterConfig>;
  voices?: Partial<VoiceConfig>;
};
