import { create } from 'zustand';
import type {
  Play,
  Scene,
  Cue,
  Prop,
  PropFlow,
  Issue,
  CheckItem,
  IssueType,
  PropFlowWithDetails,
  IssueWithDetails,
  CheckItemWithDetails,
  Priority,
} from '@/types';
import {
  plays as mockPlays,
  scenes as mockScenes,
  cues as mockCues,
  props as mockProps,
  propFlows as mockPropFlows,
  issues as mockIssues,
  checkItems as mockCheckItems,
} from '@/data/mockData';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

interface AppState {
  plays: Play[];
  scenes: Scene[];
  cues: Cue[];
  props: Prop[];
  propFlows: PropFlow[];
  issues: Issue[];
  checkItems: CheckItem[];

  selectedPlayId: string | null;
  selectedSceneId: string | null;
  isMuted: boolean;
  darkMode: boolean;

  init: () => void;

  selectPlay: (playId: string) => void;
  selectScene: (sceneId: string) => void;
  toggleMute: () => void;
  toggleDarkMode: () => void;

  getScenesByPlay: (playId: string) => Scene[];
  getCuesByScene: (sceneId: string) => Cue[];
  getPropFlowsByCue: (cueId: string) => PropFlowWithDetails[];
  getAllPropFlowsByScene: (sceneId: string) => PropFlowWithDetails[];

  confirmPropFlow: (propFlowId: string) => void;

  reportIssue: (
    propFlowId: string,
    type: IssueType,
    description: string
  ) => void;
  resolveIssue: (issueId: string, resolution: string) => void;
  getIssues: () => IssueWithDetails[];
  getUnresolvedIssues: () => IssueWithDetails[];

  generateChecklist: () => void;
  getChecklist: () => CheckItemWithDetails[];
  toggleCheckItem: (itemId: string, checked: boolean) => void;
  addNoteToCheckItem: (itemId: string, note: string) => void;

  getPropById: (propId: string) => Prop | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  plays: [],
  scenes: [],
  cues: [],
  props: [],
  propFlows: [],
  issues: [],
  checkItems: [],

  selectedPlayId: null,
  selectedSceneId: null,
  isMuted: true,
  darkMode: true,

  init: () => {
    const storedPlays = loadFromStorage<Play[]>('plays', mockPlays);
    const storedScenes = loadFromStorage<Scene[]>('scenes', mockScenes);
    const storedCues = loadFromStorage<Cue[]>('cues', mockCues);
    const storedProps = loadFromStorage<Prop[]>('props', mockProps);
    const storedPropFlows = loadFromStorage<PropFlow[]>(
      'propFlows',
      mockPropFlows
    );
    const storedIssues = loadFromStorage<Issue[]>('issues', mockIssues);
    const storedCheckItems = loadFromStorage<CheckItem[]>(
      'checkItems',
      mockCheckItems
    );
    const storedMuted = loadFromStorage<boolean>('muted', true);
    const storedDarkMode = loadFromStorage<boolean>('darkMode', true);
    const storedPlayId = loadFromStorage<string | null>(
      'selectedPlayId',
      null
    );
    const storedSceneId = loadFromStorage<string | null>(
      'selectedSceneId',
      null
    );

    set({
      plays: storedPlays,
      scenes: storedScenes,
      cues: storedCues,
      props: storedProps,
      propFlows: storedPropFlows,
      issues: storedIssues,
      checkItems: storedCheckItems,
      isMuted: storedMuted,
      darkMode: storedDarkMode,
      selectedPlayId: storedPlayId || storedPlays[0]?.id || null,
      selectedSceneId: storedSceneId,
    });
  },

  selectPlay: (playId) => {
    set({ selectedPlayId: playId, selectedSceneId: null });
    saveToStorage('selectedPlayId', playId);
    saveToStorage('selectedSceneId', null);
  },

  selectScene: (sceneId) => {
    set({ selectedSceneId: sceneId });
    saveToStorage('selectedSceneId', sceneId);
  },

