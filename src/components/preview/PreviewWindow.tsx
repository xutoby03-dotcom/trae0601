import { useEffect, useRef, useState, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { PreviewEngine } from '@/engine/PreviewEngine';
import { PlaybackControls } from './PlaybackControls';
import { TimecodeDisplay } from './TimecodeDisplay';

const THUMBNAIL_WIDTH = 320;
const THUMBNAIL_HEIGHT = 180;
const THUMBNAIL_INTERVAL = 5000;

export function PreviewWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PreviewEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const thumbnailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const currentProject = useProjectStore((state) => state.currentProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const { isPlaying, currentTime, fps, setCurrentTime, duration } = usePlaybackStore();
  const { tracks, clips, mediaItems } = useTimelineStore();
  
  const [isComposing, setIsComposing] = useState(false);
  const hasComposedFirstFrameRef = useRef(false);
  const thumbnailScheduledRef = useRef(false);
  
  const isCanvasBlank = useCallback((canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      if (a !== 0 || r !== 0 || g !== 0 || b !== 0) {
        return false;
      }
    }
    
    return true;
  }, []);
  
  const generateThumbnail = useCallback(async (): Promise<string | null> => {
    if (!canvasRef.current) return null;
    
    if (isCanvasBlank(canvasRef.current)) {
      return null;
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(
        canvasRef.current,
        0, 0, canvasRef.current.width, canvasRef.current.height,
        0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT
      );
      
      if (isCanvasBlank(canvas)) {
        return null;
      }
      
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return null;
    }
  }, [isCanvasBlank]);
  
  const updateThumbnail = useCallback(async () => {
    if (!currentProject) return;
    
    const thumbnail = await generateThumbnail();
    if (thumbnail) {
      updateProject({ thumbnail });
    }
  }, [currentProject, generateThumbnail, updateProject]);

  useEffect(() => {
    if (!canvasRef.current || !currentProject) return;

    const engine = new PreviewEngine(canvasRef.current, {
      width: currentProject.width,
      height: currentProject.height,
      fps: currentProject.fps,
    });
    
    engineRef.current = engine;
    
    window.__thumbnailGenerator = generateThumbnail;
    
    const scheduleThumbnailUpdate = () => {
      thumbnailTimerRef.current = setTimeout(async () => {
        await updateThumbnail();
        scheduleThumbnailUpdate();
      }, THUMBNAIL_INTERVAL);
    };
    
    hasComposedFirstFrameRef.current = false;
    thumbnailScheduledRef.current = false;
    
    window.__scheduleFirstThumbnail = () => {
      if (!thumbnailScheduledRef.current) {
        thumbnailScheduledRef.current = true;
        setTimeout(async () => {
          await updateThumbnail();
          scheduleThumbnailUpdate();
        }, 100);
      }
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (thumbnailTimerRef.current) {
        clearTimeout(thumbnailTimerRef.current);
      }
      if (window.__thumbnailGenerator === generateThumbnail) {
        window.__thumbnailGenerator = undefined;
      }
      if (window.__scheduleFirstThumbnail) {
        window.__scheduleFirstThumbnail = undefined;
      }
      engine.dispose();
    };
  }, [currentProject, generateThumbnail, updateThumbnail]);

  useEffect(() => {
    if (!engineRef.current || !currentProject) return;

    const compose = async () => {
      if (!isComposing) {
        setIsComposing(true);
        try {
          await engineRef.current!.composeFrame(currentTime, tracks, clips, mediaItems);
          
          if (!hasComposedFirstFrameRef.current) {
            hasComposedFirstFrameRef.current = true;
            if (window.__scheduleFirstThumbnail) {
              window.__scheduleFirstThumbnail();
            }
          }
        } catch (error) {
          console.error('Error composing frame:', error);
        }
        setIsComposing(false);
      }
    };

    compose();
  }, [currentTime, tracks, clips, mediaItems, currentProject]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();
    
    const animate = async (timestamp: number) => {
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev: number) => {
        const next = prev + delta;
        if (next >= duration) {
          return 0;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, duration, setCurrentTime]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-900">
        <p className="text-zinc-500">请先打开或创建项目</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative" style={{ aspectRatio: `${currentProject.width}/${currentProject.height}` }}>
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full bg-black shadow-2xl rounded-lg"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between mb-3">
          <TimecodeDisplay />
          <div className="text-xs text-zinc-500">
            J: 后退 | K: 播放/暂停 | L: 前进
          </div>
        </div>
        <PlaybackControls />
      </div>
    </div>
  );
}
