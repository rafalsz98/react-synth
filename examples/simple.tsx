/**
 * Simple Example - A basic melody to test React Synth
 *
 * This demonstrates the lookahead scheduler for sample-accurate timing.
 */
import { Chord } from "../src/components/Chord.tsx";
import {
  Loop,
  Note,
  Sample,
  Sequence,
  Synth,
  Track,
} from "../src/components/index.ts";
import { NoteName } from "../src/types/music.ts";

export default function SimpleSong() {
  const patterns: [string, string, string, string][] = [
    ["A1", "A2", "E2", "A2"], // a1: root, +12, +7, +12
    ["G1", "G2", "D2", "G2"], // g1: root, +12, +7, +12
    ["F1", "F2", "C2", "F2"], // f1: root, +12, +7, +12
    ["E1", "E2", "B1", "E2"], // e1: root, +12, +7, +12
  ];

  return (
    <Track bpm={113}>
      {
        /* <Loop id="kick" interval={1}>
        <Sample name="bd_haus" amp={2} cutoff={4000} />
      </Loop> */
      }

      {
        /* <Loop id="click" interval={2}>
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
      </Loop> */
      }

      <Loop id="giorgio_arp" interval={16}>
        <Synth type="prophet">
          <Sequence interval={4}>
            {patterns.map((pattern, idx) => (
              <Sequence key={idx} interval={0.25}>
                {[...Array(16)].map((_, i) => (
                  <Note
                    key={i}
                    note={pattern[i % pattern.length] as NoteName}
                    release={0.2}
                    amp={1.5}
                  />
                ))}
              </Sequence>
            ))}
          </Sequence>
        </Synth>
      </Loop>
    </Track>
  );
}
