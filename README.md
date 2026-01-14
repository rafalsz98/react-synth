# React Synth 🎹

This is a fun little experiment showing that React API can be used outside of
browser environment to render... music instead of HTML.

Should you use it? I don't know, you are an adult.

## How It Works

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

## Components

### `<Track>`

Root component that sets the tempo and provides audio context. All other
components must be nested inside a Track.

| Prop       | Type        | Default | Description                             |
| ---------- | ----------- | ------- | --------------------------------------- |
| `bpm`      | `number`    | —       | **Required.** Tempo in beats per minute |
| `children` | `ReactNode` | —       | Child components to render              |

```tsx
<Track bpm={120}>
  {/* Your music components here */}
</Track>;
```

---

### `<Loop>`

Repeats its children at a specified beat interval. Use this for drum patterns,
repeating melodies, or any cyclical musical phrase.

| Prop       | Type        | Default | Description                                         |
| ---------- | ----------- | ------- | --------------------------------------------------- |
| `id`       | `string`    | —       | **Required.** Unique identifier for this loop       |
| `interval` | `number`    | —       | **Required.** Interval in beats between repetitions |
| `children` | `ReactNode` | —       | Content to play on each loop iteration              |

```tsx
{/* Kick drum every beat */}
<Loop id="kick" interval={1}>
  <Sample name="bd_haus" />
</Loop>;

{/* Chord progression every 4 beats */}
<Loop id="chords" interval={4}>
  <Chord notes="Am7" />
</Loop>;
```

---

### `<Sequence>`

Plays children one after another with a specified interval between each. Each
child is played at its index position × interval beats.

| Prop       | Type        | Default | Description                                   |
| ---------- | ----------- | ------- | --------------------------------------------- |
| `interval` | `number`    | —       | **Required.** Time between each step in beats |
| `children` | `ReactNode` | —       | Steps to play in order                        |

```tsx
{/* Arpeggio: C-E-G-C played as 16th notes */}
<Sequence interval={0.25}>
  <Note note="C4" />
  <Note note="E4" />
  <Note note="G4" />
  <Note note="C5" />
</Sequence>;

{/* Drum pattern */}
<Sequence interval={0.5}>
  <Sample name="bd_haus" />
  <Sample name="drum_snare_soft" />
  <Sample name="bd_haus" />
  <Sample name="drum_snare_soft" />
</Sequence>;
```

---

### `<Synth>`

Defines the synthesizer configuration for child `Note` and `Chord` components.
Provides preset sounds and allows customization of oscillator, filter, and voice
parameters.

| Prop         | Type                    | Default | Description                                                           |
| ------------ | ----------------------- | ------- | --------------------------------------------------------------------- |
| `type`       | `SynthType`             | —       | **Required.** Synth preset name (see below)                           |
| `oscillator` | `OscillatorType`        | —       | Override oscillator: `"sine"`, `"square"`, `"sawtooth"`, `"triangle"` |
| `filter`     | `Partial<FilterConfig>` | —       | Override filter settings                                              |
| `voices`     | `Partial<VoiceConfig>`  | —       | Override voice/unison settings                                        |
| `children`   | `ReactNode`             | —       | Note/Chord components to apply this synth to                          |

**Available Synth Presets:**

| Preset            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `"sine"`          | Pure sine wave - clean, fundamental tone             |
| `"saw"`           | Sawtooth wave - bright, harmonically rich            |
| `"square"`        | Square wave - hollow, clarinet-like                  |
| `"tri"`           | Triangle wave - soft, flute-like                     |
| `"prophet"`       | Prophet-5 inspired - warm with detuned voices        |
| `"hollow"`        | Ethereal pad - filtered square, atmospheric          |
| `"dark_ambience"` | Deep atmospheric pad - low-passed with many voices   |
| `"bass"`          | Punchy bass - filtered sawtooth                      |
| `"pluck"`         | Bright plucked string - square wave with high cutoff |

**Filter Config:**

| Property    | Type               | Description                                   |
| ----------- | ------------------ | --------------------------------------------- |
| `type`      | `FilterType`       | `"lowpass"`, `"highpass"`, `"bandpass"`, etc. |
| `cutoff`    | `number` or `Line` | Cutoff frequency in Hz, or a Line pattern     |
| `resonance` | `number`           | Filter resonance/Q factor                     |

**Voice Config:**

| Property | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| `count`  | `number` | Number of oscillator voices (unison) |
| `detune` | `number` | Detune spread in cents               |
| `spread` | `number` | Stereo spread 0-1                    |

```tsx
{/* Using a preset */}
<Synth type="prophet">
  <Note note="C4" />
</Synth>;

{/* Overriding filter settings */}
<Synth type="saw" filter={{ cutoff: 2000, resonance: 8 }}>
  <Chord notes="Am7" />
</Synth>;

{/* Thick unison lead */}
<Synth type="saw" voices={{ count: 4, detune: 15, spread: 0.8 }}>
  <Note note="A4" />
</Synth>;
```

---

### `<Note>`

Plays a single note using Web Audio oscillators with ADSR envelope. Inherits
synth settings from parent `<Synth>` component, or uses defaults.

