/**
 * Simple Example - A basic melody to test React Synth
 *
 * This demonstrates the lookahead scheduler for sample-accurate timing.
 */
import { Track, Loop, Note, Sequence } from "../src/components/index.ts";

export default function SimpleSong() {
  return (
    <Track bpm={120}>
      {/* Simple kick drum pattern - plays every beat */}
      <Loop id="kick" interval={1}>
        <Note note="C2" duration={0.2} amp={0.5} type="sine" />
      </Loop>

      {/* Hi-hat pattern - plays every half beat */}
      {/* <Loop id="hihat" interval={1}>
        <Note note="C6" duration={0.05} amp={0.1} type="sine" />
      </Loop> */}

      {/* Melody arpeggio - plays a sequence every 2 beats */}
      {/* <Loop id="melody" interval={2}>
        <Sequence interval={0.15}>
          <Note note="C4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="E4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="G4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="B4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="C5" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="B4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="G4" duration={0.2} type="sawtooth" amp={0.15} />
          <Note note="E4" duration={0.2} type="sawtooth" amp={0.15} />
        </Sequence>
      </Loop> */}

      {/* Bass notes - chord progression every 4 beats */}
      {/* <Loop id="bass" interval={4}>
        <Sequence interval={1}>
          <Note note="C2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="G2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="A2" duration={0.8} type="triangle" amp={0.3} />
          <Note note="F2" duration={0.8} type="triangle" amp={0.3} />
        </Sequence>
      </Loop> */}
    </Track>
  );
}
