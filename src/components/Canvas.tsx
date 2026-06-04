import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { NodeComponent } from './Node';
import { EdgeComponent } from './Edge';
import { ShapeType, ConnectionPoint, Point } from '../types';
import { getConnectionPoint, pointInRect } from '../utils/geometry';

interface CanvasProps {
  canvasRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const Canvas: React.FC<CanvasProps> = ({ canvasRef }) => {
  const {
    nodes,
    edges,
    canvas,
    selection,
    tempLine,
    connectingFrom,
    setCanvasOffset,
    setCanvasScale,
    addNode,
    selectNode,
    selectNodes,
    clearSelection,
    deleteSelection,
    setEditingNode,
    startConnection,
    updateTempLine,
    endConnection,
    cancelConnection,
    saveToLocalStorage,
    moveSelectedNodes,
    undo,
    redo,
  } = useEditorStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [isDraggingNodes, setIsDraggingNodes] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ offsetX: 0, offsetY: 0, x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [dragShapeType, setDragShapeType] = useState<ShapeType | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState<{ x: number; y: number; startPositions: Map<string, { x: number; y: number }> } | null>(null);

  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (screenX - rect.left - canvas.offsetX) / canvas.scale,
      y: (screenY - rect.top - canvas.offsetY) / canvas.scale,
    };
  }, [canvas.offsetX, canvas.offsetY, canvas.scale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
        saveToLocalStorage();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      if (e.key === 'Escape') {
        clearSelection();
        setEditingNode(null);
        cancelConnection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelection, undo, redo, clearSelection, setEditingNode, cancelConnection, saveToLocalStorage]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCanvasScale(canvas.scale * delta, mouseX, mouseY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (connectingFrom) {
      cancelConnection();
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({
        offsetX: canvas.offsetX,
        offsetY: canvas.offsetY,
        x: e.clientX,
        y: e.clientY,
      });
      return;
    }

    if (e.button === 0 && (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).classList.contains('canvas-grid'))) {
      setIsDragSelecting(true);
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setDragStart({ x: worldPos.x, y: worldPos.y });
      setSelectionBox({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setCanvasOffset(panStart.offsetX + dx, panStart.offsetY + dy);
      return;
    }

    if (isDragSelecting) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setSelectionBox({
        x: Math.min(dragStart.x, worldPos.x),
        y: Math.min(dragStart.y, worldPos.y),
        width: Math.abs(worldPos.x - dragStart.x),
        height: Math.abs(worldPos.y - dragStart.y),
      });
      return;
    }

    if (isDraggingNodes && nodeDragStart) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const dx = worldPos.x - nodeDragStart.x;
      const dy = worldPos.y - nodeDragStart.y;

      const { nodes } = useEditorStore.getState();
      nodes.forEach((node) => {
        if (selection.nodeIds.includes(node.id)) {
          const startPos = nodeDragStart.startPositions.get(node.id);
          if (startPos) {
            useEditorStore.getState().updateNode(node.id, {
              x: startPos.x + dx,
              y: startPos.y + dy,
            });
          }
        }
      });
      return;
    }

    if (connectingFrom && tempLine !== null) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const fromNode = nodes.find((n) => n.id === connectingFrom.nodeId);
      if (fromNode) {
        const start = getConnectionPoint(fromNode, connectingFrom.position);
        const points = [start];
        if (Math.abs(worldPos.x - start.x) >= Math.abs(worldPos.y - start.y)) {
          points.push({ x: worldPos.x, y: start.y });
        } else {
          points.push({ x: start.x, y: worldPos.y });
        }
        points.push(worldPos);
        updateTempLine(points);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragSelecting && selectionBox) {
      const selectedIds = nodes
        .filter((node) =>
          pointInRect({ x: node.x, y: node.y }, selectionBox) ||
          pointInRect({ x: node.x + node.width, y: node.y }, selectionBox) ||
          pointInRect({ x: node.x, y: node.y + node.height }, selectionBox) ||
          pointInRect({ x: node.x + node.width, y: node.y + node.height }, selectionBox) ||
          (node.x >= selectionBox.x &&
            node.x + node.width <= selectionBox.x + selectionBox.width &&
            node.y >= selectionBox.y &&
            node.y + node.height <= selectionBox.y + selectionBox.height)
        )
        .map((n) => n.id);

      if (e.ctrlKey || e.metaKey) {
        const existingIds = new Set(selection.nodeIds);
        const newIds = [...new Set([...existingIds, ...selectedIds])];
        selectNodes(newIds);
      } else {
        selectNodes(selectedIds);
      }

      setIsDragSelecting(false);
      setSelectionBox(null);
      return;
    }

    if (isDraggingNodes) {
      setIsDraggingNodes(false);
      setNodeDragStart(null);
      useEditorStore.getState().saveToHistory();
      saveToLocalStorage();
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('shape-type') as ShapeType;
    if (type) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      addNode(type, worldPos.x - 60, worldPos.y - 40);
      saveToLocalStorage();
    }
    setDragShapeType(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    const type = e.dataTransfer.getData('shape-type') as ShapeType;
    if (type) {
      setDragShapeType(type);
    }
  };

  const handleDragLeave = () => {
    setDragShapeType(null);
  };

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    if (connectingFrom) return;

    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectNode(nodeId, isMultiSelect);

    if (!isMultiSelect || selection.nodeIds.includes(nodeId)) {
      setIsDraggingNodes(true);
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const startPositions = new Map<string, { x: number; y: number }>();
      selection.nodeIds.forEach((id) => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
          startPositions.set(id, { x: node.x, y: node.y });
        }
      });
      if (!startPositions.has(nodeId)) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          startPositions.set(nodeId, { x: node.x, y: node.y });
        }
      }
      setNodeDragStart({ x: worldPos.x, y: worldPos.y, startPositions });
    }
  };

  const handleStartConnection = (point: ConnectionPoint) => {
    startConnection(point);
    const fromNode = nodes.find((n) => n.id === point.nodeId);
    if (fromNode) {
      const start = getConnectionPoint(fromNode, point.position);
      updateTempLine([start, start]);
    }
  };

  const handleEndConnection = (point: ConnectionPoint) => {
    endConnection(point);
    saveToLocalStorage();
  };

  const setRefs = useCallback((el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    canvasRef.current = el;
  }, [canvasRef]);

  return (
    <div
      ref={setRefs}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#fafafa',
        cursor: isPanning ? 'grabbing' : isDragSelecting ? 'crosshair' : dragShapeType ? 'copy' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div
        className="canvas-grid"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, #e0e0e0 1px, transparent 1px),
            linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
          `,
          backgroundSize: `${20 * canvas.scale}px ${20 * canvas.scale}px`,
          backgroundPosition: `${canvas.offsetX}px ${canvas.offsetY}px`,
          pointerEvents: 'none',
        }}
      />

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <g transform={`translate(${canvas.offsetX}, ${canvas.offsetY}) scale(${canvas.scale})`}>
          {edges.map((edge) => (
            <EdgeComponent
              key={edge.id}
              points={edge.points}
              isSelected={selection.edgeIds.includes(edge.id)}
            />
          ))}

          {tempLine && <EdgeComponent points={tempLine} isTemp />}

          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selection.nodeIds.includes(node.id)}
              onMouseDownNode={handleMouseDownNode}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
            />
          ))}

          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(33, 150, 243, 0.1)"
              stroke="#2196f3"
              strokeWidth={1 / canvas.scale}
              strokeDasharray={`${4 / canvas.scale} ${2 / canvas.scale}`}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        缩放: {Math.round(canvas.scale * 100)}% | Alt+拖动平移 | 滚轮缩放
      </div>
    </div>
  );
};
