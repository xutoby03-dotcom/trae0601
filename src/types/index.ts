export type DeckId = 'A' | 'B';

export interface EQ {
  low: number;
  mid: number;
  high: number;
}

export interface Effects {
  reverb: number;
  delay: number;
  filter: number;
  filterType: 'lowpass' | 'highpass';
}

export interface DeckState {
  id: DeckId;
  audioBuffer: AudioBuffer | null;
  fileName: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  bpm: number;
  detectedBPM: number;
  pitch: number;
  cuePoints: number[];
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  loopBeats: 1 | 2 | 4 | 8;
  eq: EQ;
  effects: Effects;
  beatPhase: number;
}

export interface MixerState {
  crossfader: number;
  masterVolume: number;
  isRecording: boolean;
  recordedBlob: Blob | null;
}

export interface DJProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deckA: {
    fileName: string;
    audioData: ArrayBuffer;
    cuePoints: number[];
    bpm: number;
  };
  deckB: {
    fileName: string;
    audioData: ArrayBuffer;
    cuePoints: number[];
    bpm: number;
  };
}

export interface AudioNodes {
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  lowFilter: BiquadFilterNode;
  midFilter: BiquadFilterNode;
  highFilter: BiquadFilterNode;
  reverbNode: ConvolverNode | null;
  reverbGain: GainNode;
  delayNode: DelayNode;
  delayFeedback: GainNode;
  delayGain: GainNode;
  filterNode: BiquadFilterNode;
  crossfadeGain: GainNode;
  analyser: AnalyserNode;
}
