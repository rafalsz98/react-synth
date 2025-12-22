# synth

A synthesizer CLI and component library powered by Deno and Rust.

## Prerequisites

- [Deno](https://deno.land/) installed and in your PATH
- [Rust](https://rustup.rs/) (for building the audio engine)

## Installation

```bash
# Build the Rust audio engine first
cd audio_engine
cargo build --release
cd ..

# Install globally (optional)
npm link
```

## Usage

### CLI

Run any TypeScript file with synth components:

```bash
npx synth my-song.ts
```

Or if installed globally:

```bash
synth my-song.ts
```

### Writing Music

Create a TypeScript file and import from `synth`:

```typescript
// my-song.ts
import { playNote, Notes, midiToFrequency } from "synth";

// Play individual notes
await playNote(Notes.A4, 500);  // A4 for 500ms

// Play a melody
const melody = [Notes.C4, Notes.E4, Notes.G4, Notes.C5];
for (const note of melody) {
  await playNote(note, 300);
}

// Use MIDI note numbers
await playNote(midiToFrequency(60), 500);  // Middle C
```

### Available Components

#### Functions

- `noteOn(frequency: number)` - Start playing a note at the given frequency (Hz)
- `noteOff()` - Stop the currently playing note
- `playNote(frequency: number, durationMs: number)` - Play a note for a specific duration
- `midiToFrequency(midiNote: number)` - Convert MIDI note number to frequency

#### Constants

- `Notes` - Common note frequencies (C4, D4, E4, F4, G4, A4, B4, C5)

## Development

```bash
# Run the demo
deno task dev

# Run the example
deno task example
```

## Project Structure

```
synth/
├── bin/
│   └── cli.mjs          # CLI entry point
├── components/
│   ├── index.ts         # Main exports
│   └── audio-engine.ts  # Audio synthesis components
├── audio_engine/        # Rust native audio library
├── examples/
│   └── simple.ts        # Example usage
└── package.json         # npm package config
```
