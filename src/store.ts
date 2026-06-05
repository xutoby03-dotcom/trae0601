import { create } from 'zustand';
import {
  ToolType,
  GridType,
  Document,
  Shape,
  Layer,
  CanvasState,
  SelectionState,
  PenState,
  BrushState,
  DragState,
  HistoryEntry,
  AnchorPoint,
  Point,
  Fill,
  Stroke,
  TextProperties,
  BlendMode,
  BooleanOp,
  ShapeType,
} from './types';
import {
  generateId,
  createDocument,
  createLayer,
  createShape,
  createDefaultFill,
  createDefaultStroke,
  anchorsToPathData,
  createRectPath,
  createRectAnchors,
  createCirclePath,
  createCircleAnchors,
  createEllipsePath,
  createEllipseAnchors,
  createPolygonPath,
  createPolygonAnchors,
  createStarPath,
  createStarAnchors,
  booleanOperation,
  alignShapes,
  distributeShapes,
  pointsToAnchors,
  smoothBrushPoints,
  getShapeBounds,
  saveDocument,
  generateThumbnail,
} from './utils';

interface EditorState {
  documents: Document[];
  activeDocId: string | null;
  canvas: CanvasState;
  tool: ToolType;
  selection: SelectionState;
  penState: PenState;
  brushState: BrushState;
  dragState: DragState;
  history: HistoryEntry[];
  historyIndex: number;
  showDocumentList: boolean;
  polygonSides: number;
  starPoints: number;
  starInnerRatio: number;

  getActiveDoc: () => Document | null;
  getActiveLayer: () => Layer | null;
  getSelectedShapes: () => Shape[];
  getShapeById: (id: string) => Shape | null;

  setActiveDocId: (id: string) => void;
  createNewDocument: (name?: string) => void;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;

  setTool: (tool: ToolType) => void;
  setCanvas: (partial: Partial<CanvasState> | ((prev: CanvasState) => Partial<CanvasState>)) => void;
  setSelection: (partial: Partial<SelectionState> | ((prev: SelectionState) => Partial<SelectionState>)) => void;
  setPenState: (partial: Partial<PenState> | ((prev: PenState) => Partial<PenState>)) => void;
  setBrushState: (partial: Partial<BrushState> | ((prev: BrushState) => Partial<BrushState>)) => void;
  setDragState: (partial: Partial<DragState> | ((prev: DragState) => Partial<DragState>)) => void;
  setShowDocumentList: (show: boolean) => void;
  setPolygonSides: (sides: number) => void;
  setStarPoints: (points: number) => void;
  setStarInnerRatio: (ratio: number) => void;

  updateDocument: (updater: (doc: Document) => Document) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updater: (shape: Shape) => Shape) => void;
  removeShape: (id: string) => void;
  selectShape: (id: string, addToSelection?: boolean) => void;
  deselectAll: () => void;
  deleteSelected: () => void;

  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  updateLayer: (id: string, updater: (layer: Layer) => Layer) => void;
  moveShapeToLayer: (shapeId: string, layerId: string) => void;

  groupSelected: () => void;
  ungroupSelected: () => void;

  applyBooleanOp: (op: BooleanOp) => void;
  alignSelected: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (direction: 'horizontal' | 'vertical') => void;

  updateShapeFill: (id: string, fill: Partial<Fill>) => void;
  updateShapeStroke: (id: string, stroke: Partial<Stroke>) => void;
  updateShapeTextProps: (id: string, props: Partial<TextProperties>) => void;
  updateShapeOpacity: (id: string, opacity: number) => void;
  updateShapeBlendMode: (id: string, mode: BlendMode) => void;
  updateShapeName: (id: string, name: string) => void;

  addAnchorToShape: (shapeId: string, anchor: AnchorPoint) => void;
  updateAnchor: (shapeId: string, index: number, updater: (anchor: AnchorPoint) => AnchorPoint) => void;
  removeAnchor: (shapeId: string, index: number) => void;
  convertAnchorToCorner: (shapeId: string, index: number) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  autoSave: () => void;
}

const MAX_HISTORY = 150;

