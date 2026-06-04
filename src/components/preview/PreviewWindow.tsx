import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { PreviewEngine } from '@/engine/PreviewEngine';
import { PlaybackControls } from './PlaybackControls';
import { TimecodeDisplay } from './TimecodeDisplay';

export function PreviewWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PreviewEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const currentProject = useProjectStore((state) => state.currentProject);
  const { isPlaying, currentTime, fps, setCurrentTime, duration } = usePlaybackStore();
  const { tracks, clips, mediaItems } = useTimelineStore();
  
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !currentProject) return;

    const engine = new PreviewEngine(canvasRef.current, {
      width: currentProject.width,
      height: currentProject.height,
      fps: currentProject.fps,
    });
    
    engineRef.current = engine;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      engine.dispose();
    };
  }, [currentProject]);

  useEffect(() => {
    if (!engineRef.current || !currentProject) return;

    const compose = async () => {
      if (!isComposing) {
        setIsComposing(true);
        try {
          await engineRef.current!.composeFrame(currentTime, tracks, clips, mediaItems);
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
