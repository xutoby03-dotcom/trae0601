import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Toolbar } from '@/components/layout/Toolbar';
import { MediaLibraryPanel } from '@/components/media-library/MediaLibraryPanel';
import { PreviewWindow } from '@/components/preview/PreviewWindow';
import { Timeline } from '@/components/timeline/Timeline';
import { PropertiesPanel } from '@/components/properties/PropertiesPanel';
import { useHistoryStore } from '@/store/useHistoryStore';

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  
  const { currentProject, openProject, loadProjects, refreshThumbnail, saveCurrentProject } = useProjectStore();
  const { loadProjectData, createDefaultTracks, tracks, clips, saveProjectData } = useTimelineStore();
  const { setFps, setDuration } = usePlaybackStore();
  const { clearHistory } = useHistoryStore();

  useKeyboardShortcuts();

  useEffect(() => {
    if (projectId) {
      openProject(projectId);
      loadProjectData(projectId);
    }
  }, [projectId, openProject, loadProjectData]);

  useEffect(() => {
    if (currentProject) {
      setFps(currentProject.fps);
      
      if (tracks.length === 0) {
        createDefaultTracks(currentProject.id);
      }
      
      clearHistory();
    }
  }, [currentProject, tracks.length, createDefaultTracks, setFps, clearHistory]);

  useEffect(() => {
    if (clips.length > 0) {
      const maxEnd = Math.max(...clips.map((c) => c.end));
      setDuration(Math.max(maxEnd + 5, 60));
    }
  }, [clips, setDuration]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const saveWithThumbnail = async () => {
    if (!projectId || !currentProject) return;
    
    await refreshThumbnail();
    await saveCurrentProject();
    await saveProjectData(projectId);
  };

  useBeforeUnload(() => {
    if (projectId && currentProject) {
      saveWithThumbnail();
    }
  });

  useEffect(() => {
    let shouldSave = false;
    
    const handleBeforeNavigate = async () => {
      if (projectId && currentProject && isMountedRef.current) {
        await saveWithThumbnail();
      }
    };

    const cleanup = () => {
      if (shouldSave) {
        handleBeforeNavigate();
      }
    };

    shouldSave = true;
    return cleanup;
  }, [projectId, currentProject]);

  if (!currentProject && projectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900 text-white">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-900 text-white overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <MediaLibraryPanel />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <PreviewWindow />
          </div>
          
          <div className="h-80 flex-shrink-0">
            <Timeline />
          </div>
        </div>
        
        <div className="w-72 flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
