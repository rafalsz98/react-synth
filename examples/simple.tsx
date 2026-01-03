/**
 * Simple Example - A basic melody to test React Synth
 *
 * This demonstrates the lookahead scheduler for sample-accurate timing.
 */
import { Chord } from "../src/components/Chord.tsx";
import { Loop, Note, Sequence, Track } from "../src/components/index.ts";

export default function SimpleSong() {
  return (
    <Track bpm={113}>
      {/* Simple kick drum pattern - plays every beat */}
      {
        /* <Loop id="kick" interval={1}>
        <Note note="C2" duration={0.2} amp={0.5} type="sine" />
      </Loop> */
      }

      <Loop interval={4} id="chord">
        {/* <Note note="a3" /> */}
        <Chord
          notes={["e3", "g3", "b3"]}
          release={7}
          amp={0.5}
        />
      </Loop>

      {/* Hi-hat pattern - plays every half beat */}
      {
        /* <Loop id="hihat" interval={1}>
        <Note note="C6" duration={0.05} amp={0.1} type="sine" />
      </Loop> */
      }

      {/* Melody arpeggio - plays a sequence every 2 beats */}
      {/* <Loop id="melody" interval={3}> */}
      {
        /* <Sequence interval={0.25}>
          <Note note="C4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="E4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="G4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="B4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="C5" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="B4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="G4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="E4" duration={0.2} type="sawtooth" amp={0.15} />
        </Sequence> */
      }
      {/* <Sequence interval={0.5}> */}
      {
        /* <Chord
            notes={["e3", "g3", "b3"]}
            release={0.5}
            type="sine"
            amp={0.5}
            duration={1}
          /> */
      }
      {
        /* <Note note="C4" duration={0.2} type="sawtooth" amp={0.15} />
          <Chord notes={["g3", "b3", "d4"]} release={1} amp={0.5} />
          <Chord notes={["f3", "a3", "c4"]} release={1} amp={0.5} />
          <Chord notes={["e3", "g3", "b3"]} release={1} amp={0.5} /> */
      }
      {/* </Sequence> */}
      {/* </Loop> */}

      {/* Bass notes - chord progression every 4 beats */}
      {
        /* <Loop id="bass" interval={4}>
        <Sequence interval={1}>
          <Note note="C2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="G2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="A2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="F2" duration={0.8} type="triangle" amp={0.3} />
        </Sequence>
      </Loop> */
      }
    </Track>
  );
}
