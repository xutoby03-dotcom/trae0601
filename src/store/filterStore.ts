// @ts-nocheck
import { create } from "zustand";
import type {
  FilterCriteria,
  FilterState,
  EnvironmentTag,
  WeatherCondition,
  MicDirection,
  DistanceSense,
} from "@/types";
import {
  envTagList,
  weatherList,
  deviceBrandList,
  micDirectionList,
  distanceSenseList,
} from "@/utils/colors";

export type DeviceModel = string;
export type Distance = DistanceSense;

const DEFAULT_CRITERIA: FilterCriteria = {
  searchQuery: "",
  search: "",
  dateRange: null,
  dateStart: null,
  dateEnd: null,
  environmentTags: [],
  envTags: [],
  weather: [],
  weatherConditions: [],
  recorderModels: [],
  polarPatterns: [],
  micDirections: [],
  ambienceRange: [1, 10],
  ambienceMin: 1,
  ambienceMax: 10,
  distanceSense: [],
  distanceSenses: [],
  peakDbfsRange: [-20, 0],
  peakDbfsMin: -20,
  peakDbfsMax: 0,
  hasIssues: null,
  isLocked: null,
  onlyWithIssues: false,
  onlyWithoutIssues: false,
  onlyLocked: false,
  onlyUnlocked: false,
};

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

export function distanceToSense(d: Distance): DistanceSense {
  return d;
}
export function senseToDistance(s: DistanceSense): Distance {
  return s;
}

interface FilterStoreFull extends FilterState {
  search: string;
  envTags: EnvironmentTag[];
  weathers: WeatherCondition[];
  devices: DeviceModel[];
  micPatterns: MicDirection[];
  distances: DistanceSense[];
  ambienceMin: number;
  ambienceMax: number;
  peakMin: number;
  peakMax: number;
  dateFrom: string | null;
  dateTo: string | null;
  onlyWithIssues: boolean;
  onlyUnlocked: boolean;

  applied: FilterCriteria;
  tempFilter: FilterCriteria;

  toggleEnvTag: (tag: EnvironmentTag) => void;
  toggleWeather: (w: WeatherCondition) => void;
  toggleDevice: (d: DeviceModel) => void;
  toggleRecorderModel: (d: DeviceModel) => void;
  toggleMicDirection: (d: MicDirection) => void;
  toggleMicPattern: (p: MicDirection) => void;
  toggleDistance: (d: Distance) => void;
  toggleDistanceSense: (d: DistanceSense) => void;

  setAmbienceRange: (min: number, max: number) => void;
  setPeakRange: (min: number, max: number) => void;
  setSearch: (s: string) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  toggleOnlyWithIssues: () => void;
  toggleOnlyUnlocked: () => void;

  apply: () => void;
  applyFilter: () => void;
  reset: () => void;
}

