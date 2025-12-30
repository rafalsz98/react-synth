/**
 * ADSR Envelope utilities for Web Audio
 */

export interface ADSRProps {
  /** Attack time in beats - time from silence to attack_level (default: 0) */
  attack?: number;
  /** Peak amplitude at end of attack, multiplied by amp (default: 1) */
  attack_level?: number;
  /** Decay time in beats - time from attack_level to decay_level (default: 0) */
  decay?: number;
  /** Amplitude at end of decay, multiplied by amp (default: sustain_level) */
  decay_level?: number;
  /** Sustain time in beats - time at sustain_level (default: 0) */
  sustain?: number;
  /** Sustained amplitude level, multiplied by amp (default: 1) */
  sustain_level?: number;
  /** Release time in beats - time from sustain_level to silence (default: 1) */
  release?: number;
}

export const ADSR_DEFAULTS = {
  attack: 0,
  attack_level: 1,
  decay: 0,
  sustain: 0,
  sustain_level: 1,
  release: 1,
} as const;

/**
 * Apply ADSR envelope to a GainNode and return the end time
 */
export function applyADSREnvelope(
  gainNode: GainNode,
  audioTime: number,
  props: ADSRProps,
  amp: number,
  beatsToSeconds: (beats: number) => number,
): number {
  // Extract props with defaults
  const attack = props.attack ?? ADSR_DEFAULTS.attack;
  const attack_level = props.attack_level ?? ADSR_DEFAULTS.attack_level;
  const decay = props.decay ?? ADSR_DEFAULTS.decay;
  const sustain = props.sustain ?? ADSR_DEFAULTS.sustain;
  const sustain_level = props.sustain_level ?? ADSR_DEFAULTS.sustain_level;
  const release = props.release ?? ADSR_DEFAULTS.release;
  const decay_level = props.decay_level ?? sustain_level;

  // Convert times from beats to seconds
  const attackSec = beatsToSeconds(attack);
  const decaySec = beatsToSeconds(decay);
  const sustainSec = beatsToSeconds(sustain);
  const releaseSec = beatsToSeconds(release);

  // Calculate amplitude values
  const attackAmp = attack_level * amp;
  const decayAmp = decay_level * amp;
  const sustainAmp = sustain_level * amp;

  // Calculate envelope time points
  const attackEnd = audioTime + attackSec;
  const decayEnd = attackEnd + decaySec;
  const sustainEnd = decayEnd + sustainSec;
  const releaseEnd = sustainEnd + releaseSec;

  // Start at silence
  gainNode.gain.setValueAtTime(0.001, audioTime);

  // Attack: ramp to attack_level
  if (attackSec > 0) {
    gainNode.gain.linearRampToValueAtTime(attackAmp, attackEnd);
  } else {
    gainNode.gain.setValueAtTime(attackAmp, audioTime);
  }

  // Decay: ramp to decay_level
  if (decaySec > 0) {
    gainNode.gain.linearRampToValueAtTime(decayAmp, decayEnd);
  } else {
    gainNode.gain.setValueAtTime(decayAmp, attackEnd);
  }

  // Sustain: ramp to sustain_level and hold
  if (sustainSec > 0) {
    gainNode.gain.linearRampToValueAtTime(sustainAmp, decayEnd + 0.001);
    gainNode.gain.setValueAtTime(sustainAmp, sustainEnd);
  } else {
    gainNode.gain.setValueAtTime(sustainAmp, decayEnd);
  }

  // Release: ramp to silence
  gainNode.gain.exponentialRampToValueAtTime(0.001, releaseEnd);

  return releaseEnd;
}
