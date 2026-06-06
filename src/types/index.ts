export type VisualMode = 'spectrum' | 'waveform' | 'circular' | 'mountain';

export interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

export interface AudioInfo {
  fileName: string;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  bitRate?: number;
  bpm?: number;
  fileSize: number;
}

export interface EqBand {
  frequency: number;
  gain: number;
}

export interface SliceRange {
  start: number;
  end: number;
}
