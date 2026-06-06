export interface Chord {
  id: string;
  name: string;
  rootNote: string;
  type: ChordType;
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres?: Barre[];
}

export type ChordType = 
  | 'major' 
  | 'minor' 
  | '7' 
  | 'maj7' 
  | 'm7' 
  | 'dim' 
  | 'aug' 
  | 'sus2' 
  | 'sus4'
  | '6'
  | 'm6';

export interface Barre {
  fret: number;
  fromString: number;
  toString: number;
}

export interface ChordProgression {
  id: string;
  name: string;
  category: string;
  chords: string[];
  bpm: number;
  beatsPerMeasure: number;
  createdAt: number;
}

export interface Favorite {
  id: string;
  type: 'chord' | 'progression';
  itemId: string;
  createdAt: number;
}

export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E'];
export const STRING_FREQUENCIES = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];
