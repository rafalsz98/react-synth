import { Midi, Note } from "tonal";
import { Chord as TonalChord } from "tonal";
import type { NoteName } from "../types/music.ts";

/**
 * Convert MIDI note number to frequency in Hz
 *
 * This is used for Sonic Pi compatibility where parameters like
 * `cutoff` are specified as MIDI note numbers (0-127+) rather than Hz.
 *
 * Formula: frequency = 440 * 2^((midi - 69) / 12)
 *
 * @example
 * midiToFrequency(69)  // => 440 (A4)
 * midiToFrequency(60)  // => 261.63 (C4)
 * midiToFrequency(100) // => 2637.02
 * midiToFrequency(110) // => 4698.64
 *
 * Sonic Pi cutoff reference:
 * - cutoff: 60  => ~262 Hz
 * - cutoff: 80  => ~831 Hz
 * - cutoff: 100 => ~2637 Hz
 * - cutoff: 110 => ~4699 Hz
 * - cutoff: 120 => ~8372 Hz
 */
export function midiToFrequency(midi: number): number {
  return Midi.midiToFreq(midi);
}

/**
 * Convert note name to frequency using Tonal
 * Supports all note formats: "A4", "C#3", "Db5", "Bb2", etc.
 *
 * Accepts both strongly-typed NoteName and plain strings (for internal use
 * by Chord component which resolves chord names to note strings at runtime).
 *
 * @example
 * noteToFrequency("A4")  // => 440
 * noteToFrequency("C4")  // => 261.63
 * noteToFrequency("C#3") // => 138.59
 */
export function noteToFrequency(note: NoteName | string): number {
  const freq = Note.freq(note);
  if (freq === null) {
    console.warn(`Invalid note: ${note}, defaulting to A4 (440Hz)`);
    return 440;
  }
  return freq;
}

/**
 * Resolves chord input to an array of note names or frequencies
 *
 * @example
 * resolveChordNotes("Cmaj7")      // => ["C3", "E3", "G3", "B3"]
 * resolveChordNotes("Am:4")       // => ["A4", "C5", "E5"]
 * resolveChordNotes(["C4", "E4"]) // => ["C4", "E4"]
 */
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
