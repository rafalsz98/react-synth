import { Midi, Note } from "tonal";
import { Chord as TonalChord } from "tonal";
import type { NoteName } from "../types/music";

export function midiToFrequency(midi: number): number {
  return Midi.midiToFreq(midi);
}

export function noteToFrequency(note: NoteName | string): number {
  const freq = Note.freq(note);
  if (freq === null) {
    console.warn(`Invalid note: ${note}, defaulting to A4 (440Hz)`);
    return 440;
  }
  return freq;
}

export function resolveChordNotes(
  notes: string | (string | number)[],
): (string | number)[] {
  // If already an array, return as-is
  if (Array.isArray(notes)) {
    return notes;
  }

  // Parse chord name with optional octave (e.g., "Cmaj7:4")
  const [chordName, octaveStr] = notes.split(":");
  const octave = octaveStr ? parseInt(octaveStr, 10) : 3;

  // Get chord notes from Tonal
  const chord = TonalChord.get(chordName);

  if (!chord.notes.length) {
    console.warn(`Unknown chord: ${chordName}, defaulting to root note`);
    return [chordName + octave];
  }

  // Add octave to each note, handling octave wrapping for notes above the root
  const rootPc = chord.notes[0];
  const noteOrder = ["C", "D", "E", "F", "G", "A", "B"];
  const rootIndex = noteOrder.findIndex((n) => rootPc.startsWith(n));

  return chord.notes.map((note) => {
    const noteIndex = noteOrder.findIndex((n) => note.startsWith(n));
    // If note is lower in the scale than root, it's in the next octave
    const noteOctave = noteIndex < rootIndex ? octave + 1 : octave;
    return note + noteOctave;
  });
}
