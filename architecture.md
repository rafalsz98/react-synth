# React Synth

This is an deno application, that transforms React code into music. It loops the
whole track over in live mode, allowing for hot reload (using React API)

Conceptually, this is very simillar to `sonic-pi`, therefore its interface is
compatible with sonic-pi. What is possible there, must be possible in React
Synth.

## Example

Below is a code written in sonic-pi:

```ruby
# Giorgio by Moroder - Daft Punk Theme
# BPM: 113
use_bpm 113

# 1. The Beat (Simple Four-on-the-Floor)
live_loop :kick do
  sample :bd_haus, amp: 2, cutoff: 100
  sleep 1
end

# 2. The High-Hat / Click Track
live_loop :click do
  sync :kick
  4.times do
    sample :drum_cymbal_closed, amp: 0.5, rate: 1.5, pan: 0.1
    sleep 0.25
  end
end

# 3. The Main Arpeggiator Theme
live_loop :giorgio_arp do
  # Use the 'Prophet' synth for that retro analog sound
  use_synth :prophet

  # The Chord Progression: A -> G -> F -> E (The "Andalusian Cadence" vibe)
  # We repeat each root note for 1 bar (16 sixteenth notes)
  progression = [:a1, :g1, :f1, :e1]

  # Iterate through the progression
  progression.each do |root|

    # Create a filter sweep using a line that goes up and down
    # This mimics the hand-turning of the Cutoff knob on a modular synth
    cutoff_filter = line(60, 110, steps: 32).mirror

    # Play 16 notes (1 bar) for the current chord
    16.times do
      # We use 'tick' to move through the cutoff values smoothly

      # The Arpeggio Pattern: Root, Octave, 5th, Octave
      # This creates that "rolling" disco bassline feel
      note_to_play = [root, root + 12, root + 7, root + 12].ring.tick(:pattern)

      play note_to_play,
        release: 0.2,       # Short, punchy notes
        cutoff: cutoff_filter.tick(:filter), # Apply the sweeping filter
        amp: 1.5,
        res: 0.8            # Resonance adds the "squelchy" electronic sound

      sleep 0.25 # 16th notes
    end
  end
end

# 4. Optional: The Atmospheric Pad (comes in background)
live_loop :pads do
  use_synth :hollow
  with_fx :reverb, room: 0.8 do
    # Play the chords slowly in the background
    play_chord [:a3, :c4, :e4], release: 4, amp: 0.5
    sleep 4
    play_chord [:g3, :b3, :d4], release: 4, amp: 0.5
    sleep 4
    play_chord [:f3, :a3, :c4], release: 4, amp: 0.5
    sleep 4
    play_chord [:e3, :g3, :b3], release: 4, amp: 0.5
    sleep 4
  end
end
```

Same loop in React Synth would look like:

```tsx
export default function DaftPunk() {
  const progression = ["a1", "g1", "f1", "e1"];

  return (
    <Track bpm={113}>
      {/* 1. The Beat (Simple Four-on-the-Floor) */}
      <Loop id="kick" interval={1}>
        <Sample name="bd_haus" amp={2} cutoff={100} />
      </Loop>

      {/* 2. The High-Hat / Click Track */}
      <Loop id="click" interval={1}>
        <Sequence interval={0.25}>
          {[...Array(4)].map((_, i) => (
            <Sample
              key={i}
              name="drum_cymbal_closed"
              amp={0.5}
              rate={1.5}
              pan={0.1}
            />
          ))}
        </Sequence>
      </Loop>

      {/* 3. The Main Arpeggiator Theme */}
      <Loop id="giorgio_arp" interval={16}>
        <Synth type="prophet">
          <Sequence interval={4}>
            {progression.map((root) => {
              const pattern = [root, `${root}+12`, `${root}+7`, `${root}+12`];
              return (
                <Sequence key={root} interval={0.25}>
                  {[...Array(16)].map((_, i) => (
                    <Note
                      key={i}
                      note={pattern[i % pattern.length]}
                      cutoff={{ from: 60, to: 110, steps: 32, mirror: true }}
                      release={0.2}
                      amp={1.5}
                      res={0.8}
                    />
                  ))}
                </Sequence>
              );
            })}
          </Sequence>
        </Synth>
      </Loop>

      {/* 4. The Atmospheric Pad */}
      <Loop id="pads" interval={16}>
        <Effect type="reverb" room={0.8}>
          <Synth type="hollow">
            <Sequence interval={4}>
              <Chord notes={["a3", "c4", "e4"]} release={4} amp={0.5} />
              <Chord notes={["g3", "b3", "d4"]} release={4} amp={0.5} />
              <Chord notes={["f3", "a3", "c4"]} release={4} amp={0.5} />
              <Chord notes={["e3", "g3", "b3"]} release={4} amp={0.5} />
            </Sequence>
          </Synth>
        </Effect>
      </Loop>
    </Track>
  );
}
```
