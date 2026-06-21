// @ts-nocheck
import { create } from "zustand";
import type {
  Project,
  LicenseEvent,
  RecordingLicense,
  LicenseInfo,
} from "@/types";
import { projects as initialProjects } from "@/data/mockRecordings";
import { useRecordingStore } from "./recordingStore";

interface ProjectStoreState {
  projects: Project[];
  selectedProjectId: string | null;

  getById: (id: string) => Project | undefined;
  getByRecordingId: (recordingId: string) => Project | undefined;

  createProject: (
    data: Omit<Project, "id" | "createdAt" | "updatedAt" | "recordingIds"> & {
      recordingIds?: string[];
    }
  ) => void;
  deleteProject: (id: string) => void;
  addRecordingToProject: (projectId: string, recordingIds: string[]) => void;
  removeRecordingFromProject: (
    projectId: string,
    recordingId: string
  ) => void;
  lockRecordingWithLicense: (
    projectId: string,
    recordingId: string,
    licenseInfo: LicenseInfo
  ) => void;
  setSelectedProjectId: (id: string | null) => void;

  addLicenseEvent: (
    projectId: string,
    event: Omit<LicenseEvent, "id" | "projectId">
  ) => void;
}

const defaultGradients: Record<string, string> = {
  active: "from-emerald-600 via-teal-700 to-forest-900",
  planning: "from-sky-600 via-blue-700 to-indigo-900",
  completed: "from-amber-600 via-orange-700 to-rose-900",
};

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: [...initialProjects],
  selectedProjectId: null,

  getById: (id) => get().projects.find((p) => p.id === id),

  getByRecordingId: (recordingId) =>
    get().projects.find((p) => p.recordingIds.includes(recordingId)),

  createProject: (data) => {
    const now = new Date().toISOString().slice(0, 10);
    const id = `proj-${String(get().projects.length + 1).padStart(3, "0")}`;
    const status = data.status ?? "planning";
    const newProject: Project = {
      id,
      name: data.name,
      client: data.client,
      clientName: data.clientName ?? data.client ?? null,
      description: data.description,
      coverGradient: (data.coverGradient || defaultGradients[status]) ?? defaultGradients.planning,
      coverImage: data.coverImage,
      recordingIds: data.recordingIds || [],
      status,
      usedRecordingCount: data.usedRecordingCount ?? 0,
      targetRecordingCount: data.targetRecordingCount ?? 20,
      license: data.license ?? {
        isLicensed: false,
        type: "non_exclusive",
        permanent: false,
        note: "",
        startedAt: "",
        expiresAt: null,
      },
      licenseTimeline: data.licenseTimeline ?? [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId:
        state.selectedProjectId === id ? null : state.selectedProjectId,
    }));
    const { unlockRecording } = useRecordingStore.getState();
    const recs = useRecordingStore.getState().recordings;
    recs.forEach((r) => {
      if (r.lockedByProjectId === id) {
        unlockRecording(r.id);
      }
    });
  },

  addRecordingToProject: (projectId, recordingIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              recordingIds: Array.from(new Set([...p.recordingIds, ...recordingIds])),
              usedRecordingCount: Array.from(
                new Set([...p.recordingIds, ...recordingIds])
              ).length,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p
      ),
    })),

  removeRecordingFromProject: (projectId, recordingId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              recordingIds: p.recordingIds.filter((id) => id !== recordingId),
              usedRecordingCount: p.recordingIds.filter(
                (id) => id !== recordingId
              ).length,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : p
      ),
    }));
    const rec = useRecordingStore
      .getState()
      .recordings.find((r) => r.id === recordingId);
    if (rec && rec.lockedByProjectId === projectId) {
      useRecordingStore.getState().unlockRecording(recordingId);
    }
  },

  lockRecordingWithLicense: (projectId, recordingId, licenseInfo) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const newIds = Array.from(new Set([...p.recordingIds, recordingId]));
        const event: LicenseEvent = {
          id: `evt-${Date.now()}`,
          projectId,
          recordingId,
          title: `${licenseInfo.licenseType === "exclusive" ? "独家" : "非独家"}授权锁定`,
          date: licenseInfo.licensedAt.slice(0, 10),
          description: licenseInfo.notes || "素材授权锁定",
          tone: "success",
          label: licenseInfo.licenseType === "exclusive" ? "独家锁定" : "锁定",
          operator: "当前用户",
          licenseType: licenseInfo.licenseType,
        };
        return {
          ...p,
          recordingIds: newIds,
          usedRecordingCount: newIds.length,
          licenseTimeline: [...(p.licenseTimeline ?? []), event],
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }),
    }));
    const { updateRecording } = useRecordingStore.getState();
    const rec = useRecordingStore.getState().recordings.find(
      (r) => r.id === recordingId
    );
    if (rec) {
      updateRecording(recordingId, {
        ...rec,
        isLocked: true,
        lockedByProjectId: projectId,
        licenseInfo,
      });
    }
  },

  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  addLicenseEvent: (projectId, event) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              licenseTimeline: [
                ...(p.licenseTimeline ?? []),
                { ...event, id: `evt-${Date.now()}`, projectId },
              ],
            }
          : p
      ),
    })),
}));

export const defaultProjectGradients: Record<string, string> = defaultGradients;

export function applyLicenseToProject(
  projects: Project[],
  projectId: string,
  recordingId: string,
  license: RecordingLicense
): Project[] {
  return projects.map((p) => {
    if (p.id !== projectId) return p;
    const newIds = Array.from(new Set([...p.recordingIds, recordingId]));
    const event: LicenseEvent = {
      id: `evt-${Date.now()}`,
      projectId,
      recordingId,
      title: `${license.licenseType === "exclusive" ? "独家" : "非独家"}授权锁定`,
      date: (license.startedAt ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      description: license.note || "素材授权锁定",
      tone: "success",
      label: license.licenseType === "exclusive" ? "独家锁定" : "锁定",
      operator: "当前用户",
      licenseType: license.licenseType,
    };
    return {
      ...p,
      recordingIds: newIds,
      usedRecordingCount: newIds.length,
      licenseTimeline: [...(p.licenseTimeline ?? []), event],
    };
  });
}
