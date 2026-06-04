import { openDB, IDBPDatabase } from 'idb';
import type { Project } from '@/types/project';
import type { MediaItem } from '@/types/media';
import type { Track, Clip, SubtitleClip } from '@/types/timeline';

const DB_NAME = 'video-editor-db';
const DB_VERSION = 1;

export interface ProjectData {
  project: Project;
  mediaItems: MediaItem[];
  tracks: Track[];
  clips: (Clip | SubtitleClip)[];
}

let db: IDBPDatabase | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (db) return db;
  
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('updatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('mediaItems')) {
        const mediaStore = db.createObjectStore('mediaItems', { keyPath: 'id' });
        mediaStore.createIndex('projectId', 'projectId');
      }
      if (!db.objectStoreNames.contains('tracks')) {
        const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
        trackStore.createIndex('projectId', 'projectId');
      }
      if (!db.objectStoreNames.contains('clips')) {
        const clipStore = db.createObjectStore('clips', { keyPath: 'id' });
        clipStore.createIndex('trackId', 'trackId');
      }
    },
  });
  
  return db;
}

export async function saveProject(project: Project): Promise<void> {
  const database = await initDB();
  await database.put('projects', {
    ...project,
    updatedAt: new Date(),
  });
}

export async function getProject(projectId: string): Promise<Project | undefined> {
  const database = await initDB();
  return await database.get('projects', projectId);
}

export async function getAllProjects(): Promise<Project[]> {
  const database = await initDB();
  const projects = await database.getAll('projects');
  return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function deleteProject(projectId: string): Promise<void> {
  const database = await initDB();
  
  const tx = database.transaction(['projects', 'mediaItems', 'tracks', 'clips'], 'readwrite');
  
  await tx.objectStore('projects').delete(projectId);
  
  const mediaItems = await tx.objectStore('mediaItems').index('projectId').getAll(projectId);
  for (const item of mediaItems) {
    await tx.objectStore('mediaItems').delete(item.id);
  }
  
  const tracks = await tx.objectStore('tracks').index('projectId').getAll(projectId);
  for (const track of tracks) {
    const clips = await tx.objectStore('clips').index('trackId').getAll(track.id);
    for (const clip of clips) {
      await tx.objectStore('clips').delete(clip.id);
    }
    await tx.objectStore('tracks').delete(track.id);
  }
  
  await tx.done;
}

export async function saveMediaItem(mediaItem: MediaItem): Promise<void> {
  const database = await initDB();
  await database.put('mediaItems', mediaItem);
}

export async function getMediaItemsForProject(projectId: string): Promise<MediaItem[]> {
  const database = await initDB();
  return await database.getAllFromIndex('mediaItems', 'projectId', projectId);
}

export async function saveTrack(track: Track): Promise<void> {
  const database = await initDB();
  await database.put('tracks', track);
}

export async function getTracksForProject(projectId: string): Promise<Track[]> {
  const database = await initDB();
  return await database.getAllFromIndex('tracks', 'projectId', projectId);
}

export async function saveClip(clip: Clip | SubtitleClip): Promise<void> {
  const database = await initDB();
  await database.put('clips', clip);
}

export async function deleteClip(clipId: string): Promise<void> {
  const database = await initDB();
  await database.delete('clips', clipId);
}

export async function getClipsForTrack(trackId: string): Promise<(Clip | SubtitleClip)[]> {
  const database = await initDB();
  return await database.getAllFromIndex('clips', 'trackId', trackId);
}

export async function saveAllProjectData(data: ProjectData): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(['projects', 'mediaItems', 'tracks', 'clips'], 'readwrite');
  
  await tx.objectStore('projects').put({
    ...data.project,
    updatedAt: new Date(),
  });
  
  for (const mediaItem of data.mediaItems) {
    await tx.objectStore('mediaItems').put(mediaItem);
  }
  
  for (const track of data.tracks) {
    await tx.objectStore('tracks').put(track);
  }
  
  for (const clip of data.clips) {
    await tx.objectStore('clips').put(clip);
  }
  
  await tx.done;
}

export async function loadProjectData(projectId: string): Promise<ProjectData | null> {
  const database = await initDB();
  
  const project = await database.get('projects', projectId);
  if (!project) return null;
  
  const mediaItems = await database.getAllFromIndex('mediaItems', 'projectId', projectId);
  const tracks = await database.getAllFromIndex('tracks', 'projectId', projectId);
  
  const clips: (Clip | SubtitleClip)[] = [];
  for (const track of tracks) {
    const trackClips = await database.getAllFromIndex('clips', 'trackId', track.id);
    clips.push(...trackClips);
  }
  
  return { project, mediaItems, tracks, clips };
}
