import { create } from 'zustand';
import type {
  Scene,
  Piece,
  Version,
  Role,
  Resource,
  Trigger,
  CompareState,
  PlaybackState,
  PieceDiff,
} from '@/types';
import { loadSceneFromStorage, saveSceneToStorage, generateId } from '@/utils/storage';
import { createMockScene } from '@/data/mockScene';
import { calculatePieceDiffs } from '@/utils/diffCalculator';

interface SandboxStore {
  scene: Scene;
  selectedPieceId: string | null;
  compare: CompareState;
  playback: PlaybackState;
  diffs: PieceDiff[];
  isPlaybackMode: boolean;

  initScene: () => void;
  saveScene: () => void;

  setSceneName: (name: string) => void;

  getCurrentPieces: () => Piece[];
  getCurrentVersion: () => Version | null;
  getRoleById: (roleId: string) => Role | undefined;

  selectPiece: (pieceId: string | null) => void;

  addPiece: (piece: Omit<Piece, 'id'>) => void;
  updatePiece: (pieceId: string, updates: Partial<Piece>) => void;
  deletePiece: (pieceId: string) => void;
  movePiece: (pieceId: string, x: number, y: number) => void;

  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  deleteRole: (roleId: string) => void;

  addPieceResource: (pieceId: string, resource: Omit<Resource, 'id'>) => void;
  updatePieceResource: (
    pieceId: string,
    resourceId: string,
    updates: Partial<Resource>
  ) => void;
  deletePieceResource: (pieceId: string, resourceId: string) => void;

  addPieceTrigger: (pieceId: string, trigger: Omit<Trigger, 'id'>) => void;
  updatePieceTrigger: (
    pieceId: string,
    triggerId: string,
    updates: Partial<Trigger>
  ) => void;
  deletePieceTrigger: (pieceId: string, triggerId: string) => void;

  saveVersion: (name: string, description: string) => void;
  switchVersion: (versionId: string) => void;
  renameVersion: (versionId: string, name: string) => void;
  deleteVersion: (versionId: string) => void;

  startCompare: (leftId: string, rightId: string) => void;
  endCompare: () => void;
  setLeftVersion: (versionId: string) => void;
  setRightVersion: (versionId: string) => void;

  togglePlaybackMode: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaybackStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  gotoStep: (stepIndex: number) => void;
}

