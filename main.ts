import JZZ from "jzz";
import Midi from "@tonejs/midi";
import { Note } from "tonal";
import { Buffer } from "node:buffer";
import SMF from "jzz-midi-smf";

const midi = new Midi.Midi();
// add a track
const track = midi.addTrack();
track
  .addNote({
    midi: 60,
    time: 0,
    duration: 0.2,
  })
  .addNote({
    name: "C5",
    time: 0.3,
    duration: 0.1,
  })
  .addCC({
    number: 64,
    value: 127,
    time: 0.2,
  });

console.log(midi);

const midiout = await JZZ().openMidiOut();
const smf = SMF(midi.toArray());
const player = smf.player();
player.connect(midiout);
player.play();

midiout.close();
// JZZ()
//   .or("Cannot start MIDI engine!")
//   .openMidiOut()
//   .or("Cannot open MIDI Out port!")
//   .program(1, 89)
//   .wait(500)
//   .send(smf)
//   .close();
