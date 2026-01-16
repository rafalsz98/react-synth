import {
  Chord,
  Loop,
  Note,
  NoteName,
  Sample,
  Sequence,
  Synth,
  Track,
} from "@react-synth/synth";
import React from "react";
import { Giorgio } from "./component";

export default function SimpleSong() {
  const patterns: [string, string, string, string][] = [
    ["A1", "A2", "E2", "A2"], // a1: root, +12, +7, +12
    ["G1", "G2", "D2", "G2"], // g1: root, +12, +7, +12
    ["F1", "F2", "C2", "F2"], // f1: root, +12, +7, +12
    ["E1", "E2", "B1", "E2"], // e1: root, +12, +7, +12
  ];

  return (
    <Track bpm={124}>
      <Loop id="loop1" interval={1}>
        <Sequence interval={0.5}>
          <Sample name="bd_haus" />
          <Sample name="drum_cymbal_closed" />
        </Sequence>
      </Loop>

      <Loop id="loop2" interval={2}>
        <Synth type="bass">
          <Sequence interval={0.5}>
            <Note note="C2" />
            <Note note="C3" />
            <Note note="Bb2" />
            <Note note="G2" />
          </Sequence>
        </Synth>
      </Loop>
    </Track>
  );
}
