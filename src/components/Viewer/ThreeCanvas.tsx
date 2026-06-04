import React, { useRef, useImperativeHandle } from 'react';
import { useScene, ViewPresetDirection } from './useScene';
import { useModelLoader } from './useModelLoader';
import { useRaycaster } from '../../hooks/useRaycaster';
import { SceneSettings, ModelInfo, HitPoint, ScreenPoint } from '../../types';

export interface ThreeCanvasHandle {
  animateToView: (preset: ViewPresetDirection) => void;
  resetToInitial: () => void;
  clearHighlight: () => void;
  saveInitialCamera: () => void;
  computeAndSetInitialCamera: () => void;
}

interface ThreeCanvasProps {
  settings: SceneSettings;
  onModelLoaded: (info: ModelInfo) => void;
  onHitPoint: (hit: HitPoint | null) => void;
  onScreenPointUpdate?: (screenPoint: ScreenPoint | null) => void;
  fileToLoad: File | null;
  onLoadComplete: () => void;
  onScreenshotRequest: (() => void) | null;
  hitPoint: HitPoint | null;
  ref?: React.Ref<ThreeCanvasHandle>;
}

export function ThreeCanvas({
  settings,
  onModelLoaded,
  onHitPoint,
  onScreenPointUpdate,
  fileToLoad,
  onLoadComplete,
  onScreenshotRequest,
  hitPoint,
  ref
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer, addModel, updateSettings, animateToView, resetToInitial, saveInitialCamera, computeAndSetInitialCamera } = useScene(containerRef);
  const { loadModel } = useModelLoader();
  const { clearHighlight } = useRaycaster({ scene, camera, containerRef, onHit: onHitPoint });
  const projIdRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    animateToView,
    resetToInitial,
    clearHighlight,
    saveInitialCamera,
    computeAndSetInitialCamera
  }), [animateToView, resetToInitial, clearHighlight, saveInitialCamera, computeAndSetInitialCamera]);

  React.useEffect(() => {
    updateSettings(settings);
  }, [settings, updateSettings]);

  React.useEffect(() => {
    if (!hitPoint || !camera.current || !containerRef.current || !onScreenPointUpdate) {
      cancelAnimationFrame(projIdRef.current);
      onScreenPointUpdate?.(null);
      return;
    }

    const updateProjection = () => {
      if (!camera.current || !containerRef.current || !onScreenPointUpdate) return;

      const rect = containerRef.current.getBoundingClientRect();
      const vec = hitPoint.point.clone().project(camera.current);
      const x = (vec.x + 1) / 2 * rect.width + rect.left;
      const y = (-vec.y + 1) / 2 * rect.height + rect.top;

      onScreenPointUpdate({ x, y });
      projIdRef.current = requestAnimationFrame(updateProjection);
    };

    updateProjection();

    return () => {
      cancelAnimationFrame(projIdRef.current);
    };
  }, [hitPoint, camera, containerRef, onScreenPointUpdate]);

  React.useEffect(() => {
    if (fileToLoad) {
      loadModel(fileToLoad, settings.materialColor, settings.renderMode)
        .then(({ model, info }) => {
          addModel(model);
          onModelLoaded(info);
          computeAndSetInitialCamera();
          onLoadComplete();
        })
        .catch((error) => {
          console.error('加载模型失败:', error);
          alert('模型加载失败: ' + error.message);
          onLoadComplete();
        });
    }
  }, [fileToLoad, loadModel, addModel, onModelLoaded, computeAndSetInitialCamera, onLoadComplete, settings.materialColor, settings.renderMode]);

  React.useEffect(() => {
    if (onScreenshotRequest && renderer.current && scene.current && camera.current) {
      const handler = () => {
        import('../../utils/screenshot').then(({ takeScreenshot }) => {
          if (renderer.current && scene.current && camera.current) {
            takeScreenshot(renderer.current, scene.current, camera.current);
          }
        });
      };
      handler();
    }
  }, [onScreenshotRequest, renderer, scene, camera]);

  React.useEffect(() => {
    if (scene.current) {
      const modelGroup = scene.current.children.find(
        child => child.type === 'Group'
      );
      if (modelGroup) {
        import('../../utils/modelUtils').then(({ applyMaterialToModel }) => {
          applyMaterialToModel(modelGroup, settings.materialColor, settings.renderMode);
        });
      }
    }
  }, [settings.materialColor, settings.renderMode, scene]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ cursor: 'grab' }}
      onMouseDown={(e) => {
        if (e.button === 0) e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.cursor = 'grab';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.cursor = 'grab';
      }}
    />
  );
}
