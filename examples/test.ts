/**
 * Test the scheduler directly without React
 *
 * This demonstrates the lookahead scheduling pattern for sample-accurate timing.
 */
import { AudioContext } from "node-web-audio-api";
import { Scheduler } from "../src/audio/scheduler.ts";

const bpm = 120;
const audioContext = new AudioContext();
const scheduler = new Scheduler(audioContext, bpm);

/**
 * Play a note at a specific audio time
 */
function playNote(
  audioTime: number,
  frequency: number = 261.63,
  duration: number = 0.3
) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(audioContext.destination);

  // Envelope
  gain.gain.setValueAtTime(0.001, audioTime);
  gain.gain.linearRampToValueAtTime(0.2, audioTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioTime + duration);

  osc.start(audioTime);
  osc.stop(audioTime + duration + 0.01);
}

// Register a kick drum on every beat
scheduler.addLoop("kick", 1, (audioTime, beatTime) => {
  console.log(`Kick at beat ${beatTime.toFixed(2)}`);
  playNote(audioTime, 82.41, 0.2); // E2
});

// Register a hi-hat on every half beat
scheduler.addLoop("hihat", 0.5, (audioTime) => {
  playNote(audioTime, 3000, 0.05); // High frequency for hi-hat
});

// Register a melody that plays a sequence
const melodyNotes = [261.63, 329.63, 392.0, 493.88]; // C4, E4, G4, B4
let melodyIndex = 0;

scheduler.addLoop("melody", 0.5, (audioTime) => {
  const freq = melodyNotes[melodyIndex % melodyNotes.length];
  playNote(audioTime, freq, 0.4);
  melodyIndex++;
});

// Start the scheduler
scheduler.start();

console.log(`
🎵 Scheduler test running at ${bpm} BPM
   Press Ctrl+C to stop
`);

// Keep the process alive
await new Promise(() => {});
