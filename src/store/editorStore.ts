import { create } from 'zustand';
import type {
  Layer,
  ImageLayer,
  TextLayer,
  MosaicLayer,
  DrawingLayer,
  CutoutLayer,
  ToolType,
  CropSettings,
  FilterSettings,
  ExportSettings,
  Point,
  MosaicPath,
  DrawingPath,
  BlendMode,
} from '../types';
import { DEFAULT_FILTERS, CROP_RATIOS } from '../types';
import { generateId, getImageDataFromImage, loadImage, rotateImageData, flipImageData, cropImageData } from '../utils/canvasUtils';
import { createCutoutLayerData } from '../utils/lassoUtils';
import { applyAllFilters } from '../utils/filterAlgorithms';

interface EditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  activeTool: ToolType;
  cropSettings: CropSettings;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  isPanning: boolean;
  currentDrawingPath: DrawingPath | null;
  currentMosaicPath: MosaicPath | null;
  lassoPoints: Point[];
  isDrawingLasso: boolean;
  exportSettings: ExportSettings;
  showExportDialog: boolean;
  showBatchDialog: boolean;
  activeLayerFilters: FilterSettings;
  
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>, saveHistory?: boolean) => void;
  selectLayer: (layerId: string | null) => void;
  moveLayer: (layerId: string, targetIndex: number) => void;
  duplicateLayer: (layerId: string) => void;
  
  setActiveTool: (tool: ToolType) => void;
  setCropSettings: (settings: Partial<CropSettings>) => void;
  applyCrop: () => void;
  
  rotateCanvas: (degrees: number) => void;
  flipCanvas: (horizontal: boolean) => void;
  
  addTextLayer: (content: string, x: number, y: number) => void;
  updateTextLayer: (layerId: string, updates: Partial<TextLayer>) => void;
  
  addMosaicLayer: () => void;
  startMosaicPath: (point: Point) => void;
  addMosaicPoint: (point: Point) => void;
  finishMosaicPath: () => void;
  
  addDrawingLayer: () => void;
  startDrawingPath: (point: Point, color: string, size: number) => void;
  addDrawingPoint: (point: Point) => void;
  finishDrawingPath: () => void;
  
  startLasso: (point: Point) => void;
  addLassoPoint: (point: Point) => void;
  finishLasso: () => void;
  
  updateLayerFilters: (layerId: string, filters: Partial<FilterSettings>) => void;
  resetLayerFilters: (layerId: string) => void;
  
  undo: (layerId: string) => void;
  redo: (layerId: string) => void;
  saveHistory: (layerId: string) => void;
  
  uploadImage: (file: File) => Promise<void>;
  setViewTransform: (scale: number, offsetX: number, offsetY: number) => void;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setShowExportDialog: (show: boolean) => void;
  setShowBatchDialog: (show: boolean) => void;
  
  getSelectedLayer: () => Layer | null;
  getBaseImageData: () => ImageData | null;
  getCompositeImageData: () => ImageData | null;
}

