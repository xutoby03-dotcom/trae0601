import { useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import { applyAllFilters } from '../utils/filterAlgorithms';
import { drawTextLayer, drawDrawingLayer, drawMosaicLayer, drawCutoutLayer, imageDataToCanvas, isPointInLayer, getLayerBounds } from '../utils/canvasUtils';
import { drawPathOnCanvas } from '../utils/lassoUtils';
import type { Point, TextLayer, DrawingLayer, MosaicLayer, CutoutLayer, ImageLayer } from '../types';

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const dragLayerRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });

  const {
    layers,
    selectedLayerId,
    activeTool,
    cropSettings,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    currentDrawingPath,
    currentMosaicPath,
    lassoPoints,
    isDrawingLasso,
    selectLayer,
    updateLayer,
    setActiveTool,
    setCropSettings,
    startDrawingPath,
    addDrawingPoint,
    finishDrawingPath,
    startMosaicPath,
    addMosaicPoint,
    finishMosaicPath,
    startLasso,
    addLassoPoint,
    finishLasso,
    getSelectedLayer,
    getBaseImageData,
  } = useEditorStore();

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offsetX) / scale;
    const y = (e.clientY - rect.top - offsetY) / scale;
    return { x, y };
  }, [scale, offsetX, offsetY]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const baseImageData = getBaseImageData();
    for (const layer of layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blendMode;

      if (layer.type === 'image' && layer.imageData) {
        const filteredData = applyAllFilters(layer.imageData, (layer as ImageLayer).filters);
        const tempCanvas = imageDataToCanvas(filteredData);
        ctx.drawImage(tempCanvas, layer.x, layer.y);
      } else if (layer.type === 'text') {
        drawTextLayer(ctx, layer as TextLayer);
      } else if (layer.type === 'drawing') {
        drawDrawingLayer(ctx, layer as DrawingLayer);
      } else if (layer.type === 'mosaic' && baseImageData) {
        drawMosaicLayer(ctx, layer as MosaicLayer, baseImageData);
      } else if (layer.type === 'cutout') {
        drawCutoutLayer(ctx, layer as CutoutLayer);
      }

      ctx.restore();
    }

    if (currentDrawingPath && currentDrawingPath.points.length > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentDrawingPath.color;
      ctx.lineWidth = currentDrawingPath.size;
      ctx.beginPath();
      ctx.moveTo(currentDrawingPath.points[0].x, currentDrawingPath.points[0].y);
      for (let i = 1; i < currentDrawingPath.points.length; i++) {
        const xc = (currentDrawingPath.points[i].x + currentDrawingPath.points[i - 1].x) / 2;
        const yc = (currentDrawingPath.points[i].y + currentDrawingPath.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(currentDrawingPath.points[i - 1].x, currentDrawingPath.points[i - 1].y, xc, yc);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (currentMosaicPath && currentMosaicPath.points.length > 0 && baseImageData) {
      const tempCanvas = imageDataToCanvas(baseImageData);
      const tempCtx = tempCanvas.getContext('2d')!;
      
      for (const point of currentMosaicPath.points) {
        const x = Math.floor(point.x - currentMosaicPath.brushSize / 2);
        const y = Math.floor(point.y - currentMosaicPath.brushSize / 2);
        const sampleX = Math.max(0, x);
        const sampleY = Math.max(0, y);
        const sampleW = Math.min(currentMosaicPath.brushSize, canvasWidth - sampleX);
        const sampleH = Math.min(currentMosaicPath.brushSize, canvasHeight - sampleY);
        
        if (sampleW > 0 && sampleH > 0) {
          const blockData = tempCtx.getImageData(sampleX, sampleY, sampleW, sampleH);
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          for (let i = 0; i < blockData.data.length; i += 4) {
            if (blockData.data[i + 3] > 0) {
              r += blockData.data[i];
              g += blockData.data[i + 1];
              b += blockData.data[i + 2];
              a += blockData.data[i + 3];
              count++;
            }
          }
          if (count > 0) {
            ctx.fillStyle = `rgba(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}, ${Math.round(a/count)/255})`;
            ctx.fillRect(sampleX, sampleY, sampleW, sampleH);
          }
        }
      }
    }

    if (cropSettings.active) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, cropSettings.y);
      ctx.fillRect(0, cropSettings.y + cropSettings.height, canvasWidth, canvasHeight - cropSettings.y - cropSettings.height);
      ctx.fillRect(0, cropSettings.y, cropSettings.x, cropSettings.height);
      ctx.fillRect(cropSettings.x + cropSettings.width, cropSettings.y, canvasWidth - cropSettings.x - cropSettings.width, cropSettings.height);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropSettings.x, cropSettings.y, cropSettings.width, cropSettings.height);

      const handles = [
        { x: cropSettings.x, y: cropSettings.y, cursor: 'nwse-resize' },
        { x: cropSettings.x + cropSettings.width, y: cropSettings.y, cursor: 'nesw-resize' },
        { x: cropSettings.x, y: cropSettings.y + cropSettings.height, cursor: 'nesw-resize' },
        { x: cropSettings.x + cropSettings.width, y: cropSettings.y + cropSettings.height, cursor: 'nwse-resize' },
        { x: cropSettings.x + cropSettings.width / 2, y: cropSettings.y, cursor: 'ns-resize' },
        { x: cropSettings.x + cropSettings.width / 2, y: cropSettings.y + cropSettings.height, cursor: 'ns-resize' },
        { x: cropSettings.x, y: cropSettings.y + cropSettings.height / 2, cursor: 'ew-resize' },
        { x: cropSettings.x + cropSettings.width, y: cropSettings.y + cropSettings.height / 2, cursor: 'ew-resize' },
      ];

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      for (const handle of handles) {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    if (isDrawingLasso && lassoPoints.length > 0) {
      drawPathOnCanvas(ctx, lassoPoints, '#3b82f6', 2);
    }

    if (selectedLayerId && activeTool === 'select') {
      const selectedLayer = layers.find((l) => l.id === selectedLayerId);
      if (selectedLayer) {
        const bounds = getLayerBounds(selectedLayer);
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [
    layers, selectedLayerId, activeTool, cropSettings,
    canvasWidth, canvasHeight, scale, offsetX, offsetY,
    currentDrawingPath, currentMosaicPath, lassoPoints, isDrawingLasso,
    getBaseImageData
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'select') {
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (!layer.locked && isPointInLayer(point, layer)) {
          selectLayer(layer.id);
          isDraggingRef.current = true;
          dragLayerRef.current = layer.id;
          dragOffsetRef.current = { x: point.x - layer.x, y: point.y - layer.y };
          return;
        }
      }
      selectLayer(null);
    } else if (activeTool === 'crop') {
      if (!cropSettings.active) {
        setCropSettings({
          active: true,
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
        });
      }
    } else if (activeTool === 'drawing') {
      const selectedLayer = getSelectedLayer() as DrawingLayer | null;
      if (selectedLayer?.type === 'drawing') {
        startDrawingPath(point, selectedLayer.brushColor, selectedLayer.brushSize);
      }
    } else if (activeTool === 'mosaic') {
      const selectedLayer = getSelectedLayer() as MosaicLayer | null;
      if (selectedLayer?.type === 'mosaic') {
        startMosaicPath(point);
      }
    } else if (activeTool === 'lasso') {
      if (!isDrawingLasso) {
        startLasso(point);
      }
    }
  }, [
    activeTool, layers, getCanvasCoordinates, selectLayer,
    cropSettings, canvasWidth, canvasHeight, setCropSettings,
    getSelectedLayer, startDrawingPath, startMosaicPath,
    isDrawingLasso, startLasso
  ]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);

    if (isDraggingRef.current && dragLayerRef.current) {
      const newX = point.x - dragOffsetRef.current.x;
      const newY = point.y - dragOffsetRef.current.y;
      updateLayer(dragLayerRef.current, { x: newX, y: newY });
    } else if (activeTool === 'drawing' && currentDrawingPath) {
      addDrawingPoint(point);
    } else if (activeTool === 'mosaic' && currentMosaicPath) {
      addMosaicPoint(point);
    } else if (activeTool === 'lasso' && isDrawingLasso) {
      addLassoPoint(point);
    }
  }, [
    getCanvasCoordinates, updateLayer, activeTool,
    currentDrawingPath, currentMosaicPath, isDrawingLasso,
    addDrawingPoint, addMosaicPoint, addLassoPoint
  ]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    dragLayerRef.current = null;

    if (activeTool === 'drawing' && currentDrawingPath) {
      finishDrawingPath();
    } else if (activeTool === 'mosaic' && currentMosaicPath) {
      finishMosaicPath();
    }
  }, [activeTool, currentDrawingPath, currentMosaicPath, finishDrawingPath, finishMosaicPath]);

  const handleDoubleClick = useCallback(() => {
    if (activeTool === 'lasso' && isDrawingLasso && lassoPoints.length > 2) {
      finishLasso();
    }
  }, [activeTool, isDrawingLasso, lassoPoints.length, finishLasso]);

  useEffect(() => {
    render();
  }, [render]);

  return {
    canvasRef,
    containerRef,
    render,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
  };
};
