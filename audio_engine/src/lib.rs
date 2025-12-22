use rodio::{OutputStream, Sink, source::Source};
use std::collections::HashMap;
use std::sync::mpsc::{self, Sender};
use std::sync::{Mutex, OnceLock};
use std::thread;
use std::time::Duration;

#[derive(Debug)]
enum AudioCommand {
    PlayNote { id: u32, frequency: f32, duration_ms: u32 },
    StopNote { id: u32 },
    StopAll,
}

struct AudioEngine {
    sender: Sender<AudioCommand>,
    next_id: Mutex<u32>,
}

impl AudioEngine {
    fn new() -> Self {
        let (tx, rx) = mpsc::channel::<AudioCommand>();

        thread::spawn(move || {
            // Keep the output stream alive for the lifetime of the thread
            let (_stream, stream_handle) = match OutputStream::try_default() {
                Ok(s) => s,
                Err(e) => {
                    eprintln!("Failed to create audio output stream: {}", e);
                    return;
                }
            };

            let mut active_sinks: HashMap<u32, Sink> = HashMap::new();

            loop {
                // Clean up finished sinks
                active_sinks.retain(|_, sink| !sink.empty());

                match rx.recv() {
                    Ok(AudioCommand::PlayNote { id, frequency, duration_ms }) => {
                        // Stop any existing note with the same ID
                        if let Some(sink) = active_sinks.remove(&id) {
                            sink.stop();
                        }

                        // Create a new sink and play
                        if let Ok(sink) = Sink::try_new(&stream_handle) {
                            let source = rodio::source::SineWave::new(frequency)
                                .amplify(0.15)
                                .take_duration(Duration::from_millis(duration_ms as u64))
                                .fade_in(Duration::from_millis(5));
                            sink.append(source);
                            active_sinks.insert(id, sink);
                        }
                    }
                    Ok(AudioCommand::StopNote { id }) => {
                        if let Some(sink) = active_sinks.remove(&id) {
                            sink.stop();
                        }
                    }
                    Ok(AudioCommand::StopAll) => {
                        for (_, sink) in active_sinks.drain() {
                            sink.stop();
                        }
                    }
                    Err(_) => break, // Channel closed, exit thread
                }
            }
        });

        AudioEngine {
            sender: tx,
            next_id: Mutex::new(0),
        }
    }

    fn get_next_id(&self) -> u32 {
        let mut id = self.next_id.lock().unwrap();
        let current = *id;
        *id = id.wrapping_add(1);
        current
    }
}

static AUDIO_ENGINE: OnceLock<AudioEngine> = OnceLock::new();

fn get_engine() -> &'static AudioEngine {
    AUDIO_ENGINE.get_or_init(AudioEngine::new)
}

/// Play a note at the given frequency for the specified duration in milliseconds.
/// Returns a note ID that can be used to stop the note early.
#[no_mangle]
pub extern "C" fn play_note(frequency: f32, duration_ms: u32) -> u32 {
    let engine = get_engine();
    let id = engine.get_next_id();
    let _ = engine.sender.send(AudioCommand::PlayNote {
        id,
        frequency,
        duration_ms,
    });
    id
}

/// Play a note at the given frequency for the specified duration, and wait for it to finish.
/// This blocks the calling thread for the duration.
#[no_mangle]
pub extern "C" fn play_note_sync(frequency: f32, duration_ms: u32) {
    let engine = get_engine();
    let id = engine.get_next_id();
    let _ = engine.sender.send(AudioCommand::PlayNote {
        id,
        frequency,
        duration_ms,
    });
    thread::sleep(Duration::from_millis(duration_ms as u64));
}

/// Stop a specific note by its ID.
#[no_mangle]
pub extern "C" fn stop_note(id: u32) {
    let _ = get_engine().sender.send(AudioCommand::StopNote { id });
}

/// Stop all currently playing notes.
#[no_mangle]
pub extern "C" fn stop_all() {
    let _ = get_engine().sender.send(AudioCommand::StopAll);
}

/// Sleep for the specified number of milliseconds.
/// Useful for timing between notes.
#[no_mangle]
pub extern "C" fn sleep_ms(ms: u32) {
    thread::sleep(Duration::from_millis(ms as u64));
}

// Legacy API for backwards compatibility
#[no_mangle]
pub extern "C" fn Note_on(frequency: f32) {
    let _ = play_note(frequency, 10000); // Play for 10 seconds max
}

#[no_mangle]
pub extern "C" fn Note_off() {
    stop_all();
}
