import React, { useRef, useImperativeHandle } from 'react';
import { useScene, ViewPresetDirection } from './useScene';
import { useModelLoader } from './useModelLoader';
import { useRaycaster } from '../../hooks/useRaycaster';
import { SceneSettings, ModelInfo, HitPoint } from '../../types';

export interface ThreeCanvasHandle {
  animateToView: (preset: ViewPresetDirection) => void;
  resetToInitial: () => void;
  clearHighlight: () => void;
  saveInitialCamera: () => void;
}

interface ThreeCanvasProps {
  settings: SceneSettings;
  onModelLoaded: (info: ModelInfo) => void;
  onHitPoint: (hit: HitPoint | null) => void;
  fileToLoad: File | null;
  onLoadComplete: () => void;
  onScreenshotRequest: (() => void) | null;
  ref?: React.Ref<ThreeCanvasHandle>;
}

export function ThreeCanvas({
  settings,
  onModelLoaded,
  onHitPoint,
  fileToLoad,
  onLoadComplete,
  onScreenshotRequest,
  ref
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scene, camera, renderer, addModel, updateSettings, resetCamera, animateToView, resetToInitial, saveInitialCamera } = useScene(containerRef);
  const { loadModel } = useModelLoader();
  const { clearHighlight } = useRaycaster({ scene, camera, containerRef, onHit: onHitPoint });

  useImperativeHandle(ref, () => ({
    animateToView,
    resetToInitial,
    clearHighlight,
    saveInitialCamera
  }), [animateToView, resetToInitial, clearHighlight, saveInitialCamera]);

  React.useEffect(() => {
    updateSettings(settings);
  }, [settings, updateSettings]);

  React.useEffect(() => {
    if (fileToLoad) {
      loadModel(fileToLoad, settings.materialColor, settings.renderMode)
        .then(({ model, info }) => {
          addModel(model);
          onModelLoaded(info);
          resetCamera();
          saveInitialCamera();
          onLoadComplete();
        })
        .catch((error) => {
          console.error('加载模型失败:', error);
          alert('模型加载失败: ' + error.message);
          onLoadComplete();
        });
    }
  }, [fileToLoad, loadModel, addModel, onModelLoaded, resetCamera, saveInitialCamera, onLoadComplete, settings.materialColor, settings.renderMode]);

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