export const useFilterStore = create<FilterStoreFull>((set, get) => ({
  search: "",
  envTags: [],
  weathers: [],
  devices: [],
  micPatterns: [],
  distances: [],
  ambienceMin: 1,
  ambienceMax: 10,
  peakMin: -20,
  peakMax: 0,
  dateFrom: null,
  dateTo: null,
  onlyWithIssues: false,
  onlyUnlocked: false,

  criteria: { ...DEFAULT_CRITERIA },
  applied: { ...DEFAULT_CRITERIA },
  tempFilter: { ...DEFAULT_CRITERIA },
  applied: false as unknown as FilterCriteria,

  setCriteria: (partial) =>
    set((state) => {
      const next = { ...state.criteria, ...partial };
      return {
        criteria: next,
        search: partial.searchQuery ?? partial.search ?? state.search,
        envTags: partial.environmentTags ?? partial.envTags ?? state.envTags,
        weathers: partial.weather ?? partial.weatherConditions ?? state.weathers,
        devices: partial.recorderModels ?? state.devices,
        micPatterns: partial.polarPatterns ?? partial.micDirections ?? state.micPatterns,
        distances: partial.distanceSense ?? partial.distanceSenses ?? state.distances,
        ambienceMin: partial.ambienceRange?.[0] ?? partial.ambienceMin ?? state.ambienceMin,
        ambienceMax: partial.ambienceRange?.[1] ?? partial.ambienceMax ?? state.ambienceMax,
        peakMin: partial.peakDbfsRange?.[0] ?? partial.peakDbfsMin ?? state.peakMin,
        peakMax: partial.peakDbfsRange?.[1] ?? partial.peakDbfsMax ?? state.peakMax,
        dateFrom: partial.dateRange?.start ?? partial.dateStart ?? state.dateFrom,
        dateTo: partial.dateRange?.end ?? partial.dateEnd ?? state.dateTo,
        onlyWithIssues:
          partial.hasIssues === true
            ? true
            : partial.onlyWithIssues ?? state.onlyWithIssues,
        onlyWithoutIssues:
          partial.hasIssues === false
            ? true
            : partial.onlyWithoutIssues ?? state.onlyWithoutIssues,
        onlyLocked:
          partial.isLocked === true ? true : partial.onlyLocked ?? state.onlyLocked,
        onlyUnlocked:
          partial.isLocked === false
            ? true
            : partial.onlyUnlocked ?? state.onlyUnlocked,
      };
    }),

  toggleEnvTag: (tag) =>
    set((s) => {
      const envTags = toggleArr(s.envTags, tag);
      return {
        envTags,
        criteria: { ...s.criteria, environmentTags: envTags, envTags },
      };
    }),

  toggleWeather: (w) =>
    set((s) => {
      const weathers = toggleArr(s.weathers, w);
      return {
        weathers,
        criteria: { ...s.criteria, weather: weathers, weatherConditions: weathers },
      };
    }),

  toggleDevice: (d) =>
    set((s) => {
      const devices = toggleArr(s.devices, d);
      return {
        devices,
        criteria: { ...s.criteria, recorderModels: devices },
      };
    }),
  toggleRecorderModel: (d) => get().toggleDevice(d),

  toggleMicPattern: (p) =>
    set((s) => {
      const micPatterns = toggleArr(s.micPatterns, p);
      return {
        micPatterns,
        criteria: { ...s.criteria, polarPatterns: micPatterns, micDirections: micPatterns },
      };
    }),
  toggleMicDirection: (d) => get().toggleMicPattern(d),

  toggleDistance: (d) =>
    set((s) => {
      const sense = distanceToSense(d);
      const distances = toggleArr(s.distances, sense);
      return {
        distances,
        criteria: { ...s.criteria, distanceSense: distances, distanceSenses: distances },
      };
    }),
  toggleDistanceSense: (sense) => get().toggleDistance(sense),

  setAmbienceRange: (min, max) =>
    set((s) => ({
      ambienceMin: min,
      ambienceMax: max,
      criteria: {
        ...s.criteria,
        ambienceMin: min,
        ambienceMax: max,
        ambienceRange: [min, max],
      },
    })),

  setPeakRange: (min, max) =>
    set((s) => ({
      peakMin: min,
      peakMax: max,
      criteria: {
        ...s.criteria,
        peakDbfsMin: min,
        peakDbfsMax: max,
        peakDbfsRange: [min, max],
      },
    })),

  setSearch: (search) =>
    set((s) => ({
      search,
      criteria: { ...s.criteria, search, searchQuery: search },
    })),

  setDateRange: (from, to) =>
    set((s) => ({
      dateFrom: from,
      dateTo: to,
      criteria: {
        ...s.criteria,
        dateStart: from,
        dateEnd: to,
        dateRange: from || to ? { start: from ?? "", end: to ?? "" } : null,
      },
    })),

  toggleOnlyWithIssues: () =>
    set((s) => ({
      onlyWithIssues: !s.onlyWithIssues,
      criteria: {
        ...s.criteria,
        onlyWithIssues: !s.onlyWithIssues,
        hasIssues: !s.onlyWithIssues ? true : s.onlyWithoutIssues ? false : null,
      },
    })),

  toggleOnlyUnlocked: () =>
    set((s) => ({
      onlyUnlocked: !s.onlyUnlocked,
      criteria: {
        ...s.criteria,
        onlyUnlocked: !s.onlyUnlocked,
        isLocked: !s.onlyUnlocked ? false : s.onlyLocked ? true : null,
      },
    })),

  apply: () =>
    set((s) => {
      const applied: FilterCriteria = {
        ...s.criteria,
        search: s.search,
        searchQuery: s.search,
        environmentTags: [...s.envTags],
        envTags: [...s.envTags],
        weather: [...s.weathers],
        weatherConditions: [...s.weathers],
        recorderModels: [...s.devices],
        polarPatterns: [...s.micPatterns],
        micDirections: [...s.micPatterns],
        ambienceMin: s.ambienceMin,
        ambienceMax: s.ambienceMax,
        ambienceRange: [s.ambienceMin, s.ambienceMax],
        distanceSense: [...s.distances],
        distanceSenses: [...s.distances],
        peakDbfsMin: s.peakMin,
        peakDbfsMax: s.peakMax,
        peakDbfsRange: [s.peakMin, s.peakMax],
        dateStart: s.dateFrom,
        dateEnd: s.dateTo,
        dateRange:
          s.dateFrom || s.dateTo
            ? { start: s.dateFrom ?? "", end: s.dateTo ?? "" }
            : null,
        onlyWithIssues: s.onlyWithIssues,
        onlyWithoutIssues: s.onlyWithoutIssues,
        onlyLocked: s.onlyLocked,
        onlyUnlocked: s.onlyUnlocked,
        hasIssues: s.onlyWithIssues
          ? true
          : s.onlyWithoutIssues
          ? false
          : null,
        isLocked: s.onlyLocked ? true : s.onlyUnlocked ? false : null,
      };
      return { applied, tempFilter: applied, criteria: applied } as any;
    }),
  applyFilter: () => get().apply(),

  reset: () =>
    set(() => ({
      search: "",
      envTags: [],
      weathers: [],
      devices: [],
      micPatterns: [],
      distances: [],
      ambienceMin: 1,
      ambienceMax: 10,
      peakMin: -20,
      peakMax: 0,
      dateFrom: null,
      dateTo: null,
      onlyWithIssues: false,
      onlyUnlocked: false,
      criteria: { ...DEFAULT_CRITERIA },
      applied: { ...DEFAULT_CRITERIA },
      tempFilter: { ...DEFAULT_CRITERIA },
    })),
}));

export const deviceModelList: string[] = deviceBrandList;
