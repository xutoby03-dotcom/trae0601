import { create } from 'zustand';
import type { Project } from '@/types/project';
import * as db from '@/utils/indexedDB';
import { generateId } from '@/utils/timecode';

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  
  loadProjects: () => Promise<void>;
  createProject: (name: string, width?: number, height?: number, fps?: number) => Promise<Project>;
  openProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  updateProjectName: (name: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projects: [],
  isLoading: false,
  
  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await db.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      console.error('Failed to load projects:', error);
      set({ isLoading: false });
    }
  },
  
  createProject: async (name: string, width = 1920, height = 1080, fps = 30) => {
    const now = new Date();
    const project: Project = {
      id: generateId(),
      name,
      width,
      height,
      fps,
      duration: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.saveProject(project);
    set((state) => ({
      projects: [project, ...state.projects],
      currentProject: project,
    }));
    
    return project;
  },
  
  openProject: async (projectId: string) => {
    const project = await db.getProject(projectId);
    if (project) {
      set({ currentProject: project });
    }
  },
  
  deleteProject: async (projectId: string) => {
    await db.deleteProject(projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
    }));
  },
  
  saveCurrentProject: async () => {
    const { currentProject } = get();
    if (currentProject) {
      await db.saveProject({ ...currentProject, updatedAt: new Date() });
    }
  },
  
  updateProjectName: (name: string) => {
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, name } : null,
    }));
  },
}));