| Prop            | Type                    | Default         | Description                                                  |
| --------------- | ----------------------- | --------------- | ------------------------------------------------------------ |
| `note`          | `string` or `number`    | —               | **Required.** Note name (`"C4"`, `"A#3"`) or frequency in Hz |
| `amp`           | `number`                | `0.3`           | Amplitude/volume 0-1                                         |
| `attack`        | `number`                | `0`             | Attack time in beats                                         |
| `attack_level`  | `number`                | `1`             | Peak level at end of attack (multiplied by amp)              |
| `decay`         | `number`                | `0`             | Decay time in beats                                          |
| `decay_level`   | `number`                | `sustain_level` | Level at end of decay                                        |
| `sustain`       | `number`                | `0`             | Sustain time in beats                                        |
| `sustain_level` | `number`                | `1`             | Sustained level (multiplied by amp)                          |
| `release`       | `number`                | `1`             | Release time in beats                                        |
| `oscillator`    | `OscillatorType`        | —               | Override synth oscillator type                               |
| `filter`        | `Partial<FilterConfig>` | —               | Override filter settings                                     |
| `voices`        | `Partial<VoiceConfig>`  | —               | Override voice settings                                      |

**Note Duration:** Total duration = `attack` + `decay` + `sustain` + `release`

```tsx
{/* Simple note */}
<Note note="A4" />;

{/* Note with envelope */}
<Note note="C4" amp={0.5} attack={0.1} sustain={0.5} release={0.3} />;

{/* Note with frequency in Hz */}
<Note note={440} />;

{/* Note with filter override */}
<Note note="E4" filter={{ cutoff: 800, resonance: 5 }} />;
```

---

### `<Chord>`

Plays multiple notes simultaneously. Supports chord name notation (powered by
Tonal) or explicit note arrays.

| Prop            | Type                             | Default         | Description                                |
| --------------- | -------------------------------- | --------------- | ------------------------------------------ |
| `notes`         | `string` or `(string\|number)[]` | —               | **Required.** Chord name or array of notes |
| `amp`           | `number`                         | `0.3`           | Amplitude/volume 0-1                       |
| `attack`        | `number`                         | `0`             | Attack time in beats                       |
| `attack_level`  | `number`                         | `1`             | Peak level at end of attack                |
| `decay`         | `number`                         | `0`             | Decay time in beats                        |
| `decay_level`   | `number`                         | `sustain_level` | Level at end of decay                      |
| `sustain`       | `number`                         | `0`             | Sustain time in beats                      |
| `sustain_level` | `number`                         | `1`             | Sustained level                            |
| `release`       | `number`                         | `1`             | Release time in beats                      |
| `oscillator`    | `OscillatorType`                 | —               | Override synth oscillator type             |
| `filter`        | `Partial<FilterConfig>`          | —               | Override filter settings                   |
| `voices`        | `Partial<VoiceConfig>`           | —               | Override voice settings                    |

**Chord Name Format:**

- Basic: `"C"`, `"Am"`, `"F#m"`, `"Bb"`
- Extended: `"Cmaj7"`, `"Dm7"`, `"G7"`, `"Am9"`
- With octave: `"Cmaj7:4"` (plays in octave 4, default is octave 3)
- Slash chords: `"Dm7/F"`, `"C/E"`

```tsx
{/* Chord name */}
<Chord notes="Am7" />;

{/* Chord in specific octave */}
<Chord notes="Cmaj7:4" />;

{/* Note array */}
<Chord notes={["C4", "E4", "G4"]} />;

{/* Frequency array */}
<Chord notes={[261.63, 329.63, 392.00]} />;

{/* With envelope for pad sound */}
<Chord notes="Em7" amp={0.4} attack={0.5} sustain={2} release={1} />;
```

---

### `<Sample>`

Plays an audio sample file with optional effects. Samples are loaded from a
built-in sample library.

| Prop     | Type               | Default | Description                                        |
| -------- | ------------------ | ------- | -------------------------------------------------- |
| `name`   | `SampleName`       | —       | **Required.** Sample name (without file extension) |
| `amp`    | `number`           | `1`     | Amplitude/volume multiplier                        |
| `cutoff` | `number` or `Line` | `20000` | Lowpass filter cutoff (MIDI note or Hz)            |
| `rate`   | `number`           | `1`     | Playback rate multiplier                           |
| `pan`    | `number`           | `0`     | Stereo pan position: -1 (left) to 1 (right)        |

**Cutoff Values (MIDI note → Hz):**

- `60` → ~262 Hz (C4)
- `80` → ~831 Hz
- `100` → ~2637 Hz
- `110` → ~4699 Hz
- `130` → ~20kHz (no filtering)

```tsx
{/* Basic kick drum */}
<Sample name="bd_haus" />;

{/* Louder with filter */}
<Sample name="bd_haus" amp={2} cutoff={100} />;

{/* Hi-hat with pitch shift and panning */}
<Sample name="drum_cymbal_closed" rate={1.2} pan={0.3} />;

{/* Snare with lowpass filter */}
<Sample name="drum_snare_soft" cutoff={80} amp={0.8} />;
```

---

## Line Patterns

The `cutoff` prop on `<Note>`, `<Chord>`, and `<Sample>` components supports
Line patterns for dynamic filter sweeps within a `<Sequence>`:

```tsx
<Sequence interval={0.25}>
  {/* Filter sweeps from 60 to 120 over 8 steps */}
  <Note note="C4" filter={{ cutoff: { from: 60, to: 120, steps: 8 } }} />
  <Note note="E4" filter={{ cutoff: { from: 60, to: 120, steps: 8 } }} />
  <Note note="G4" filter={{ cutoff: { from: 60, to: 120, steps: 8 } }} />
  {/* ... */}
</Sequence>;
```

| Property | Type      | Description                       |
| -------- | --------- | --------------------------------- |
| `from`   | `number`  | Starting cutoff value (MIDI note) |
| `to`     | `number`  | Ending cutoff value (MIDI note)   |
| `steps`  | `number`  | Number of interpolation steps     |
| `mirror` | `boolean` | If true, goes up then back down   |
| `step`   | `number`  | Manual step index override        |

## Inspired By

- [Sonic Pi](https://sonic-pi.net/) - The original live coding synth

## License

MIT
