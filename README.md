# React Synth 🎹

Transform React code into music! A live coding synthesizer powered by Node.js
and React.

## Quick Start

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Play a song with hot reload
npm run dev examples/simple/simple.tsx
```

## How It Works

Write music using React components:

```tsx
import {
  Chord,
  Loop,
  Note,
  playSong,
  Sample,
  Sequence,
  Synth,
  Track,
} from "@react-synth/synth";

function MySong() {
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

playSong(<MySong />);
```

## Components

### `<Track bpm={number}>`

Root component that sets the tempo and provides audio context.

### `<Loop id={string} interval={number}>`

Repeats its children every `interval` beats.

### `<Synth type={string}>`

Defines the synthesizer for child `Note` and `Chord` components.

Available presets: `"sine"`, `"saw"`, `"square"`, `"tri"`, `"prophet"`,
`"hollow"`, `"dark_ambience"`, `"bass"`, `"pluck"`

### `<Note>`

Plays a single note with ADSR envelope.

- `note` - Note name ("C4", "A#3") or frequency in Hz
- `amp` - Volume 0-1 (default: 0.3)
- `attack`, `decay`, `sustain`, `release` - ADSR envelope in beats
- `oscillator` - Override synth oscillator type
- `filter` - Override filter settings `{ cutoff, resonance, type }`
- `voices` - Override voice settings `{ count, detune, spread }`

### `<Chord notes={string | array}>`

Plays multiple notes simultaneously.

- `notes` - Chord name ("Cmaj7", "Am:4") or array of notes (["C4", "E4", "G4"])
- Same ADSR and synth overrides as `<Note>`

### `<Sample name={string}>`

Plays an audio sample file.

- `name` - Sample name (without extension)
- `amp` - Volume
- `cutoff` - Filter cutoff (MIDI note number)
- `rate` - Playback rate
- `pan` - Stereo pan (-1 to 1)

### `<Sequence interval={number}>`

Plays children one after another with `interval` beats between each.

## Installation

```bash
npm install @react-synth/synth
```

## CLI Usage

```bash
# Run with hot reload
npx react-synth song.tsx

# Or during development
npm run dev song.tsx
```

## Prerequisites

- Node.js v18+

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run type checking
npm run typecheck

# Live coding with hot reload
npm run dev examples/simple/simple.tsx
```

## Project Structure

```
react-synth/
├── src/
│   ├── index.ts            # Main exports
│   ├── play.ts             # playSong function
│   ├── audio/
│   │   ├── scheduler.ts    # Beat scheduling
│   │   └── sampleLoader.ts # Audio sample loading
│   ├── components/
│   │   ├── Track.tsx       # Root component
│   │   ├── Loop.tsx        # Looping
│   │   ├── Note/           # Oscillator notes
│   │   ├── Chord.tsx       # Chord playback
│   │   ├── Sample/         # Sample playback
│   │   ├── Synth/          # Synth presets
│   │   └── Sequence.tsx    # Sequential playback
│   ├── types/
│   │   └── music.ts        # Type definitions
│   ├── utils/
│   │   ├── envelope.ts     # ADSR envelope
│   │   ├── line.ts         # Value interpolation
│   │   └── notes.ts        # Note/chord utilities
│   └── samples/            # Audio samples
├── cli/
│   ├── cli.ts              # CLI entry point
│   └── bootstrap.ts        # React + JSDOM setup
├── examples/
│   └── simple/
│       └── simple.tsx      # Demo song
├── dist/                   # Build output
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Inspired By

- [Sonic Pi](https://sonic-pi.net/) - The original live coding synth
- React's declarative component model

## License

MIT
