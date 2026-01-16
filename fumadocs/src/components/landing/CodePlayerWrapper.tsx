import { highlight } from "fumadocs-core/highlight";
import { CodePlayer } from "./CodePlayer";

const EXAMPLE_CODE = `import { Track, Loop, Synth, Note } from "@react-synth/synth";

export default function MySong() {
  return (
    <Track bpm={120}>
      <Loop interval={4}>
        <Synth type="prophet">
          <Note note="C4" />
          <Note note="E4" />
          <Note note="G4" />
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
