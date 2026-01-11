import { Chord } from "../src/components/Chord.tsx";
import {
  Loop,
  Note,
  Sample,
  Sequence,
  Synth,
  Track,
} from "../src/components/index.ts";
import type { NoteName } from "../src/types/music.ts";

export default function SimpleSong() {
  const patterns: [string, string, string, string][] = [
    ["A1", "A2", "E2", "A2"], // a1: root, +12, +7, +12
    ["G1", "G2", "D2", "G2"], // g1: root, +12, +7, +12
    ["F1", "F2", "C2", "F2"], // f1: root, +12, +7, +12
    ["E1", "E2", "B1", "E2"], // e1: root, +12, +7, +12
  ];

  return (
    <Track bpm={113}>
      <Loop id="kick" interval={1}>
        <Sample name="bd_haus" amp={2} cutoff={100} />
      </Loop>

      <Loop id="click" interval={2}>
        <Sequence interval={0.25}>
          {[...Array(4)].map((_, i) => (
            <Sample
              key={i}
              name="drum_cymbal_closed"
              amp={0.5}
              rate={1.5}
              pan={0.1}
            />
          ))}
        </Sequence>
      </Loop>

      <Loop id="giorgio_arp" interval={16}>
        <Synth type="prophet">
          <Sequence interval={4}>
            {patterns.map((pattern, idx) => (
              <Sequence key={idx} interval={0.25}>
                {[...Array(16)].map((_, i) => {
                  // Global step index across all 64 notes (4 patterns × 16 notes)
                  // This makes the cutoff filter sweep continuously like Sonic Pi's .tick(:filter)
                  const globalStep = idx * 16 + i;
                  return (
                    <Note
                      key={i}
                      note={pattern[i % pattern.length] as NoteName}
                      release={0.2}
                      filter={{
                        cutoff: {
                          from: 60,
                          to: 110,
                          steps: 16,
                          mirror: true,
                          step: globalStep,
                        },
                        resonance: 0.8,
                      }}
                      amp={2}
                    />
                  );
                })}
              </Sequence>
            ))}
          </Sequence>
        </Synth>
      </Loop>

      <Loop id="pads" interval={16}>
        <Synth type="hollow">
          <Sequence interval={4}>
            <Chord notes={["A3", "C4", "E4"]} release={4} amp={0.5} />
            <Chord notes={["G3", "B3", "D4"]} release={4} amp={0.5} />
            <Chord notes={["F3", "A3", "C4"]} release={4} amp={0.5} />
            <Chord notes={["E3", "G3", "B3"]} release={4} amp={0.5} />
          </Sequence>
        </Synth>
      </Loop>
      <Loop id="test" interval={2}>
        <Chord notes={["A##2", "F1", "C4"]} amp={1} />
      </Loop>
    </Track>
  );
}