  toggleMute: () => {
    const newMuted = !get().isMuted;
    set({ isMuted: newMuted });
    saveToStorage('muted', newMuted);
  },

  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    set({ darkMode: newDarkMode });
    saveToStorage('darkMode', newDarkMode);
  },

  getScenesByPlay: (playId) => {
    return get()
      .scenes.filter((s) => s.playId === playId)
      .sort((a, b) => a.order - b.order);
  },

  getCuesByScene: (sceneId) => {
    return get()
      .cues.filter((c) => c.sceneId === sceneId)
      .sort((a, b) => a.number - b.number);
  },

  getPropFlowsByCue: (cueId) => {
    const state = get();
    return state.propFlows
      .filter((pf) => pf.cueId === cueId)
      .map((pf) => {
        const prop = state.props.find((p) => p.id === pf.propId)!;
        const cue = state.cues.find((c) => c.id === pf.cueId)!;
        return {
          ...pf,
          prop,
          cueNumber: cue.number,
          cueName: cue.name,
        };
      });
  },

  getAllPropFlowsByScene: (sceneId) => {
    const state = get();
    const sceneCues = state.cues.filter((c) => c.sceneId === sceneId);
    const result: PropFlowWithDetails[] = [];

    for (const cue of sceneCues) {
      const flows = state.propFlows.filter((pf) => pf.cueId === cue.id);
      for (const pf of flows) {
        const prop = state.props.find((p) => p.id === pf.propId)!;
        result.push({
          ...pf,
          prop,
          cueNumber: cue.number,
          cueName: cue.name,
        });
      }
    }

    return result.sort(
      (a, b) =>
        a.cueNumber - b.cueNumber
    );
  },

  confirmPropFlow: (propFlowId) => {
    const newFlows = get().propFlows.map((pf) =>
      pf.id === propFlowId
        ? { ...pf, status: 'confirmed' as const, confirmedAt: new Date().toISOString() }
        : pf
    );
    set({ propFlows: newFlows });
    saveToStorage('propFlows', newFlows);
  },

  reportIssue: (propFlowId, type, description) => {
    const state = get();
    const propFlow = state.propFlows.find(
      (pf) => pf.id === propFlowId
    );
    if (!propFlow) return;

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      propId: propFlow.propId,
      propFlowId,
      type,
      description,
      reportedAt: new Date().toISOString(),
      resolved: false,
    };

    const newIssues = [...state.issues, newIssue];
    const newFlows = state.propFlows.map((pf) =>
      pf.id === propFlowId
        ? { ...pf, status: 'issue' as const }
        : pf
    );

    set({ issues: newIssues, propFlows: newFlows });
    saveToStorage('issues', newIssues);
    saveToStorage('propFlows', newFlows);

    get().generateChecklist();
  },

  resolveIssue: (issueId, resolution) => {
    const state = get();
    const newIssues = state.issues.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            resolved: true,
            resolvedAt: new Date().toISOString(),
            resolution,
          }
        : issue
    );
    set({ issues: newIssues });
    saveToStorage('issues', newIssues);

    get().generateChecklist();
  },

  getIssues: () => {
    const state = get();
    return state.issues.map((issue) => {
      const prop = state.props.find((p) => p.id === issue.propId)!;
      const propFlow = state.propFlows.find(
        (pf) => pf.id === issue.propFlowId
      )!;
      const cue = state.cues.find((c) => c.id === propFlow.cueId)!;
      const scene = state.scenes.find((s) => s.id === cue.sceneId)!;
      const play = state.plays.find((p) => p.id === scene.playId)!;
      return {
        ...issue,
        prop,
        propFlow,
        cueNumber: cue.number,
        cueName: cue.name,
        sceneName: scene.name,
        playName: play?.name ?? '',
      };
    });
  },

  getUnresolvedIssues: () => {
    return get().getIssues().filter((i) => !i.resolved);
  },

  generateChecklist: () => {
    const state = get();
    const unresolvedIssues = state.issues.filter((i) => !i.resolved);

    const priorityMap: Record<IssueType, Priority> = {
      lost: 'high',
      damaged: 'high',
      wrong_position: 'medium',
    };

    const existingIds = new Set(state.checkItems.map((ci) => ci.issueId));

    const newItems: CheckItem[] = unresolvedIssues
      .filter((issue) => !existingIds.has(issue.id))
      .map((issue) => ({
        id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        propId: issue.propId,
        issueId: issue.id,
        priority: priorityMap[issue.type],
        checked: false,
      }));

    if (newItems.length > 0) {
      const allItems = [...state.checkItems, ...newItems];
      set({ checkItems: allItems });
      saveToStorage('checkItems', allItems);
    }
  },

  getChecklist: () => {
    const state = get();
    return state.checkItems
      .map((item) => {
        const prop = state.props.find((p) => p.id === item.propId)!;
        const issue = state.issues.find((i) => i.id === item.issueId);
        return { ...item, prop, issue };
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  },

  toggleCheckItem: (itemId, checked) => {
    const newItems = get().checkItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            checked,
            checkedAt: checked ? new Date().toISOString() : undefined,
          }
        : item
    );
    set({ checkItems: newItems });
    saveToStorage('checkItems', newItems);
  },

  addNoteToCheckItem: (itemId, note) => {
    const newItems = get().checkItems.map((item) =>
      item.id === itemId ? { ...item, note } : item
    );
    set({ checkItems: newItems });
    saveToStorage('checkItems', newItems);
  },

  getPropById: (propId) => {
    return get().props.find((p) => p.id === propId);
  },
}));