const createBaseLayer = (type: Layer['type'], name: string, width: number, height: number): Layer => {
  const id = generateId();
  return {
    id,
    name,
    type,
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'source-over',
    x: 0,
    y: 0,
    width,
    height,
    history: [],
    historyIndex: -1,
  } as Layer;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  layers: [],
  selectedLayerId: null,
  activeTool: 'select',
  cropSettings: {
    ratio: 'free',
    customWidth: 0,
    customHeight: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    active: false,
  },
  canvasWidth: 800,
  canvasHeight: 600,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  isPanning: false,
  currentDrawingPath: null,
  currentMosaicPath: null,
  lassoPoints: [],
  isDrawingLasso: false,
  exportSettings: {
    format: 'image/png',
    quality: 0.9,
    filename: 'edited-image',
  },
  showExportDialog: false,
  showBatchDialog: false,
  activeLayerFilters: { ...DEFAULT_FILTERS },

  addLayer: (layer) => set((state) => ({
    layers: [...state.layers, layer],
    selectedLayerId: layer.id,
  })),

  removeLayer: (layerId) => set((state) => {
    const layers = state.layers.filter((l) => l.id !== layerId);
    const selectedLayerId = state.selectedLayerId === layerId
      ? (layers.length > 0 ? layers[layers.length - 1].id : null)
      : state.selectedLayerId;
    return { layers, selectedLayerId };
  }),

  updateLayer: (layerId, updates, saveHistoryFlag = false) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, ...updates } as Layer : l
      ),
    }));
    if (saveHistoryFlag) {
      get().saveHistory(layerId);
    }
  },

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  moveLayer: (layerId, targetIndex) => set((state) => {
    const layers = [...state.layers];
    const currentIndex = layers.findIndex((l) => l.id === layerId);
    if (currentIndex === -1) return state;
    
    const [layer] = layers.splice(currentIndex, 1);
    layers.splice(targetIndex, 0, layer);
    return { layers };
  }),

  duplicateLayer: (layerId) => set((state) => {
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer) return state;
    
    const newLayer = {
      ...layer,
      id: generateId(),
      name: `${layer.name} 副本`,
      x: layer.x + 20,
      y: layer.y + 20,
      history: [],
      historyIndex: -1,
    } as Layer;
    
    const index = state.layers.findIndex((l) => l.id === layerId);
    const layers = [...state.layers];
    layers.splice(index + 1, 0, newLayer);
    
    return { layers, selectedLayerId: newLayer.id };
  }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setCropSettings: (settings) => set((state) => ({
    cropSettings: { ...state.cropSettings, ...settings },
  })),

  applyCrop: () => {
    const state = get();
    const { cropSettings, layers, canvasWidth, canvasHeight } = state;
    if (!cropSettings.active || layers.length === 0) return;

    const { x, y, width, height } = cropSettings;
    const newLayers = layers.map((layer) => {
      if (layer.type === 'image' && layer.imageData) {
        const cropped = cropImageData(
          layer.imageData,
          Math.max(0, x),
          Math.max(0, y),
          Math.min(width, canvasWidth - x),
          Math.min(height, canvasHeight - y)
        );
        return {
          ...layer,
          type: 'image' as const,
          imageData: cropped,
          width: cropped.width,
          height: cropped.height,
          x: 0,
          y: 0,
        } as ImageLayer;
      }
      return {
        ...layer,
        x: layer.x - x,
        y: layer.y - y,
      } as Layer;
    }).filter((layer) => {
      if (layer.type === 'text') {
        return layer.x + layer.width > 0 && layer.y + layer.height > 0 &&
               layer.x < width && layer.y < height;
      }
      return true;
    });

    set({
      layers: newLayers,
      canvasWidth: width,
      canvasHeight: height,
      cropSettings: {
        ...state.cropSettings,
        active: false,
        width,
        height,
        x: 0,
        y: 0,
      },
      activeTool: 'select',
    });
    
    newLayers.forEach((layer) => {
      get().saveHistory(layer.id);
    });
  },

  rotateCanvas: (degrees) => {
    const state = get();
    if (state.layers.length === 0) return;
    
    const newLayers = state.layers.map((layer) => {
      if (layer.type === 'image' && layer.imageData) {
        const rotated = rotateImageData(layer.imageData, degrees);
        return {
          ...layer,
          imageData: rotated,
          width: rotated.width,
          height: rotated.height,
          x: 0,
          y: 0,
        } as ImageLayer;
      }
      if (layer.type === 'cutout' && layer.imageData) {
        const rotated = rotateImageData(layer.imageData, degrees);
        return {
          ...layer,
          imageData: rotated,
          width: rotated.width,
          height: rotated.height,
        } as CutoutLayer;
      }
      return layer;
    });

    const firstLayer = newLayers[0];
    set({
      layers: newLayers,
      canvasWidth: firstLayer.width,
      canvasHeight: firstLayer.height,
    });
    
    newLayers.forEach((layer) => {
      get().saveHistory(layer.id);
    });
  },

  flipCanvas: (horizontal) => {
    const state = get();
    if (state.layers.length === 0) return;
    
    const newLayers = state.layers.map((layer) => {
      if (layer.type === 'image' && layer.imageData) {
        const flipped = flipImageData(layer.imageData, horizontal);
        return { ...layer, imageData: flipped } as ImageLayer;
      }
      if (layer.type === 'cutout' && layer.imageData) {
        const flipped = flipImageData(layer.imageData, horizontal);
        return { ...layer, imageData: flipped } as CutoutLayer;
      }
      if (horizontal) {
        return { ...layer, x: state.canvasWidth - layer.x - layer.width } as Layer;
      }
      return { ...layer, y: state.canvasHeight - layer.y - layer.height } as Layer;
    });

    set({ layers: newLayers });
    
    newLayers.forEach((layer) => {
      get().saveHistory(layer.id);
    });
  },

  addTextLayer: (content, x, y) => set((state) => {
    const base = createBaseLayer('text', '文字', 200, 50);
    const textLayer: TextLayer = {
      ...base,
      type: 'text',
      content,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 0,
      shadowBlur: 0,
      shadowColor: '#000000',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      x,
      y,
      width: 200,
      height: 50,
    };
    
    const initialSnapshot = { ...textLayer };
    textLayer.history = [{ timestamp: Date.now(), snapshot: initialSnapshot }];
    textLayer.historyIndex = 0;
    
    return {
      layers: [...state.layers, textLayer],
      selectedLayerId: textLayer.id,
      activeTool: 'select',
    };
  }),

  updateTextLayer: (layerId, updates) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId && l.type === 'text'
          ? { ...l, ...updates } as TextLayer
          : l
      ),
    }));
    get().saveHistory(layerId);
  },

  addMosaicLayer: () => set((state) => {
    const baseLayer = state.layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    const base = createBaseLayer('mosaic', '马赛克', state.canvasWidth, state.canvasHeight);
    const mosaicLayer: MosaicLayer = {
      ...base,
      type: 'mosaic',
      imageData: baseLayer?.imageData || null,
      brushSize: 15,
      paths: [],
    };
    
    const initialSnapshot = { ...mosaicLayer };
    mosaicLayer.history = [{ timestamp: Date.now(), snapshot: initialSnapshot }];
    mosaicLayer.historyIndex = 0;
    
    return {
      layers: [...state.layers, mosaicLayer],
      selectedLayerId: mosaicLayer.id,
      activeTool: 'mosaic',
    };
  }),

  startMosaicPath: (point) => {
    const state = get();
    const selectedLayer = state.getSelectedLayer() as MosaicLayer | null;
    if (!selectedLayer || selectedLayer.type !== 'mosaic') return;

    set({
      currentMosaicPath: {
        points: [point],
        brushSize: selectedLayer.brushSize,
      },
    });
  },

  addMosaicPoint: (point) => set((state) => {
    if (!state.currentMosaicPath) return state;
    return {
      currentMosaicPath: {
        ...state.currentMosaicPath,
        points: [...state.currentMosaicPath.points, point],
      },
    };
  }),

  finishMosaicPath: () => {
    const state = get();
    if (!state.currentMosaicPath) return;
    
    const selectedLayer = state.getSelectedLayer() as MosaicLayer | null;
    if (!selectedLayer || selectedLayer.type !== 'mosaic') {
      set({ currentMosaicPath: null });
      return;
    }

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === selectedLayer.id && l.type === 'mosaic'
          ? { ...l, paths: [...l.paths, state.currentMosaicPath!] } as MosaicLayer
          : l
      ),
      currentMosaicPath: null,
    }));
    
    get().saveHistory(selectedLayer.id);
  },

  addDrawingLayer: () => set((state) => {
    const base = createBaseLayer('drawing', '涂鸦', state.canvasWidth, state.canvasHeight);
    const drawingLayer: DrawingLayer = {
      ...base,
      type: 'drawing',
      brushColor: '#ff0000',
      brushSize: 5,
      paths: [],
    };
    
    const initialSnapshot = { ...drawingLayer };
    drawingLayer.history = [{ timestamp: Date.now(), snapshot: initialSnapshot }];
    drawingLayer.historyIndex = 0;
    
    return {
      layers: [...state.layers, drawingLayer],
      selectedLayerId: drawingLayer.id,
      activeTool: 'drawing',
    };
  }),

  startDrawingPath: (point, color, size) => set({
    currentDrawingPath: {
      points: [point],
      color,
      size,
    },
  }),

  addDrawingPoint: (point) => set((state) => {
    if (!state.currentDrawingPath) return state;
    return {
      currentDrawingPath: {
        ...state.currentDrawingPath,
        points: [...state.currentDrawingPath.points, point],
      },
    };
  }),

  finishDrawingPath: () => {
    const state = get();
    if (!state.currentDrawingPath) return;
    
    const selectedLayer = state.getSelectedLayer() as DrawingLayer | null;
    if (!selectedLayer || selectedLayer.type !== 'drawing') {
      set({ currentDrawingPath: null });
      return;
    }

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === selectedLayer.id && l.type === 'drawing'
          ? { ...l, paths: [...l.paths, state.currentDrawingPath!] } as DrawingLayer
          : l
      ),
      currentDrawingPath: null,
    }));
    
    get().saveHistory(selectedLayer.id);
  },

  startLasso: (point) => set({
    lassoPoints: [point],
    isDrawingLasso: true,
  }),

  addLassoPoint: (point) => set((state) => ({
    lassoPoints: [...state.lassoPoints, point],
  })),

  finishLasso: () => set((state) => {
    if (state.lassoPoints.length < 3) {
      return { lassoPoints: [], isDrawingLasso: false };
    }

    const baseLayer = state.layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    if (!baseLayer?.imageData) {
      return { lassoPoints: [], isDrawingLasso: false };
    }

    const { cutoutData, maskData } = createCutoutLayerData(
      baseLayer.imageData,
      state.lassoPoints,
      true
    );

    const base = createBaseLayer('cutout', '抠图', cutoutData.width, cutoutData.height);
    const cutoutLayer: CutoutLayer = {
      ...base,
      type: 'cutout',
      imageData: cutoutData,
      maskData,
    };
    
    const initialSnapshot = { ...cutoutLayer };
    cutoutLayer.history = [{ timestamp: Date.now(), snapshot: initialSnapshot }];
    cutoutLayer.historyIndex = 0;

    return {
      layers: [...state.layers, cutoutLayer],
      selectedLayerId: cutoutLayer.id,
      lassoPoints: [],
      isDrawingLasso: false,
      activeTool: 'select',
    };
  }),

  updateLayerFilters: (layerId, filters) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId && l.type === 'image'
          ? { ...l, filters: { ...l.filters, ...filters } } as ImageLayer
          : l
      ),
      activeLayerFilters: {
        ...state.activeLayerFilters,
        ...filters,
      },
    }));
    get().saveHistory(layerId);
  },

  resetLayerFilters: (layerId) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId && l.type === 'image'
          ? { ...l, filters: { ...DEFAULT_FILTERS } } as ImageLayer
          : l
      ),
      activeLayerFilters: { ...DEFAULT_FILTERS },
    }));
    get().saveHistory(layerId);
  },

  undo: (layerId) => set((state) => {
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer || layer.historyIndex <= 0) return state;

    const newIndex = layer.historyIndex - 1;
    const snapshot = layer.history[newIndex].snapshot as Partial<Layer>;
    return {
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, ...snapshot, historyIndex: newIndex } as Layer
          : l
      ),
    };
  }),

  redo: (layerId) => set((state) => {
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer || layer.historyIndex >= layer.history.length - 1) return state;

    const newIndex = layer.historyIndex + 1;
    const snapshot = layer.history[newIndex].snapshot as Partial<Layer>;
    return {
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, ...snapshot, historyIndex: newIndex } as Layer
          : l
      ),
    };
  }),

  saveHistory: (layerId) => set((state) => {
    const layer = state.layers.find((l) => l.id === layerId);
    if (!layer) return state;

    const snapshot = { ...layer };
    const newHistory = layer.history.slice(0, layer.historyIndex + 1);
    newHistory.push({ timestamp: Date.now(), snapshot });

    return {
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, history: newHistory, historyIndex: newHistory.length - 1 } as Layer
          : l
      ),
    };
  }),

  uploadImage: async (file) => {
    const img = await loadImage(file);
    const imageData = getImageDataFromImage(img);
    
    const base = createBaseLayer('image', '背景', imageData.width, imageData.height);
    const imageLayer: ImageLayer = {
      ...base,
      type: 'image',
      imageData,
      filters: { ...DEFAULT_FILTERS },
    };

    const initialSnapshot = { ...imageLayer };
    imageLayer.history = [{ timestamp: Date.now(), snapshot: initialSnapshot }];
    imageLayer.historyIndex = 0;

    set({
      layers: [imageLayer],
      selectedLayerId: imageLayer.id,
      canvasWidth: imageData.width,
      canvasHeight: imageData.height,
      cropSettings: {
        ratio: 'free',
        customWidth: 0,
        customHeight: 0,
        x: 0,
        y: 0,
        width: imageData.width,
        height: imageData.height,
        active: false,
      },
      activeLayerFilters: { ...DEFAULT_FILTERS },
      activeTool: 'select',
    });
  },

  setViewTransform: (scale, offsetX, offsetY) => set({ scale, offsetX, offsetY }),

  setExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings },
  })),

  setShowExportDialog: (show) => set({ showExportDialog: show }),

  setShowBatchDialog: (show) => set({ showBatchDialog: show }),

  getSelectedLayer: () => {
    const state = get();
    return state.layers.find((l) => l.id === state.selectedLayerId) || null;
  },

  getBaseImageData: () => {
    const state = get();
    const baseLayer = state.layers.find((l) => l.type === 'image') as ImageLayer | undefined;
    return baseLayer?.imageData || null;
  },

  getCompositeImageData: () => {
    const state = get();
    const { layers, canvasWidth, canvasHeight } = state;
    if (layers.length === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    for (const layer of layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blendMode;

      if (layer.type === 'image' && layer.imageData) {
        const filteredData = applyAllFilters(layer.imageData, layer.filters);
        ctx.putImageData(filteredData, layer.x, layer.y);
      } else if (layer.type === 'text') {
        const textLayer = layer as TextLayer;
        ctx.font = `${textLayer.fontSize}px ${textLayer.fontFamily}`;
        ctx.textBaseline = 'top';
        if (textLayer.shadowBlur > 0) {
          ctx.shadowBlur = textLayer.shadowBlur;
          ctx.shadowColor = textLayer.shadowColor;
          ctx.shadowOffsetX = textLayer.shadowOffsetX;
          ctx.shadowOffsetY = textLayer.shadowOffsetY;
        }
        if (textLayer.strokeWidth > 0) {
          ctx.strokeStyle = textLayer.strokeColor;
          ctx.lineWidth = textLayer.strokeWidth;
          ctx.strokeText(textLayer.content, textLayer.x, textLayer.y);
        }
        ctx.fillStyle = textLayer.color;
        ctx.fillText(textLayer.content, textLayer.x, textLayer.y);
      } else if (layer.type === 'drawing') {
        const drawingLayer = layer as DrawingLayer;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const path of drawingLayer.paths) {
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.size;
          ctx.beginPath();
          if (path.points.length > 0) {
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
              const xc = (path.points[i].x + path.points[i - 1].x) / 2;
              const yc = (path.points[i].y + path.points[i - 1].y) / 2;
              ctx.quadraticCurveTo(path.points[i - 1].x, path.points[i - 1].y, xc, yc);
            }
            ctx.stroke();
          }
        }
      } else if (layer.type === 'mosaic' && layer.imageData) {
        const mosaicLayer = layer as MosaicLayer;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = mosaicLayer.width;
        tempCanvas.height = mosaicLayer.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.putImageData(mosaicLayer.imageData, 0, 0);

        for (const path of mosaicLayer.paths) {
          const brushSize = path.brushSize;
          for (const point of path.points) {
            const x = Math.floor(point.x - brushSize / 2);
            const y = Math.floor(point.y - brushSize / 2);
            const sampleX = Math.max(0, x);
            const sampleY = Math.max(0, y);
            const sampleW = Math.min(brushSize, mosaicLayer.width - sampleX);
            const sampleH = Math.min(brushSize, mosaicLayer.height - sampleY);
            
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
                ctx.fillRect(sampleX + layer.x, sampleY + layer.y, sampleW, sampleH);
              }
            }
          }
        }
      } else if (layer.type === 'cutout' && layer.imageData && layer.maskData) {
        const cutoutLayer = layer as CutoutLayer;
        const resultData = new Uint8ClampedArray(cutoutLayer.imageData.data);
        for (let i = 0; i < cutoutLayer.maskData.length; i++) {
          resultData[i * 4 + 3] = Math.min(resultData[i * 4 + 3], cutoutLayer.maskData[i]);
        }
        const resultImageData = new ImageData(resultData, cutoutLayer.width, cutoutLayer.height);
        ctx.putImageData(resultImageData, layer.x, layer.y);
      }
      ctx.restore();
    }

    return ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  },
}));
