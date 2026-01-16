import { highlight } from "fumadocs-core/highlight";
import { CodePlayer } from "./CodePlayer";

const EXAMPLE_CODE = `import { Track, Loop, Sequence, Synth, Note, Sample } from "@react-synth/synth";

export default function FunkyBeat() {
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
}`;

export async function CodePlayerWrapper() {
  const highlighted = await highlight(EXAMPLE_CODE, {
    lang: "tsx",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });

  return <CodePlayer highlighted={highlighted} filename="song.tsx" />;
}
