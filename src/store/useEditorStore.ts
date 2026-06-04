import { create } from 'zustand';
import {
  EditorState,
  NodeData,
  EdgeData,
  ShapeType,
  ConnectionPoint,
  ConnectionPointPosition,
  Point,
} from '../types';
import { generateId } from '../utils/id';
import { generateOrthogonalPath, getConnectionPoint, snapToGrid } from '../utils/geometry';

const STORAGE_KEY = 'flow-editor-state';

const defaultState: EditorState = {
  nodes: [],
  edges: [],
  canvas: {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  },
  selection: {
    nodeIds: [],
    edgeIds: [],
  },
  editingNodeId: null,
  connectingFrom: null,
  tempLine: null,
};

interface EditorStore extends EditorState {
  history: {
    past: EditorState[];
    future: EditorState[];
  };
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  setCanvasOffset: (x: number, y: number) => void;
  setCanvasScale: (scale: number, centerX?: number, centerY?: number) => void;

  addNode: (type: ShapeType, x: number, y: number) => void;
  updateNode: (id: string, updates: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  setEditingNode: (id: string | null) => void;

  selectNode: (id: string, multi?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelection: () => void;

  moveSelectedNodes: (dx: number, dy: number) => void;

  startConnection: (point: ConnectionPoint) => void;
  updateTempLine: (points: Point[]) => void;
  endConnection: (toPoint: ConnectionPoint) => void;
  cancelConnection: () => void;

  alignHorizontalCenter: () => void;
  alignVerticalCenter: () => void;
  alignLeft: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignBottom: () => void;
  distributeHorizontal: () => void;
  distributeVertical: () => void;

  exportJSON: () => string;
  importJSON: (json: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;

  updateEdgePaths: () => void;
}

function cloneState(state: EditorState): EditorState {
  return {
    nodes: state.nodes.map((n) => ({ ...n })),
    edges: state.edges.map((e) => ({
      ...e,
      from: { ...e.from },
      to: { ...e.to },
      points: e.points.map((p) => ({ ...p })),
    })),
    canvas: { ...state.canvas },
    selection: { ...state.selection, nodeIds: [...state.selection.nodeIds], edgeIds: [...state.selection.edgeIds] },
    editingNodeId: state.editingNodeId,
    connectingFrom: state.connectingFrom ? { ...state.connectingFrom } : null,
    tempLine: state.tempLine ? state.tempLine.map((p) => ({ ...p })) : null,
  };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...defaultState,
  history: {
    past: [],
    future: [],
  },

  saveToHistory: () => {
    const state = get();
    const snapshot = cloneState(state);
    set((s) => ({
      history: {
        past: [...s.history.past, snapshot].slice(-50),
        future: [],
      },
    }));
  },

  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const past = [...state.history.past];
    const current = cloneState(state);
    const previous = past.pop()!;

    set({
      ...previous,
      history: {
        past,
        future: [current, ...state.history.future],
      },
    });
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const future = [...state.history.future];
    const current = cloneState(state);
    const next = future.shift()!;

    set({
      ...next,
      history: {
        past: [...state.history.past, current],
        future,
      },
    });
  },

  setCanvasOffset: (x: number, y: number) => {
    set({
      canvas: {
        ...get().canvas,
        offsetX: x,
        offsetY: y,
      },
    });
  },

  setCanvasScale: (scale: number, centerX = 0, centerY = 0) => {
    const { canvas } = get();
    const newScale = Math.max(0.2, Math.min(3, scale));
    const ratio = newScale / canvas.scale;
    const newOffsetX = centerX - (centerX - canvas.offsetX) * ratio;
    const newOffsetY = centerY - (centerY - canvas.offsetY) * ratio;

    set({
      canvas: {
        offsetX: newOffsetX,
        offsetY: newOffsetY,
        scale: newScale,
      },
    });
  },

  addNode: (type: ShapeType, x: number, y: number) => {
    get().saveToHistory();
    const colors = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f7fa'];
    const newNode: NodeData = {
      id: generateId(),
      type,
      x: snapToGrid(x),
      y: snapToGrid(y),
      width: 120,
      height: 80,
      text: '节点',
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selection: { nodeIds: [newNode.id], edgeIds: [] },
    }));
  },

