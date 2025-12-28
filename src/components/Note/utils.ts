/**
 * Convert note name to frequency (e.g., "A4" -> 440)
 */
export function noteToFrequency(note: string): number {
  const noteMap: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  // Parse note like "A4", "C#3", "Bb5"
  const match = note.match(/^([A-G][#b]?)(\d+)$/i);
  if (!match) {
    console.warn(`Invalid note: ${note}, defaulting to A4`);
    return 440;
  }

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitone = noteMap[noteName.toUpperCase()];

  if (semitone === undefined) {
    console.warn(`Unknown note: ${noteName}, defaulting to A4`);
    return 440;
  }

  // A4 = 440Hz, A4 is MIDI note 69
  // MIDI note = (octave + 1) * 12 + semitone
  const midiNote = (octave + 1) * 12 + semitone;
  const a4MidiNote = 69;

  return 440 * Math.pow(2, (midiNote - a4MidiNote) / 12);
}
