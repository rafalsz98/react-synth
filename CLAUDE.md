# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React-synth is a live-coding music synthesizer that transforms React component code into music. It uses Deno as the runtime, React 19 for the component model, and Web Audio API for sound synthesis. The architecture is inspired by Sonic Pi's "two clocks" scheduling pattern for sample-accurate audio timing.

## Commands

```bash
# Run with hot reload (development)
deno task dev

# Play a specific song file
deno task play <song.tsx>

# Run scheduler tests with file watching
deno task test
```

## Architecture

### Data Flow
```
CLI (src/cli.ts)
  ↓ loads/watches TSX file
Bootstrap (src/bootstrap.ts)
  ↓ creates fake DOM via JSDOM, renders React
Components render to scheduler callbacks
  ↓
Scheduler (src/audio/scheduler.ts)
  ↓ lookahead scheduling (100ms window, 25ms interval)
Web Audio API
  ↓
Audio output
```

### Component Hierarchy
```
<Track bpm={120}>           // Root: provides audioContext & scheduler
  <Loop interval={1}>       // Repeats children at beat interval
    <Sequence interval={0.25}>  // Sequential playback
      <Note note="C4" />    // Leaf: plays oscillator
    </Sequence>
  </Loop>
</Track>
```

### Key Singletons (Hot Reload Survival)
- `globalThis.__scheduler` - Scheduler instance (owns AudioContext, maintains loop state)
- `globalThis.__audioContext` - Web Audio context (created by Scheduler)

### Timing Model
- All timing is beat-based, converted via `(beats * 60) / bpm`
- Scheduler uses Web Audio API's `currentTime` as reference clock
- Lookahead pattern: JavaScript timer schedules events within 100ms window

### Context System
Each component provides a context consumed by children via hooks:
- `useTrack()` → `{ bpm, audioContext, scheduler }`
- `useLoop()` → `{ registerCallback, unregisterCallback, interval }`
- `useSequence()` → `{ registerStep, unregisterStep, stepInterval, totalSteps }`

## Key Files

- `src/cli.ts` - Entry point, file watching, cache-busting on reload
- `src/bootstrap.ts` - JSDOM setup, React rendering to fake DOM
- `src/audio/scheduler.ts` - Core two-clock lookahead scheduler (owns AudioContext)
- `src/components/Track.tsx` - Root component, initializes scheduler
- `src/components/Loop.tsx` - Callback registration for repeating patterns
- `src/components/Sequence.tsx` - Step-based sequential playback
- `src/components/Note/Note.tsx` - Oscillator with envelope (attack/release)

## Patterns

**Callback Registration:** Note components don't render DOM—they register callbacks with parent Loop/Sequence that fire at scheduled audio times.

**Step Injection:** Sequence uses `cloneElement()` to inject `__stepIndex` prop into children for timing calculation.

**Note Frequency:** `noteToFrequency()` converts note names (e.g., "C#4") to Hz using MIDI formula: `440 * 2^((midiNote - 69) / 12)`