export const useEditorStore = create<EditorState>((set, get) => ({
  documents: [createDocument('Untitled')],
  activeDocId: null,
  canvas: {
    zoom: 1,
    panX: 0,
    panY: 0,
    gridType: 'pixel',
    gridSize: 20,
    showGrid: true,
    showRulers: true,
    snapToGrid: false,
  },
  tool: 'select',
  selection: {
    shapeIds: [],
    anchorIndices: [],
    hoverShapeId: null,
    hoverAnchorIndex: -1,
  },
  penState: {
    isDrawing: false,
    currentPathId: null,
    closePath: false,
  },
  brushState: {
    isDrawing: false,
    currentPathId: null,
    points: [],
  },
  dragState: {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    shapeId: null,
    anchorIndex: -1,
    handleType: 'none',
  },
  history: [],
  historyIndex: -1,
  showDocumentList: false,
  polygonSides: 6,
  starPoints: 5,
  starInnerRatio: 0.4,

  getActiveDoc: () => {
    const state = get();
    return state.documents.find((d) => d.id === state.activeDocId) || state.documents[0] || null;
  },

  getActiveLayer: () => {
    const doc = get().getActiveDoc();
    if (!doc) return null;
    return doc.layers.find((l) => l.id === doc.activeLayerId) || null;
  },

  getSelectedShapes: () => {
    const doc = get().getActiveDoc();
    if (!doc) return [];
    return get().selection.shapeIds.map((id) => doc.shapes[id]).filter(Boolean);
  },

  getShapeById: (id: string) => {
    const doc = get().getActiveDoc();
    if (!doc) return null;
    return doc.shapes[id] || null;
  },

  setActiveDocId: (id) => set({ activeDocId: id }),

  createNewDocument: (name) => {
    const doc = createDocument(name || `Document ${get().documents.length + 1}`);
    set((state) => ({
      documents: [...state.documents, doc],
      activeDocId: doc.id,
      history: [],
      historyIndex: -1,
      selection: { shapeIds: [], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  deleteDocument: (id) => {
    set((state) => {
      const docs = state.documents.filter((d) => d.id !== id);
      const newActiveId = docs.length > 0 ? docs[0].id : null;
      return {
        documents: docs,
        activeDocId: state.activeDocId === id ? newActiveId : state.activeDocId,
      };
    });
  },

  renameDocument: (id, name) => {
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, name } : d)),
    }));
  },

  setTool: (tool) => {
    const state = get();
    if (state.penState.isDrawing && tool !== 'pen') {
      set({
        tool,
        penState: { isDrawing: false, currentPathId: null, closePath: false },
        brushState: { isDrawing: false, currentPathId: null, points: [] },
      });
    } else {
      set({
        tool,
        brushState: { isDrawing: false, currentPathId: null, points: [] },
      });
    }
  },

  setCanvas: (partial) => set((state) => ({ canvas: { ...state.canvas, ...(typeof partial === 'function' ? partial(state.canvas) : partial) } })),
  setSelection: (partial) => set((state) => ({ selection: { ...state.selection, ...(typeof partial === 'function' ? partial(state.selection) : partial) } })),
  setPenState: (partial) => set((state) => ({ penState: { ...state.penState, ...(typeof partial === 'function' ? partial(state.penState) : partial) } })),
  setBrushState: (partial) => set((state) => ({ brushState: { ...state.brushState, ...(typeof partial === 'function' ? partial(state.brushState) : partial) } })),
  setDragState: (partial) => set((state) => ({ dragState: { ...state.dragState, ...(typeof partial === 'function' ? partial(state.dragState) : partial) } })),
  setShowDocumentList: (show) => set({ showDocumentList: show }),
  setPolygonSides: (sides) => set({ polygonSides: sides }),
  setStarPoints: (points) => set({ starPoints: points }),
  setStarInnerRatio: (ratio) => set({ starInnerRatio: ratio }),

  updateDocument: (updater) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId ? updater(d) : d
      ),
    }));
  },

  addShape: (shape) => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc) return;
    const layer = doc.layers.find((l) => l.id === doc.activeLayerId);
    if (!layer) return;

    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId
          ? {
              ...d,
              shapes: { ...d.shapes, [shape.id]: shape },
              layers: d.layers.map((l) =>
                l.id === d.activeLayerId
                  ? { ...l, shapeIds: [...l.shapeIds, shape.id] }
                  : l
              ),
            }
          : d
      ),
      selection: { shapeIds: [shape.id], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  updateShape: (id, updater) => {
    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: updater(d.shapes[id]) } }
          : d
      ),
    }));
  },

  removeShape: (id) => {
    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const { [id]: _, ...rest } = d.shapes;
        return {
          ...d,
          shapes: rest,
          layers: d.layers.map((l) => ({
            ...l,
            shapeIds: l.shapeIds.filter((sid) => sid !== id),
          })),
        };
      }),
      selection: {
        shapeIds: state.selection.shapeIds.filter((sid) => sid !== id),
        anchorIndices: [],
        hoverShapeId: null,
        hoverAnchorIndex: -1,
      },
    }));
  },

  selectShape: (id, addToSelection = false) => {
    set((state) => ({
      selection: {
        ...state.selection,
        shapeIds: addToSelection
          ? state.selection.shapeIds.includes(id)
            ? state.selection.shapeIds.filter((sid) => sid !== id)
            : [...state.selection.shapeIds, id]
          : [id],
        anchorIndices: [],
      },
    }));
  },

  deselectAll: () => {
    set((state) => ({
      selection: { shapeIds: [], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
      penState: { isDrawing: false, currentPathId: null, closePath: false },
    }));
  },

  deleteSelected: () => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc) return;

    if (state.selection.anchorIndices.length > 0 && state.selection.shapeIds.length === 1) {
      const shapeId = state.selection.shapeIds[0];
      const shape = doc.shapes[shapeId];
      if (shape) {
        get().pushHistory();
        const newAnchors = shape.anchors.filter((_, i) => !state.selection.anchorIndices.includes(i));
        const newPathData = anchorsToPathData(newAnchors, true);
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === state.activeDocId
              ? {
                  ...d,
                  shapes: {
                    ...d.shapes,
                    [shapeId]: { ...d.shapes[shapeId], anchors: newAnchors, pathData: newPathData },
                  },
                }
              : d
          ),
          selection: { shapeIds: [shapeId], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
        }));
      }
      return;
    }

    if (state.selection.shapeIds.length > 0) {
      get().pushHistory();
      set((state) => ({
        documents: state.documents.map((d) => {
          if (d.id !== state.activeDocId) return d;
          const newShapes = { ...d.shapes };
          for (const id of state.selection.shapeIds) {
            delete newShapes[id];
          }
          return {
            ...d,
            shapes: newShapes,
            layers: d.layers.map((l) => ({
              ...l,
              shapeIds: l.shapeIds.filter((sid) => !state.selection.shapeIds.includes(sid)),
            })),
          };
        }),
        selection: { shapeIds: [], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
      }));
    }
  },

  addLayer: (name) => {
    const layer = createLayer(name || `Layer ${get().getActiveDoc()?.layers.length || 0 + 1}`);
    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId
          ? { ...d, layers: [...d.layers, layer], activeLayerId: layer.id }
          : d
      ),
    }));
  },

  removeLayer: (id) => {
    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        if (d.layers.length <= 1) return d;
        const layer = d.layers.find((l) => l.id === id);
        if (!layer) return d;
        const newShapes = { ...d.shapes };
        for (const sid of layer.shapeIds) {
          delete newShapes[sid];
        }
        const newLayers = d.layers.filter((l) => l.id !== id);
        return {
          ...d,
          shapes: newShapes,
          layers: newLayers,
          activeLayerId: newLayers[0].id,
        };
      }),
    }));
  },

  setActiveLayer: (id) => {
    get().updateDocument((doc) => ({ ...doc, activeLayerId: id }));
  },

  updateLayer: (id, updater) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId
          ? { ...d, layers: d.layers.map((l) => (l.id === id ? updater(l) : l)) }
          : d
      ),
    }));
  },

  moveShapeToLayer: (shapeId, layerId) => {
    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        return {
          ...d,
          layers: d.layers.map((l) => {
            if (l.id === layerId) {
              return { ...l, shapeIds: [...l.shapeIds, shapeId] };
            }
            return { ...l, shapeIds: l.shapeIds.filter((sid) => sid !== shapeId) };
          }),
        };
      }),
    }));
  },

  groupSelected: () => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc || state.selection.shapeIds.length < 2) return;

    get().pushHistory();
    const group = createShape('group');
    group.children = [...state.selection.shapeIds];
    group.pathData = '';

    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const newShapes = { ...d.shapes, [group.id]: group };
        for (const childId of group.children) {
          if (newShapes[childId]) {
            newShapes[childId] = { ...newShapes[childId], parentId: group.id };
          }
        }
        return {
          ...d,
          shapes: newShapes,
          layers: d.layers.map((l) =>
            l.id === d.activeLayerId
              ? { ...l, shapeIds: [...l.shapeIds.filter((sid) => !group.children.includes(sid)), group.id] }
              : l
          ),
        };
      }),
      selection: { shapeIds: [group.id], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  ungroupSelected: () => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc || state.selection.shapeIds.length !== 1) return;

    const groupId = state.selection.shapeIds[0];
    const group = doc.shapes[groupId];
    if (!group || group.type !== 'group') return;

    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const newShapes = { ...d.shapes };
        delete newShapes[groupId];
        for (const childId of group.children) {
          if (newShapes[childId]) {
            newShapes[childId] = { ...newShapes[childId], parentId: null };
          }
        }
        return {
          ...d,
          shapes: newShapes,
          layers: d.layers.map((l) =>
            l.id === d.activeLayerId
              ? {
                  ...l,
                  shapeIds: [
                    ...l.shapeIds.filter((sid) => sid !== groupId),
                    ...group.children,
                  ],
                }
              : l
          ),
        };
      }),
      selection: {
        shapeIds: [...group.children],
        anchorIndices: [],
        hoverShapeId: null,
        hoverAnchorIndex: -1,
      },
    }));
  },

  applyBooleanOp: (op) => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc || state.selection.shapeIds.length < 2) return;

    const shapes = state.selection.shapeIds.map((id) => doc.shapes[id]).filter(Boolean);
    if (shapes.length < 2) return;

    get().pushHistory();
    let result = booleanOperation(shapes[0], shapes[1], op);
    for (let i = 2; i < shapes.length; i++) {
      result = booleanOperation(result, shapes[i], op);
    }

    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const newShapes = { ...d.shapes, [result.id]: result };
        for (const sid of state.selection.shapeIds) {
          delete newShapes[sid];
        }
        return {
          ...d,
          shapes: newShapes,
          layers: d.layers.map((l) => ({
            ...l,
            shapeIds: [
              ...l.shapeIds.filter((sid) => !state.selection.shapeIds.includes(sid)),
              result.id,
            ],
          })),
        };
      }),
      selection: { shapeIds: [result.id], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  alignSelected: (direction) => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc || state.selection.shapeIds.length < 2) return;

    const shapes = state.selection.shapeIds.map((id) => doc.shapes[id]).filter(Boolean);
    const aligned = alignShapes(shapes, direction);

    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const newShapes = { ...d.shapes };
        for (const s of aligned) {
          newShapes[s.id] = s;
        }
        return { ...d, shapes: newShapes };
      }),
    }));
  },

  distributeSelected: (direction) => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc || state.selection.shapeIds.length < 3) return;

    const shapes = state.selection.shapeIds.map((id) => doc.shapes[id]).filter(Boolean);
    const distributed = distributeShapes(shapes, direction);

    get().pushHistory();
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        const newShapes = { ...d.shapes };
        for (const s of distributed) {
          newShapes[s.id] = s;
        }
        return { ...d, shapes: newShapes };
      }),
    }));
  },

  updateShapeFill: (id, fill) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: { ...d.shapes[id], fill: { ...d.shapes[id].fill, ...fill } } } }
          : d
      ),
    }));
  },

  updateShapeStroke: (id, stroke) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: { ...d.shapes[id], stroke: { ...d.shapes[id].stroke, ...stroke } } } }
          : d
      ),
    }));
  },

  updateShapeTextProps: (id, props) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id] && d.shapes[id].textProps
          ? {
              ...d,
              shapes: {
                ...d.shapes,
                [id]: { ...d.shapes[id], textProps: { ...d.shapes[id].textProps!, ...props } },
              },
            }
          : d
      ),
    }));
  },

  updateShapeOpacity: (id, opacity) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: { ...d.shapes[id], opacity } } }
          : d
      ),
    }));
  },

  updateShapeBlendMode: (id, mode) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: { ...d.shapes[id], blendMode: mode } } }
          : d
      ),
    }));
  },

  updateShapeName: (id, name) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === state.activeDocId && d.shapes[id]
          ? { ...d, shapes: { ...d.shapes, [id]: { ...d.shapes[id], name } } }
          : d
      ),
    }));
  },

  addAnchorToShape: (shapeId, anchor) => {
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId || !d.shapes[shapeId]) return d;
        const shape = d.shapes[shapeId];
        const newAnchors = [...shape.anchors, anchor];
        const newPathData = anchorsToPathData(newAnchors, state.penState.closePath);
        return {
          ...d,
          shapes: { ...d.shapes, [shapeId]: { ...shape, anchors: newAnchors, pathData: newPathData } },
        };
      }),
    }));
  },

  updateAnchor: (shapeId, index, updater) => {
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId || !d.shapes[shapeId]) return d;
        const shape = d.shapes[shapeId];
        const newAnchors = shape.anchors.map((a, i) => (i === index ? updater(a) : a));
        const newPathData = anchorsToPathData(newAnchors, true);
        return {
          ...d,
          shapes: { ...d.shapes, [shapeId]: { ...shape, anchors: newAnchors, pathData: newPathData } },
        };
      }),
    }));
  },

  removeAnchor: (shapeId, index) => {
    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId || !d.shapes[shapeId]) return d;
        const shape = d.shapes[shapeId];
        const newAnchors = shape.anchors.filter((_, i) => i !== index);
        const newPathData = anchorsToPathData(newAnchors, true);
        return {
          ...d,
          shapes: { ...d.shapes, [shapeId]: { ...shape, anchors: newAnchors, pathData: newPathData } },
        };
      }),
    }));
  },

  convertAnchorToCorner: (shapeId, index) => {
    get().updateAnchor(shapeId, index, (anchor) => ({
      ...anchor,
      handleIn: null,
      handleOut: null,
      type: 'corner' as const,
    }));
  },

  pushHistory: () => {
    const state = get();
    const doc = state.getActiveDoc();
    if (!doc) return;

    const entry: HistoryEntry = {
      shapes: JSON.parse(JSON.stringify(doc.shapes)),
      layers: JSON.parse(JSON.stringify(doc.layers)),
      activeLayerId: doc.activeLayerId,
    };

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;

    const entry = state.history[state.historyIndex];
    if (!entry) return;

    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        return {
          ...d,
          shapes: JSON.parse(JSON.stringify(entry.shapes)),
          layers: JSON.parse(JSON.stringify(entry.layers)),
          activeLayerId: entry.activeLayerId,
        };
      }),
      historyIndex: state.historyIndex - 1,
      selection: { shapeIds: [], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const entry = state.history[newIndex];
    if (!entry) return;

    set((state) => ({
      documents: state.documents.map((d) => {
        if (d.id !== state.activeDocId) return d;
        return {
          ...d,
          shapes: JSON.parse(JSON.stringify(entry.shapes)),
          layers: JSON.parse(JSON.stringify(entry.layers)),
          activeLayerId: entry.activeLayerId,
        };
      }),
      historyIndex: newIndex,
      selection: { shapeIds: [], anchorIndices: [], hoverShapeId: null, hoverAnchorIndex: -1 },
    }));
  },

  autoSave: () => {
    const doc = get().getActiveDoc();
    if (!doc) return;

    const thumbnail = generateThumbnail(doc);
    const docWithThumb = { ...doc, thumbnail };
    saveDocument(docWithThumb).catch(console.error);
  },
}));
