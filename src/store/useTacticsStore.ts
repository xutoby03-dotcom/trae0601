import { create } from 'zustand';
import type {
  Play,
  Player,
  Tool,
  Keyframe,
  FakeNode,
  Point,
  ActualPosition,
} from '../types';
import { generateId } from '../utils/pathCalculations';
import { createMockPlay } from '../data/mockTactics';
import {
  calculateTransferWindows,
  detectCollisions,
  calculateGaps,
  calculateAllDeviations,
} from '../utils/analysis';

interface TacticsState {
  play: Play;
  currentTool: Tool;
  selectedId: string | null;
  selectedType: 'player' | 'disc' | 'route' | 'fake' | null;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  showAnalysis: boolean;
  showRoutes: boolean;
  showFakeNodes: boolean;
  showTransferWindows: boolean;
  showCollisionRisks: boolean;
  routeDrawingPlayerId: string | null;

  setTool: (tool: Tool) => void;
  setSelected: (id: string | null, type: 'player' | 'disc' | 'route' | 'fake' | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleAnalysis: () => void;
  toggleRoutes: () => void;
  toggleFakeNodes: () => void;
  toggleTransferWindows: () => void;
  toggleCollisionRisks: () => void;

  addPlayer: (type: 'offense' | 'defense', position: Point) => void;
  movePlayer: (id: string, position: Point) => void;
  removePlayer: (id: string) => void;
  setDiscPosition: (position: Point) => void;
  setDiscHolder: (playerId: string | null) => void;

  addKeyframe: (playerId: string, time: number, position: Point) => void;
  removeKeyframe: (routeId: string, keyframeId: string) => void;

  addFakeNode: (playerId: string, position: Point, time: number) => void;
  removeFakeNode: (id: string) => void;

  setRouteDrawingPlayer: (playerId: string | null) => void;

  updatePlayerLabel: (id: string, label: string) => void;
  updatePlayName: (name: string) => void;
  updateDuration: (duration: number) => void;

  addActualPosition: (playerId: string, time: number, position: Point) => void;
  updateActualPosition: (id: string, position: Point) => void;
  removeActualPosition: (id: string) => void;
  clearActualPositions: (playerId?: string) => void;
  importActualPositions: (positions: Omit<ActualPosition, 'id'>[]) => void;
  calculateDeviations: () => void;

  resetPlay: () => void;

  recalculateAnalysis: () => void;
}

export const useTacticsStore = create<TacticsState>((set, get) => ({
  play: createMockPlay(),
  currentTool: 'select',
  selectedId: null,
  selectedType: null,
  isPlaying: false,
  currentTime: 0,
  playbackSpeed: 1,
  showAnalysis: false,
  showRoutes: true,
  showFakeNodes: true,
  showTransferWindows: true,
  showCollisionRisks: true,
  routeDrawingPlayerId: null,

  setTool: (tool) => set({ currentTool: tool, selectedId: null, selectedType: null }),
  setSelected: (id, type) => set({ selectedId: id, selectedType: type }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => {
    const { play } = get();
    const clampedTime = Math.max(0, Math.min(time, play.duration));
    set({ currentTime: clampedTime });
  },
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  toggleAnalysis: () => set((state) => ({ showAnalysis: !state.showAnalysis })),
  toggleRoutes: () => set((state) => ({ showRoutes: !state.showRoutes })),
  toggleFakeNodes: () => set((state) => ({ showFakeNodes: !state.showFakeNodes })),
  toggleTransferWindows: () =>
    set((state) => ({ showTransferWindows: !state.showTransferWindows })),
  toggleCollisionRisks: () =>
    set((state) => ({ showCollisionRisks: !state.showCollisionRisks })),

  addPlayer: (type, position) => {
    const { play } = get();
    const count = play.players.filter((p) => p.type === type).length;
    const label = type === 'offense' ? `O${count + 1}` : `D${count + 1}`;
    const newPlayer: Player = {
      id: generateId(),
      type,
      label,
      startPosition: position,
    };
    set({
      play: { ...play, players: [...play.players, newPlayer] },
      selectedId: newPlayer.id,
      selectedType: 'player',
    });
  },

  movePlayer: (id, position) => {
    const { play } = get();
    const players = play.players.map((p) =>
      p.id === id ? { ...p, startPosition: position } : p,
    );
    set({ play: { ...play, players } });
  },

  removePlayer: (id) => {
    const { play } = get();
    set({
      play: {
        ...play,
        players: play.players.filter((p) => p.id !== id),
        routes: play.routes.filter((r) => r.playerId !== id),
        fakeNodes: play.fakeNodes.filter((f) => f.playerId !== id),
      },
      selectedId: null,
      selectedType: null,
    });
  },

  setDiscPosition: (position) => {
    const { play } = get();
    set({ play: { ...play, disc: { ...play.disc, position } } });
  },

  setDiscHolder: (playerId) => {
    const { play } = get();
    set({ play: { ...play, disc: { ...play.disc, holderId: playerId } } });
  },

  addKeyframe: (playerId, time, position) => {
    const { play } = get();
    let route = play.routes.find((r) => r.playerId === playerId);
    const color =
      play.players.find((p) => p.id === playerId)?.type === 'offense'
        ? '#ff6b35'
        : '#0077b6';

    const newKeyframe: Keyframe = {
      id: generateId(),
      time,
      position,
    };

    let updatedRoutes: typeof play.routes;

    if (!route) {
      route = {
        id: generateId(),
        playerId,
        keyframes: [newKeyframe],
        color,
      };
      updatedRoutes = [...play.routes, route];
    } else {
      const keyframes = [...route.keyframes, newKeyframe].sort(
        (a, b) => a.time - b.time,
      );
      updatedRoutes = play.routes.map((r) =>
        r.id === route!.id ? { ...r, keyframes } : r,
      );
    }

    set({ play: { ...play, routes: updatedRoutes } });
  },

  removeKeyframe: (routeId, keyframeId) => {
    const { play } = get();
    const updatedRoutes = play.routes.map((r) =>
      r.id === routeId
        ? { ...r, keyframes: r.keyframes.filter((k) => k.id !== keyframeId) }
        : r,
    );
    set({ play: { ...play, routes: updatedRoutes } });
  },

  addFakeNode: (playerId, position, time) => {
    const { play } = get();
    const newFake: FakeNode = {
      id: generateId(),
      playerId,
      position,
      time,
      direction: 'out',
    };
    set({ play: { ...play, fakeNodes: [...play.fakeNodes, newFake] } });
  },

  removeFakeNode: (id) => {
    const { play } = get();
    set({
      play: { ...play, fakeNodes: play.fakeNodes.filter((f) => f.id !== id) },
    });
  },

  setRouteDrawingPlayer: (playerId) => set({ routeDrawingPlayerId: playerId }),

  updatePlayerLabel: (id, label) => {
    const { play } = get();
    set({
      play: {
        ...play,
        players: play.players.map((p) => (p.id === id ? { ...p, label } : p)),
      },
    });
  },

  updatePlayName: (name) => {
    const { play } = get();
    set({ play: { ...play, name } });
  },

  updateDuration: (duration) => {
    const { play } = get();
    set({ play: { ...play, duration: Math.max(1, duration) } });
  },

  addActualPosition: (playerId, time, position) => {
    const { play } = get();
    const newPos: ActualPosition = {
      id: generateId(),
      playerId,
      time,
      position,
    };
    set({
      play: {
        ...play,
        actualPositions: [...play.actualPositions, newPos].sort(
          (a, b) => a.playerId.localeCompare(b.playerId) || a.time - b.time,
        ),
      },
    });
  },

  updateActualPosition: (id, position) => {
    const { play } = get();
    set({
      play: {
        ...play,
        actualPositions: play.actualPositions.map((p) =>
          p.id === id ? { ...p, position } : p,
        ),
      },
    });
  },

  removeActualPosition: (id) => {
    const { play } = get();
    set({
      play: {
        ...play,
        actualPositions: play.actualPositions.filter((p) => p.id !== id),
      },
    });
  },

  clearActualPositions: (playerId) => {
    const { play } = get();
    set({
      play: {
        ...play,
        actualPositions: playerId
          ? play.actualPositions.filter((p) => p.playerId !== playerId)
          : [],
        deviationStats: {},
      },
    });
  },

  importActualPositions: (positions) => {
    const { play } = get();
    const newPositions: ActualPosition[] = positions.map((p) => ({
      ...p,
      id: generateId(),
    }));
    set({
      play: {
        ...play,
        actualPositions: [...play.actualPositions, ...newPositions].sort(
          (a, b) => a.playerId.localeCompare(b.playerId) || a.time - b.time,
        ),
      },
    });
  },

  calculateDeviations: () => {
    const { play } = get();
    const deviationStats = calculateAllDeviations(
      play.players,
      play.routes,
      play.actualPositions,
    );
    set({
      play: {
        ...play,
        deviationStats,
      },
    });
  },

  resetPlay: () => {
    set({
      play: createMockPlay(),
      currentTime: 0,
      isPlaying: false,
      selectedId: null,
      selectedType: null,
    });
  },

  recalculateAnalysis: () => {
    const { play } = get();
    const transferWindows = calculateTransferWindows(
      play.players,
      play.routes,
      play.disc,
      play.duration,
    );
    const collisionRisks = detectCollisions(
      play.players,
      play.routes,
      play.duration,
    );
    const gaps = calculateGaps(play.players, play.routes, play.duration);
    set({
      play: {
        ...play,
        transferWindows,
        collisionRisks,
        gaps,
      },
    });
  },
}));
