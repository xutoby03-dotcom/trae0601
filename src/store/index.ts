import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Screen,
  Lamp,
  Puppet,
  Actor,
  LightPosition,
  Calibration,
  Scene,
  CharacterEntry,
} from '@/types';

const genId = () => Math.random().toString(36).slice(2, 10);

interface AppState {
  screen: Screen | null;
  lamps: Lamp[];
  puppets: Puppet[];
  actors: Actor[];
  lightPositions: LightPosition[];
  calibrations: Calibration[];
  scenes: Scene[];
  characterEntries: CharacterEntry[];

  setScreen: (screen: Partial<Screen> | null) => void;
  addLamp: (lamp: Omit<Lamp, 'id'>) => void;
  updateLamp: (id: string, lamp: Partial<Lamp>) => void;
  removeLamp: (id: string) => void;
  addPuppet: (puppet: Omit<Puppet, 'id'>) => void;
  updatePuppet: (id: string, puppet: Partial<Puppet>) => void;
  removePuppet: (id: string) => void;
  addActor: (actor: Omit<Actor, 'id'>) => void;
  updateActor: (id: string, actor: Partial<Actor>) => void;
  removeActor: (id: string) => void;
  addLightPosition: (lp: Omit<LightPosition, 'id'>) => void;
  updateLightPosition: (id: string, lp: Partial<LightPosition>) => void;
  removeLightPosition: (id: string) => void;
  addCalibration: (cal: Omit<Calibration, 'id' | 'createdAt'>) => void;
  updateCalibration: (id: string, cal: Partial<Calibration>) => void;
  removeCalibration: (id: string) => void;
  addScene: (scene: Omit<Scene, 'id'>) => void;
  updateScene: (id: string, scene: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  addCharacterEntry: (entry: Omit<CharacterEntry, 'id'>) => void;
  updateCharacterEntry: (id: string, entry: Partial<CharacterEntry>) => void;
  removeCharacterEntry: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      screen: null,
      lamps: [],
      puppets: [],
      actors: [],
      lightPositions: [],
      calibrations: [],
      scenes: [],
      characterEntries: [],

      setScreen: (screen) =>
        set((state) => ({
          screen: screen
            ? {
                widthCm: 0,
                heightCm: 0,
                material: '',
                heightFromGroundCm: 0,
                ...state.screen,
                ...screen,
                id: state.screen?.id || genId(),
              }
            : null,
        })),

      addLamp: (lamp) =>
        set((s) => ({ lamps: [...s.lamps, { ...lamp, id: genId() }] })),
      updateLamp: (id, lamp) =>
        set((s) => ({
          lamps: s.lamps.map((l) => (l.id === id ? { ...l, ...lamp } : l)),
        })),
      removeLamp: (id) =>
        set((s) => ({ lamps: s.lamps.filter((l) => l.id !== id) })),

      addPuppet: (puppet) =>
        set((s) => ({ puppets: [...s.puppets, { ...puppet, id: genId() }] })),
      updatePuppet: (id, puppet) =>
        set((s) => ({
          puppets: s.puppets.map((p) => (p.id === id ? { ...p, ...puppet } : p)),
        })),
      removePuppet: (id) =>
        set((s) => ({ puppets: s.puppets.filter((p) => p.id !== id) })),

      addActor: (actor) =>
        set((s) => ({ actors: [...s.actors, { ...actor, id: genId() }] })),
      updateActor: (id, actor) =>
        set((s) => ({
          actors: s.actors.map((a) => (a.id === id ? { ...a, ...actor } : a)),
        })),
      removeActor: (id) =>
        set((s) => ({ actors: s.actors.filter((a) => a.id !== id) })),

      addLightPosition: (lp) =>
        set((s) => ({
          lightPositions: [...s.lightPositions, { ...lp, id: genId() }],
        })),
      updateLightPosition: (id, lp) =>
        set((s) => ({
          lightPositions: s.lightPositions.map((l) =>
            l.id === id ? { ...l, ...lp } : l
          ),
        })),
      removeLightPosition: (id) =>
        set((s) => ({
          lightPositions: s.lightPositions.filter((l) => l.id !== id),
        })),

      addCalibration: (cal) =>
        set((s) => ({
          calibrations: [
            ...s.calibrations,
            { ...cal, id: genId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCalibration: (id, cal) =>
        set((s) => ({
          calibrations: s.calibrations.map((c) =>
            c.id === id ? { ...c, ...cal } : c
          ),
        })),
      removeCalibration: (id) =>
        set((s) => ({
          calibrations: s.calibrations.filter((c) => c.id !== id),
        })),

      addScene: (scene) =>
        set((s) => ({ scenes: [...s.scenes, { ...scene, id: genId() }] })),
      updateScene: (id, scene) =>
        set((s) => ({
          scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...scene } : sc)),
        })),
      removeScene: (id) =>
        set((s) => ({ scenes: s.scenes.filter((sc) => sc.id !== id) })),

      addCharacterEntry: (entry) =>
        set((s) => ({
          characterEntries: [...s.characterEntries, { ...entry, id: genId() }],
        })),
      updateCharacterEntry: (id, entry) =>
        set((s) => ({
          characterEntries: s.characterEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        })),
      removeCharacterEntry: (id) =>
        set((s) => ({
          characterEntries: s.characterEntries.filter((e) => e.id !== id),
        })),
    }),
    { name: 'shadow-puppetry-store' }
  )
);
