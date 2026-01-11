type Letter = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Accidental = "" | "#" | "b" | "##" | "bb";
type Octave = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type PitchClass = `${Letter}${Accidental}`;

export type NoteName = `${Letter}${Accidental}${Octave}`;

export type NoteInput = NoteName | number;

export type SampleName = "bd_haus" | "drum_cymbal_closed";
