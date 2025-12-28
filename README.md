# React Synth 🎹

Transform React code into music! A live coding synthesizer powered by Deno and React.

## Quick Start

```bash
# Play a song
deno task play examples/simple.tsx

# Live coding mode (hot reload)
deno task dev
```

## How It Works

Write music using React components:

```tsx
import { Track, Loop, Note, Sequence } from "./src/components/index.ts";

export default function MySong() {
  return (
    <Track bpm={120}>
      {/* Simple kick drum pattern */}
      <Loop id="kick" interval={1}>
        <Note note="C2" duration={0.2} amp={0.5} />
      </Loop>

      {/* Melody arpeggio */}
      <Loop id="melody" interval={2}>
        <Sequence interval={0.25}>
          <Note note="C4" type="sawtooth" />
          <Note note="E4" type="sawtooth" />
          <Note note="G4" type="sawtooth" />
          <Note note="C5" type="sawtooth" />
        </Sequence>
      </Loop>
    </Track>
  );
}
```

## Components

### `<Track bpm={number}>`

Root component that sets the tempo and provides audio context.

### `<Loop id={string} interval={number}>`

Repeats its children every `interval` beats.

### `<Note>`

Plays a single note.

- `note` - Note name ("C4", "A#3") or frequency in Hz
- `duration` - Duration in beats (default: 0.5)
- `amp` - Volume 0-1 (default: 0.3)
- `type` - Oscillator type: "sine", "square", "sawtooth", "triangle"

### `<Sequence interval={number}>`

Plays children one after another with `interval` beats between each.

## Prerequisites

- [Deno](https://deno.land/) v2.0+

## Development

```bash
# Run with hot reload
deno task dev

# Edit examples/simple.tsx and hear changes live!
```

## Project Structure

```
react-synth/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── bootstrap.ts        # React + JSDOM setup
│   ├── audio/
│   │   └── context.ts      # Web Audio API singleton
│   └── components/
│       ├── Track.tsx       # Root component
│       ├── Loop.tsx        # Looping
│       ├── Note.tsx        # Oscillator notes
│       ├── Sequence.tsx    # Sequential playback
│       └── index.ts        # Exports
├── examples/
│   └── simple.tsx          # Demo song
└── deno.json               # Deno config
```

## Inspired By

- [Sonic Pi](https://sonic-pi.net/) - The original live coding synth
- React's declarative component model

## License

MIT
