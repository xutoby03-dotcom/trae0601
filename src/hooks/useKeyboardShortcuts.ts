import { useEffect } from 'react';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useHistoryStore } from '@/store/useHistoryStore';

export function useKeyboardShortcuts(): void {
  const { togglePlay, seekByFrames, setCurrentTime, duration } = usePlaybackStore();
  const { selectedClipId, removeClip, duplicateClip, clips, tracks } = useTimelineStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
          
        case 'j':
          e.preventDefault();
          seekByFrames(-10);
          break;
          
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
          
        case 'l':
          e.preventDefault();
          seekByFrames(10);
          break;
          
        case 'arrowleft':
          e.preventDefault();
          if (e.shiftKey) {
            seekByFrames(-10);
          } else {
            seekByFrames(-1);
          }
          break;
          
        case 'arrowright':
          e.preventDefault();
          if (e.shiftKey) {
            seekByFrames(10);
          } else {
            seekByFrames(1);
          }
          break;
          
        case 'home':
          e.preventDefault();
          setCurrentTime(0);
          break;
          
        case 'end':
          e.preventDefault();
          setCurrentTime(duration);
          break;
          
        case 'delete':
        case 'backspace':
          e.preventDefault();
          if (selectedClipId) {
            removeClip(selectedClipId);
          }
          break;
          
        case 'd':
          if (e.altKey && selectedClipId) {
            e.preventDefault();
            duplicateClip(selectedClipId);
          }
          break;
          
        case 'z':
          if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
            e.preventDefault();
            if (canUndo()) {
              const snapshot = undo();
              if (snapshot) {
                useTimelineStore.getState().setTracks(snapshot.tracks);
                useTimelineStore.getState().setClips(snapshot.clips);
              }
            }
          }
          break;
          
        case 'y':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (canRedo()) {
              const snapshot = redo();
              if (snapshot) {
                useTimelineStore.getState().setTracks(snapshot.tracks);
                useTimelineStore.getState().setClips(snapshot.clips);
              }
            }
          }
          break;
          
        case 's':
          if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            console.log('Save project');
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekByFrames, setCurrentTime, duration, selectedClipId, removeClip, duplicateClip, undo, redo, canUndo, canRedo, clips, tracks]);
}
