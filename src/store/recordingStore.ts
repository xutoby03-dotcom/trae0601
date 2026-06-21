// @ts-nocheck
import { create } from "zustand";
import type {
  Recording,
  Annotation,
  AnnotationType,
  EnvironmentTag,
  FilterCriteria,
  LicenseInfo,
  LicenseType,
} from "@/types";
import { recordings as generatedRecordings, projects as generatedProjects } from "@/data/mockRecordings";
import { distanceToSense, senseToDistance, getLockProjectName, licenseTypeLabelMap } from "@/lib/colors";
import type { Distance, DistanceSense, Project } from "@/types";

export { getLockProjectName, licenseTypeLabelMap };

export const projects: Project[] = generatedProjects;

function buildFromGenerated(): Recording[] {
  return generatedRecordings.map((r) => {
    const envTags = r.environmentTags ?? [];
    const ambience = r.ambienceScore;
    const peakDb = r.peakDbfs;
    const distance = senseToDistance(r.distanceSense);
    const device = (r.recorderModel as any) ?? undefined;
    const locked = r.isLocked;
    const lockedByProject = r.lockedByProjectId;

    return {
      ...r,
      envTags,
      ambience,
      peakDb,
      distance,
      device,
      locked,
      lockedByProject,
      tags: (r as any).tags ?? envTags,
    };
  });
}

const initialRecordings = buildFromGenerated();

interface RecordingStoreFull {
  recordings: Recording[];
  getById: (id: string | null | undefined) => Recording | undefined;
  getRecordingById: (id: string | null | undefined) => Recording | undefined;
  getFiltered: (criteria?: FilterCriteria) => Recording[];
  updateRecording: (id: string, patch: Partial<Recording>) => void;
  addAnnotation: (recordingId: string, data: { type: AnnotationType; startTime: number; endTime: number; note?: string }) => void;
  deleteAnnotation: (recordingId: string, annotationId: string) => void;
  addEnvTags: (id: string, tags: EnvironmentTag[]) => void;
  lockRecordingWithLicense: (id: string, info: LicenseInfo) => void;
  unlockRecording: (id: string) => void;
}

function matchEnvTag(r: Recording, arr?: EnvironmentTag[]) {
  if (!arr || arr.length === 0) return true;
  const target = r.envTags ?? r.environmentTags ?? [];
  return arr.some((t) => target.includes(t));
}

function matchDistance(r: Recording, arr?: DistanceSense[]) {
  if (!arr || arr.length === 0) return true;
  const ds = r.distanceSense ?? (r.distance ? distanceToSense(r.distance) : undefined);
  return ds ? arr.includes(ds) : true;
}

function filterRecordings(list: Recording[], c?: FilterCriteria) {
  if (!c) return list;
  return list.filter((r) => {
    if (c.search && c.search.trim()) {
      const q = c.search.trim().toLowerCase();
      if (
        !r.title.toLowerCase().includes(q) &&
        !r.locationName.toLowerCase().includes(q) &&
        !(r.notes ?? "").toLowerCase().includes(q) &&
        !(r.description ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (!matchEnvTag(r, c.envTags)) return false;
    if (c.weathers && c.weathers.length > 0 && !c.weathers.includes(r.weather)) return false;
    if (c.devices && c.devices.length > 0) {
      const d = r.device ?? r.recorderModel;
      if (!d || !c.devices.includes(d as any)) return false;
    }
    if (c.micPatterns && c.micPatterns.length > 0 && !c.micPatterns.includes(r.polarPattern)) return false;
    if (!matchDistance(r, c.distances)) return false;

    const amb = r.ambience ?? r.ambienceScore ?? 0;
    if (c.ambienceMin != null && amb < c.ambienceMin) return false;
    if (c.ambienceMax != null && amb > c.ambienceMax) return false;

    const pk = r.peakDb ?? r.peakDbfs ?? -Infinity;
    if (c.peakMin != null && pk < c.peakMin) return false;
    if (c.peakMax != null && pk > c.peakMax) return false;

    if (c.dateFrom && r.recordedAt < c.dateFrom) return false;
    if (c.dateTo && r.recordedAt > c.dateTo) return false;

    if (c.onlyWithIssues && !r.hasIssues) return false;
    if (c.onlyUnlocked && (r.isLocked || r.locked)) return false;

    return true;
  });
}

export const useRecordingStore = create<RecordingStoreFull>((set, get) => ({
  recordings: initialRecordings,

  getById: (id) => (id == null ? undefined : get().recordings.find((r) => r.id === id)),
  getRecordingById: (id) => (id == null ? undefined : get().recordings.find((r) => r.id === id)),

  getFiltered: (criteria) => filterRecordings(get().recordings, criteria),

  updateRecording: (id, patch) =>
    set((s) => ({
      recordings: s.recordings.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  addAnnotation: (recordingId, data) =>
    set((s) => ({
      recordings: s.recordings.map((r) => {
        if (r.id !== recordingId) return r;
        const newAnn: Annotation = {
          id: `ann-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          type: data.type,
          startTime: Number(data.startTime.toFixed(2)),
          endTime: Number(data.endTime.toFixed(2)),
          note: data.note,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        return { ...r, annotations: [...r.annotations, newAnn] };
      }),
    })),

  deleteAnnotation: (recordingId, annotationId) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === recordingId
          ? { ...r, annotations: r.annotations.filter((a) => a.id !== annotationId) }
          : r
      ),
    })),

  addEnvTags: (id, tags) =>
    set((s) => ({
      recordings: s.recordings.map((r) => {
        if (r.id !== id) return r;
        const merged = Array.from(new Set([...(r.environmentTags ?? []), ...tags]));
        return {
          ...r,
          environmentTags: merged,
          envTags: merged,
        };
      }),
    })),

  lockRecordingWithLicense: (id, info) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === id
          ? {
              ...r,
              isLocked: true,
              locked: true,
              lockedByProjectId: info.projectId,
              lockedByProject: info.projectId,
              licenseInfo: info,
              license: {
                licensed: true,
                projectId: info.projectId,
                projectName: info.projectName,
                type: info.licenseType,
                startedAt: info.licensedAt,
                expiresAt: info.expiresAt,
                note: info.notes,
              },
            }
          : r
      ),
    })),

  unlockRecording: (id) =>
    set((s) => ({
      recordings: s.recordings.map((r) =>
        r.id === id
          ? {
              ...r,
              isLocked: false,
              locked: false,
              lockedByProjectId: null,
              lockedByProject: null,
              licenseInfo: null,
              license: { licensed: false },
            }
          : r
      ),
    })),
}));

export { projects as mockProjects };

// 兼容旧 store/index.ts 导出
export function getAllProjects(): Project[] {
  return projects;
}
