/**
 * Synth component - wraps children with synthesizer configuration
 *
 * The Synth component provides a context that Note and Chord components
 * use to configure their oscillators, filters, and voice settings.
 *
 * Inspired by Sonic Pi's synth system, this allows you to define
 * the "instrument" that plays your notes.
 */

import { createContext, useContext, useMemo } from "react";
import type { SynthConfig, SynthProps } from "./types.ts";
import { DEFAULT_SYNTH_CONFIG, getSynthPreset } from "./presets.ts";

/**
 * Context for synth configuration
 */
const SynthContext = createContext<SynthConfig | null>(null);

/**
 * Synth component - defines the synthesizer for child Note/Chord components
 *
 * @example
 * // Using a preset synth type
 * <Synth type="prophet">
 *   <Note note="C4" />
 * </Synth>
 *
 * @example
 * // Overriding preset parameters
 * <Synth type="prophet" cutoff={2000} resonance={6}>
 *   <Chord notes="Am7" />
 * </Synth>
 *
 * @example
 * // Creating thick unison sound
 * <Synth type="saw" voices={4} detune={15} spread={0.8}>
 *   <Sequence interval={0.25}>
 *     <Note note="A3" />
 *     <Note note="C4" />
 *   </Sequence>
 * </Synth>
 */
export function Synth({
  type,
  oscillator,
  cutoff,
  resonance,
  voices,
  detune,
  spread,
  children,
}: SynthProps) {
  // Build configuration by starting with preset and applying overrides
  const config = useMemo<SynthConfig>(() => {
    const preset = getSynthPreset(type);

    return {
      oscillator: oscillator ?? preset.oscillator,
      filter: {
        type: preset.filter.type,
        cutoff: cutoff ?? preset.filter.cutoff,
        resonance: resonance ?? preset.filter.resonance,
      },
      voices: {
        count: voices ?? preset.voices.count,
        detune: detune ?? preset.voices.detune,
        spread: spread ?? preset.voices.spread,
      },
    };
  }, [type, oscillator, cutoff, resonance, voices, detune, spread]);

  return (
    <SynthContext.Provider value={config}>
      {children}
    </SynthContext.Provider>
  );
}

/**
 * Hook to access synth configuration from within Note/Chord components
 */
export function useSynth() {
  const ctx = useContext(SynthContext);
  return ctx ?? DEFAULT_SYNTH_CONFIG;
}
