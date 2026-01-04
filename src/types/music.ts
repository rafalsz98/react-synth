/**
 * Strongly typed musical note names using TypeScript template literals.
 *
 * This provides compile-time safety and IDE autocomplete for note names.
 */

type Letter = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Accidental = "" | "#" | "b" | "##" | "bb";
type Octave = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Pitch class without octave (e.g., "C", "F#", "Bb")
 */
export type PitchClass = `${Letter}${Accidental}`;

/**
 * Note name with octave (e.g., "C4", "F#3", "Bb5")
 *
 * Supports:
 * - Natural notes: A0-G9
 * - Sharps: A#0-G#9
 * - Flats: Ab0-Gb9
 * - Double sharps: A##0-G##9
 * - Double flats: Abb0-Gbb9
 */
export type NoteName = `${Letter}${Accidental}${Octave}`;

/**
 * Note specification that can be either a note name string or frequency in Hz
 */
export type NoteInput = NoteName | number;

/**
 * Available sample name, from directory src/samples.
 * TODO: Automate it
 */
export type SampleName = "bd_haus" | "drum_cymbal_closed";
