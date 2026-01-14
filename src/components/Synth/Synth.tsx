import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { SynthConfig, SynthOverrides, SynthType } from "./types";
import { DEFAULT_SYNTH_CONFIG, getSynthPreset } from "./presets";

const SynthContext = createContext<SynthConfig | null>(null);

type SynthProps = SynthOverrides & {
  type: SynthType;
  children: React.ReactNode;
};

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
 * // Overriding preset parameters with nested structure
 * <Synth type="prophet" filter={{ cutoff: 2000, resonance: 6 }}>
 *   <Chord notes="Am7" />
 * </Synth>
 *
 * @example
 * // Creating thick unison sound
 * <Synth type="saw" voices={{ count: 4, detune: 15, spread: 0.8 }}>
 *   <Sequence interval={0.25}>
 *     <Note note="A3" />
 *     <Note note="C4" />
 *   </Sequence>
 * </Synth>
 */
export function Synth({
  type,
  oscillator,
  filter,
  voices,
  children,
}: SynthProps): ReactNode {
  // Build configuration by starting with preset and applying overrides
  const config = useMemo<SynthConfig>(() => {
    const preset = getSynthPreset(type);

    return {
      oscillator: oscillator ?? preset.oscillator,
      filter: {
        type: filter?.type ?? preset.filter.type,
        cutoff: filter?.cutoff ?? preset.filter.cutoff,
        resonance: filter?.resonance ?? preset.filter.resonance,
      },
      voices: {
        count: voices?.count ?? preset.voices.count,
        detune: voices?.detune ?? preset.voices.detune,
        spread: voices?.spread ?? preset.voices.spread,
      },
    };
  }, [type, oscillator, filter, voices]);

  return (
    <SynthContext.Provider value={config}>
      {children}
    </SynthContext.Provider>
  );
}

export function useSynth(): SynthConfig {
  const ctx = useContext(SynthContext);
  return ctx ?? DEFAULT_SYNTH_CONFIG;
}