  updateNode: (id: string, updates: Partial<NodeData>) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
    get().updateEdgePaths();
  },

  deleteNode: (id: string) => {
    get().saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.from.nodeId !== id && e.to.nodeId !== id),
      selection: {
        nodeIds: state.selection.nodeIds.filter((nid) => nid !== id),
        edgeIds: state.selection.edgeIds,
      },
    }));
  },

  setEditingNode: (id: string | null) => {
    set({ editingNodeId: id });
  },

  selectNode: (id: string, multi = false) => {
    set((state) => {
      const nodeIds = multi
        ? state.selection.nodeIds.includes(id)
          ? state.selection.nodeIds.filter((nid) => nid !== id)
          : [...state.selection.nodeIds, id]
        : [id];
      return {
        selection: { nodeIds, edgeIds: [] },
      };
    });
  },

  selectNodes: (ids: string[]) => {
    set({
      selection: { nodeIds: ids, edgeIds: [] },
    });
  },

  clearSelection: () => {
    set({
      selection: { nodeIds: [], edgeIds: [] },
    });
  },

  deleteSelection: () => {
    const { selection, nodes, edges } = get();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0) return;

    get().saveToHistory();
    set({
      nodes: nodes.filter((n) => !selection.nodeIds.includes(n.id)),
      edges: edges.filter(
        (e) =>
          !selection.edgeIds.includes(e.id) &&
          !selection.nodeIds.includes(e.from.nodeId) &&
          !selection.nodeIds.includes(e.to.nodeId)
      ),
      selection: { nodeIds: [], edgeIds: [] },
    });
  },

  moveSelectedNodes: (dx: number, dy: number) => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length === 0) return;

    set({
      nodes: nodes.map((n) =>
        selection.nodeIds.includes(n.id)
          ? { ...n, x: snapToGrid(n.x + dx), y: snapToGrid(n.y + dy) }
          : n
      ),
    });
    get().updateEdgePaths();
  },

  startConnection: (point: ConnectionPoint) => {
    set({ connectingFrom: point });
  },

  updateTempLine: (points: Point[]) => {
    set({ tempLine: points });
  },

  endConnection: (toPoint: ConnectionPoint) => {
    const { connectingFrom, nodes, edges } = get();
    if (!connectingFrom) return;
    if (connectingFrom.nodeId === toPoint.nodeId) {
      get().cancelConnection();
      return;
    }

    const exists = edges.some(
      (e) =>
        (e.from.nodeId === connectingFrom.nodeId &&
          e.from.position === connectingFrom.position &&
          e.to.nodeId === toPoint.nodeId &&
          e.to.position === toPoint.position) ||
        (e.from.nodeId === toPoint.nodeId &&
          e.from.position === toPoint.position &&
          e.to.nodeId === connectingFrom.nodeId &&
          e.to.position === connectingFrom.position)
    );

    if (exists) {
      get().cancelConnection();
      return;
    }

    get().saveToHistory();

    const fromNode = nodes.find((n) => n.id === connectingFrom.nodeId)!;
    const toNode = nodes.find((n) => n.id === toPoint.nodeId)!;
    const points = generateOrthogonalPath(
      fromNode,
      connectingFrom.position,
      toNode,
      toPoint.position,
      nodes
    );

    const newEdge: EdgeData = {
      id: generateId(),
      from: connectingFrom,
      to: toPoint,
      points,
    };

    set({
      edges: [...edges, newEdge],
      connectingFrom: null,
      tempLine: null,
    });
  },

  cancelConnection: () => {
    set({ connectingFrom: null, tempLine: null });
  },

  updateEdgePaths: () => {
    const { nodes, edges } = get();
    set({
      edges: edges.map((e) => {
        const fromNode = nodes.find((n) => n.id === e.from.nodeId);
        const toNode = nodes.find((n) => n.id === e.to.nodeId);
        if (!fromNode || !toNode) return e;
        const points = generateOrthogonalPath(fromNode, e.from.position, toNode, e.to.position, nodes);
        return { ...e, points };
      }),
    });
  },

  alignHorizontalCenter: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const minX = Math.min(...selectedNodes.map((n) => n.x));
    const maxX = Math.max(...selectedNodes.map((n) => n.x + n.width));
    const centerX = (minX + maxX) / 2;

    set({
      nodes: nodes.map((n) =>
        selection.nodeIds.includes(n.id) ? { ...n, x: centerX - n.width / 2 } : n
      ),
    });
    get().updateEdgePaths();
  },

  alignVerticalCenter: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const minY = Math.min(...selectedNodes.map((n) => n.y));
    const maxY = Math.max(...selectedNodes.map((n) => n.y + n.height));
    const centerY = (minY + maxY) / 2;

    set({
      nodes: nodes.map((n) =>
        selection.nodeIds.includes(n.id) ? { ...n, y: centerY - n.height / 2 } : n
      ),
    });
    get().updateEdgePaths();
  },

  alignLeft: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const minX = Math.min(...selectedNodes.map((n) => n.x));

    set({
      nodes: nodes.map((n) => (selection.nodeIds.includes(n.id) ? { ...n, x: minX } : n)),
    });
    get().updateEdgePaths();
  },

  alignRight: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const maxX = Math.max(...selectedNodes.map((n) => n.x + n.width));

    set({
      nodes: nodes.map((n) =>
        selection.nodeIds.includes(n.id) ? { ...n, x: maxX - n.width } : n
      ),
    });
    get().updateEdgePaths();
  },

  alignTop: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const minY = Math.min(...selectedNodes.map((n) => n.y));

    set({
      nodes: nodes.map((n) => (selection.nodeIds.includes(n.id) ? { ...n, y: minY } : n)),
    });
    get().updateEdgePaths();
  },

  alignBottom: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 2) return;
    get().saveToHistory();

    const selectedNodes = nodes.filter((n) => selection.nodeIds.includes(n.id));
    const maxY = Math.max(...selectedNodes.map((n) => n.y + n.height));

    set({
      nodes: nodes.map((n) =>
        selection.nodeIds.includes(n.id) ? { ...n, y: maxY - n.height } : n
      ),
    });
    get().updateEdgePaths();
  },

  distributeHorizontal: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 3) return;
    get().saveToHistory();

    const selectedNodes = nodes
      .filter((n) => selection.nodeIds.includes(n.id))
      .sort((a, b) => a.x - b.x);

    const totalWidth =
      selectedNodes[selectedNodes.length - 1].x +
      selectedNodes[selectedNodes.length - 1].width -
      selectedNodes[0].x;
    const totalNodeWidth = selectedNodes.reduce((sum, n) => sum + n.width, 0);
    const gap = (totalWidth - totalNodeWidth) / (selectedNodes.length - 1);

    let currentX = selectedNodes[0].x;
    const newPositions = new Map<string, number>();
    selectedNodes.forEach((n, i) => {
      newPositions.set(n.id, currentX);
      currentX += n.width + gap;
    });

    set({
      nodes: nodes.map((n) =>
        newPositions.has(n.id) ? { ...n, x: newPositions.get(n.id)! } : n
      ),
    });
    get().updateEdgePaths();
  },

  distributeVertical: () => {
    const { selection, nodes } = get();
    if (selection.nodeIds.length < 3) return;
    get().saveToHistory();

    const selectedNodes = nodes
      .filter((n) => selection.nodeIds.includes(n.id))
      .sort((a, b) => a.y - b.y);

    const totalHeight =
      selectedNodes[selectedNodes.length - 1].y +
      selectedNodes[selectedNodes.length - 1].height -
      selectedNodes[0].y;
    const totalNodeHeight = selectedNodes.reduce((sum, n) => sum + n.height, 0);
    const gap = (totalHeight - totalNodeHeight) / (selectedNodes.length - 1);

    let currentY = selectedNodes[0].y;
    const newPositions = new Map<string, number>();
    selectedNodes.forEach((n, i) => {
      newPositions.set(n.id, currentY);
      currentY += n.height + gap;
    });

    set({
      nodes: nodes.map((n) =>
        newPositions.has(n.id) ? { ...n, y: newPositions.get(n.id)! } : n
      ),
    });
    get().updateEdgePaths();
  },

  exportJSON: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importJSON: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.nodes || !data.edges) throw new Error('Invalid format');
      get().saveToHistory();
      set({
        nodes: data.nodes,
        edges: data.edges,
        selection: { nodeIds: [], edgeIds: [] },
      });
      get().saveToLocalStorage();
    } catch (e) {
      alert('导入失败：无效的JSON格式');
    }
  },

  saveToLocalStorage: () => {
    const { nodes, edges, canvas } = get();
    const data = { nodes, edges, canvas };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        set({
          nodes: data.nodes || [],
          edges: data.edges || [],
          canvas: data.canvas || defaultState.canvas,
        });
      } catch (e) {
        console.error('Failed to load from localStorage', e);
      }
    }
  },
}));
