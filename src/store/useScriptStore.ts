import { create } from 'zustand';
import type { Script, Character } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { mockScripts } from '@/data/mockData';

interface ScriptState {
  scripts: Script[];
  addScript: (script: Omit<Script, 'id'>) => void;
  updateScript: (id: string, script: Partial<Script>) => void;
  deleteScript: (id: string) => void;
  getScript: (id: string) => Script | undefined;
  addCharacter: (scriptId: string, character: Omit<Character, 'id'>) => void;
  updateCharacter: (scriptId: string, characterId: string, character: Partial<Character>) => void;
  deleteCharacter: (scriptId: string, characterId: string) => void;
  loadScripts: () => void;
}

const STORAGE_KEY = 'script-killer-scripts';

export const useScriptStore = create<ScriptState>((set, get) => ({
  scripts: [],

  loadScripts: () => {
    const stored = loadFromStorage<Script[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      set({ scripts: stored });
    } else {
      set({ scripts: mockScripts });
      saveToStorage(STORAGE_KEY, mockScripts);
    }
  },

  addScript: (script) => {
    const newScript: Script = {
      ...script,
      id: `script-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const scripts = [...get().scripts, newScript];
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  },

  updateScript: (id, script) => {
    const scripts = get().scripts.map(s =>
      s.id === id ? { ...s, ...script } : s
    );
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  },

  deleteScript: (id) => {
    const scripts = get().scripts.filter(s => s.id !== id);
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  },

  getScript: (id) => {
    return get().scripts.find(s => s.id === id);
  },

  addCharacter: (scriptId, character) => {
    const scripts = get().scripts.map(s => {
      if (s.id === scriptId) {
        const newChar: Character = {
          ...character,
          id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        return { ...s, characters: [...s.characters, newChar] };
      }
      return s;
    });
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  },

  updateCharacter: (scriptId, characterId, character) => {
    const scripts = get().scripts.map(s => {
      if (s.id === scriptId) {
        return {
          ...s,
          characters: s.characters.map(c =>
            c.id === characterId ? { ...c, ...character } : c
          )
        };
      }
      return s;
    });
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  },

  deleteCharacter: (scriptId, characterId) => {
    const scripts = get().scripts.map(s => {
      if (s.id === scriptId) {
        return {
          ...s,
          characters: s.characters.filter(c => c.id !== characterId)
        };
      }
      return s;
    });
    set({ scripts });
    saveToStorage(STORAGE_KEY, scripts);
  }
}));