export const useSandboxStore = create<SandboxStore>((set, get) => ({
  scene: createMockScene(),
  selectedPieceId: null,
  compare: {
    isComparing: false,
    leftVersionId: null,
    rightVersionId: null,
  },
  playback: {
    isPlaying: false,
    currentStep: 0,
    speed: 1,
    versionOrder: [],
  },
  diffs: [],
  isPlaybackMode: false,

  initScene: () => {
    const saved = loadSceneFromStorage();
    if (saved) {
      set({ scene: saved });
    } else {
      const mock = createMockScene();
      set({ scene: mock });
      saveSceneToStorage(mock);
    }

    const scene = get().scene;
    const sortedVersions = [...scene.versions].sort(
      (a, b) => a.stepNumber - b.stepNumber
    );
    set({
      playback: {
        ...get().playback,
        versionOrder: sortedVersions.map((v) => v.id),
        currentStep: sortedVersions.findIndex(
          (v) => v.id === scene.currentVersionId
        ),
      },
    });
  },

  saveScene: () => {
    saveSceneToStorage(get().scene);
  },

  setSceneName: (name: string) => {
    set((state) => ({
      scene: { ...state.scene, name },
    }));
    get().saveScene();
  },

  getCurrentPieces: () => {
    const state = get();
    const currentVersion = state.scene.versions.find(
      (v) => v.id === state.scene.currentVersionId
    );
    return currentVersion?.pieces || [];
  },

  getCurrentVersion: () => {
    const state = get();
    return (
      state.scene.versions.find((v) => v.id === state.scene.currentVersionId) ||
      null
    );
  },

  getRoleById: (roleId: string) => {
    return get().scene.roles.find((r) => r.id === roleId);
  },

  selectPiece: (pieceId) => {
    set({ selectedPieceId: pieceId });
  },

  addPiece: (piece) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const newPiece: Piece = {
      ...piece,
      id: generateId(),
    };

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? { ...v, pieces: [...v.pieces, newPiece] }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
      selectedPieceId: newPiece.id,
    });
    get().saveScene();
  },

  updatePiece: (pieceId, updates) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId ? { ...p, ...updates } : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  deletePiece: (pieceId) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? { ...v, pieces: v.pieces.filter((p) => p.id !== pieceId) }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
      selectedPieceId:
        state.selectedPieceId === pieceId ? null : state.selectedPieceId,
    });
    get().saveScene();
  },

  movePiece: (pieceId, x, y) => {
    get().updatePiece(pieceId, { x, y });
  },

  addRole: (role) => {
    const newRole: Role = { ...role, id: generateId() };
    set((state) => ({
      scene: { ...state.scene, roles: [...state.scene.roles, newRole] },
    }));
    get().saveScene();
  },

  updateRole: (roleId, updates) => {
    set((state) => ({
      scene: {
        ...state.scene,
        roles: state.scene.roles.map((r) =>
          r.id === roleId ? { ...r, ...updates } : r
        ),
      },
    }));
    get().saveScene();
  },

  deleteRole: (roleId) => {
    set((state) => ({
      scene: {
        ...state.scene,
        roles: state.scene.roles.filter((r) => r.id !== roleId),
      },
    }));
    get().saveScene();
  },

  addPieceResource: (pieceId, resource) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const newResource: Resource = { ...resource, id: generateId() };

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? { ...p, resources: [...p.resources, newResource] }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  updatePieceResource: (pieceId, resourceId, updates) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? {
                    ...p,
                    resources: p.resources.map((r) =>
                      r.id === resourceId ? { ...r, ...updates } : r
                    ),
                  }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  deletePieceResource: (pieceId, resourceId) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? {
                    ...p,
                    resources: p.resources.filter((r) => r.id !== resourceId),
                  }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  addPieceTrigger: (pieceId, trigger) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const newTrigger: Trigger = { ...trigger, id: generateId() };

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? { ...p, triggers: [...p.triggers, newTrigger] }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  updatePieceTrigger: (pieceId, triggerId, updates) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? {
                    ...p,
                    triggers: p.triggers.map((t) =>
                      t.id === triggerId ? { ...t, ...updates } : t
                    ),
                  }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  deletePieceTrigger: (pieceId, triggerId) => {
    const state = get();
    const currentVersion = state.getCurrentVersion();
    if (!currentVersion) return;

    const updatedVersions = state.scene.versions.map((v) =>
      v.id === currentVersion.id
        ? {
            ...v,
            pieces: v.pieces.map((p) =>
              p.id === pieceId
                ? {
                    ...p,
                    triggers: p.triggers.filter((t) => t.id !== triggerId),
                  }
                : p
            ),
          }
        : v
    );

    set({
      scene: { ...state.scene, versions: updatedVersions },
    });
    get().saveScene();
  },

  saveVersion: (name, description) => {
    const state = get();
    const currentPieces = state.getCurrentPieces();
    const maxStep = Math.max(
      ...state.scene.versions.map((v) => v.stepNumber),
      0
    );

    const newVersion: Version = {
      id: generateId(),
      name,
      description,
      createdAt: Date.now(),
      pieces: JSON.parse(JSON.stringify(currentPieces)),
      stepNumber: maxStep + 1,
    };

    const updatedVersions = [...state.scene.versions, newVersion];
    const sortedVersions = [...updatedVersions].sort(
      (a, b) => a.stepNumber - b.stepNumber
    );

    set({
      scene: {
        ...state.scene,
        versions: updatedVersions,
        currentVersionId: newVersion.id,
      },
      playback: {
        ...state.playback,
        versionOrder: sortedVersions.map((v) => v.id),
        currentStep: sortedVersions.length - 1,
      },
    });
    get().saveScene();
  },

  switchVersion: (versionId) => {
    set((state) => ({
      scene: { ...state.scene, currentVersionId: versionId },
      selectedPieceId: null,
    }));
  },

  renameVersion: (versionId, name) => {
    set((state) => ({
      scene: {
        ...state.scene,
        versions: state.scene.versions.map((v) =>
          v.id === versionId ? { ...v, name } : v
        ),
      },
    }));
    get().saveScene();
  },

  deleteVersion: (versionId) => {
    const state = get();
    const filtered = state.scene.versions.filter((v) => v.id !== versionId);
    const sorted = [...filtered].sort((a, b) => a.stepNumber - b.stepNumber);

    let newCurrentId = state.scene.currentVersionId;
    if (state.scene.currentVersionId === versionId) {
      newCurrentId = sorted.length > 0 ? sorted[sorted.length - 1].id : null;
    }

    set({
      scene: {
        ...state.scene,
        versions: filtered,
        currentVersionId: newCurrentId,
      },
      playback: {
        ...state.playback,
        versionOrder: sorted.map((v) => v.id),
        currentStep: Math.max(
          0,
          sorted.findIndex((v) => v.id === newCurrentId)
        ),
      },
    });
    get().saveScene();
  },

  startCompare: (leftId, rightId) => {
    const state = get();
    const leftVersion = state.scene.versions.find((v) => v.id === leftId);
    const rightVersion = state.scene.versions.find((v) => v.id === rightId);

    if (leftVersion && rightVersion) {
      const diffs = calculatePieceDiffs(leftVersion.pieces, rightVersion.pieces);
      set({
        compare: {
          isComparing: true,
          leftVersionId: leftId,
          rightVersionId: rightId,
        },
        diffs,
      });
    }
  },

  endCompare: () => {
    set({
      compare: {
        isComparing: false,
        leftVersionId: null,
        rightVersionId: null,
      },
      diffs: [],
    });
  },

  setLeftVersion: (versionId) => {
    const state = get();
    if (!state.compare.rightVersionId) return;

    const leftVersion = state.scene.versions.find((v) => v.id === versionId);
    const rightVersion = state.scene.versions.find(
      (v) => v.id === state.compare.rightVersionId
    );

    if (leftVersion && rightVersion) {
      const diffs = calculatePieceDiffs(leftVersion.pieces, rightVersion.pieces);
      set({
        compare: { ...state.compare, leftVersionId: versionId },
        diffs,
      });
    }
  },

  setRightVersion: (versionId) => {
    const state = get();
    if (!state.compare.leftVersionId) return;

    const leftVersion = state.scene.versions.find(
      (v) => v.id === state.compare.leftVersionId
    );
    const rightVersion = state.scene.versions.find((v) => v.id === versionId);

    if (leftVersion && rightVersion) {
      const diffs = calculatePieceDiffs(leftVersion.pieces, rightVersion.pieces);
      set({
        compare: { ...state.compare, rightVersionId: versionId },
        diffs,
      });
    }
  },

  togglePlaybackMode: () => {
    const state = get();
    const newMode = !state.isPlaybackMode;

    if (newMode) {
      const sortedVersions = [...state.scene.versions].sort(
        (a, b) => a.stepNumber - b.stepNumber
      );
      set({
        isPlaybackMode: true,
        playback: {
          ...state.playback,
          isPlaying: false,
          versionOrder: sortedVersions.map((v) => v.id),
          currentStep: 0,
        },
      });
      if (sortedVersions.length > 0) {
        get().switchVersion(sortedVersions[0].id);
      }
    } else {
      set({
        isPlaybackMode: false,
        playback: {
          ...state.playback,
          isPlaying: false,
        },
      });
    }
  },

  togglePlayback: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    }));
  },

  setPlaybackSpeed: (speed) => {
    set((state) => ({
      playback: { ...state.playback, speed },
    }));
  },

  setPlaybackStep: (step) => {
    set((state) => ({
      playback: { ...state.playback, currentStep: step },
    }));
  },

  nextStep: () => {
    const state = get();
    const maxStep = state.playback.versionOrder.length - 1;
    if (state.playback.currentStep < maxStep) {
      const nextStep = state.playback.currentStep + 1;
      const nextVersionId = state.playback.versionOrder[nextStep];
      set({
        playback: { ...state.playback, currentStep: nextStep },
      });
      get().switchVersion(nextVersionId);
    } else {
      set({
        playback: { ...state.playback, isPlaying: false },
      });
    }
  },

  prevStep: () => {
    const state = get();
    if (state.playback.currentStep > 0) {
      const prevStep = state.playback.currentStep - 1;
      const prevVersionId = state.playback.versionOrder[prevStep];
      set({
        playback: { ...state.playback, currentStep: prevStep },
      });
      get().switchVersion(prevVersionId);
    }
  },

  gotoStep: (stepIndex) => {
    const state = get();
    const versionId = state.playback.versionOrder[stepIndex];
    if (versionId) {
      set({
        playback: { ...state.playback, currentStep: stepIndex },
      });
      get().switchVersion(versionId);
    }
  },
}));
