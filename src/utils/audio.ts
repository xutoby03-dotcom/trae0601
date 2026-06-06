import { STRING_FREQUENCIES } from '../types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getFrequency(stringIndex: number, fret: number): number {
  const baseFreq = STRING_FREQUENCIES[stringIndex];
  return baseFreq * Math.pow(2, fret / 12);
}

export function getNoteName(stringIndex: number, fret: number): string {
  const baseNotes = [4, 11, 7, 2, 9, 4];
  const noteIndex = (baseNotes[stringIndex] + fret) % 12;
  return NOTE_NAMES[noteIndex];
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.5;

  init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioContext.destination);
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playNote(frequency: number, duration: number = 2, startTime: number = 0) {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime + startTime;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.1);
  }

  playChord(frets: number[], strumDelay: number = 0.05) {
    this.init();
    this.resume();

    for (let i = 0; i < 6; i++) {
      if (frets[i] >= 0) {
        const freq = getFrequency(i, frets[i]);
        this.playNote(freq, 2.5, i * strumDelay);
      }
    }
  }

  playMetronomeClick(isAccent: boolean = false) {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = isAccent ? 1200 : 800;

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    const gainValue = isAccent ? 0.3 : 0.15;
    gainNode.gain.setValueAtTime(gainValue, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }
}

export const audioEngine = new AudioEngine();
