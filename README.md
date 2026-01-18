# React Synth 🎹

[![npm](https://img.shields.io/npm/v/@react-synth/synth)](https://www.npmjs.com/package/@react-synth/synth)

This is a fun little experiment showing that React API can be used outside of
browser environment to render... music instead of HTML.

Should you use it? I don't know, you are an adult.

## Documentation

See [documentation page](https://rafalsz98.github.io/react-synth/) for more info

## Quick start

Init new repository and install react-synth and its dependencies:

```bash
npm init
npm i @react-synth/synth react
npm i -D @types/react
```

Then create new `.tsx` file. React-synth requires created file to have default
export with ReactNode. For example, you can paste below code:

```tsx
// song.tsx
import React from "react";
import {
  Chord,
  Loop,
  Note,
  Sample,
  Sequence,
  Synth,
  Track,
} from "@react-synth/synth";

export default function MySong() {
  return (
    <Track bpm={120}>
      {/* Simple kick drum pattern */}
      <Loop id="kick" interval={1}>
        <Sample name="bd_haus" amp={2} />
      </Loop>

      {/* Melody arpeggio with prophet synth */}
      <Loop id="melody" interval={2}>
        <Synth type="prophet">
          <Sequence interval={0.25}>
            <Note note="C4" />
            <Note note="E4" />
            <Note note="G4" />
            <Note note="C5" />
          </Sequence>
        </Synth>
      </Loop>

      {/* Chord progression */}
      <Loop id="pads" interval={4}>
        <Synth type="hollow">
          <Chord notes="Am7" release={4} amp={0.5} />
        </Synth>
      </Loop>
    </Track>
  );
}
```

Then run it with:

```bash
npx react-synth song.tsx
```

Now any change made to the code will cause hot reload without disruption.

## Inspired By

- [Sonic Pi](https://sonic-pi.net/) - The original live coding synth

## License

MIT
