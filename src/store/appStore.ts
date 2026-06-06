import { create } from 'zustand';
import { Chord, ChordProgression } from '../types';
import { CHORDS } from '../data/chords';

interface AppState {
  selectedChord: Chord | null;
  setSelectedChord: (chord: Chord | null) => void;
  
  currentProgression: ChordProgression;
  setCurrentProgression: (progression: ChordProgression) => void;
  addChordToProgression: (chordId: string) => void;
  removeChordFromProgression: (index: number) => void;
  reorderProgression: (fromIndex: number, toIndex: number) => void;
  setBpm: (bpm: number) => void;
  
  favorites: ChordProgression[];
  addToFavorites: (progression: ChordProgression) => void;
  removeFromFavorites: (id: string) => void;
  updateFavorite: (id: string, updates: Partial<ChordProgression>) => void;
  
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  
  currentBeat: number;
  setCurrentBeat: (beat: number) => void;
}

const loadFavorites = (): ChordProgression[] => {
  try {
    const saved = localStorage.getItem('guitar-favorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: ChordProgression[]) => {
  localStorage.setItem('guitar-favorites', JSON.stringify(favorites));
};

export const useAppStore = create<AppState>((set, get) => ({
  selectedChord: CHORDS[0],
  setSelectedChord: (chord) => set({ selectedChord: chord }),

  currentProgression: {
    id: 'current',
    name: '未命名进行',
    category: '未分类',
    chords: [],
    bpm: 100,
    beatsPerMeasure: 4,
    createdAt: Date.now(),
  },
  
  setCurrentProgression: (progression) => set({ currentProgression: progression }),
  
  addChordToProgression: (chordId) => {
    const { currentProgression } = get();
    set({
      currentProgression: {
        ...currentProgression,
        chords: [...currentProgression.chords, chordId],
      },
    });
  },
  
  removeChordFromProgression: (index) => {
    const { currentProgression } = get();
    const newChords = [...currentProgression.chords];
    newChords.splice(index, 1);
    set({
      currentProgression: {
        ...currentProgression,
        chords: newChords,
      },
    });
  },
  
  reorderProgression: (fromIndex, toIndex) => {
    const { currentProgression } = get();
    const newChords = [...currentProgression.chords];
    const [removed] = newChords.splice(fromIndex, 1);
    newChords.splice(toIndex, 0, removed);
    set({
      currentProgression: {
        ...currentProgression,
        chords: newChords,
      },
    });
  },
  
  setBpm: (bpm) => {
    const { currentProgression } = get();
    set({
      currentProgression: {
        ...currentProgression,
        bpm,
      },
    });
  },

  favorites: loadFavorites(),
  
  addToFavorites: (progression) => {
    const newFavorite = {
      ...progression,
      id: `fav-${Date.now()}`,
      createdAt: Date.now(),
    };
    const newFavorites = [...get().favorites, newFavorite];
    set({ favorites: newFavorites });
    saveFavorites(newFavorites);
  },
  
  removeFromFavorites: (id) => {
    const newFavorites = get().favorites.filter(f => f.id !== id);
    set({ favorites: newFavorites });
    saveFavorites(newFavorites);
  },
  
  updateFavorite: (id, updates) => {
    const newFavorites = get().favorites.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    set({ favorites: newFavorites });
    saveFavorites(newFavorites);
  },

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  currentBeat: 0,
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
}));
