import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../store';
import {
  screenToCanvas,
  distanceBetween,
  snapToGrid,
  createShape,
  anchorsToPathData,
  smoothBrushPoints,
  pointsToAnchors,
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
  generateFillSVG,
  generateStrokeSVG,
  renderGrid,
  renderRulers,
} from '../utils';
import { AnchorPoint, Point, Shape } from '../types';

const RULER_SIZE = 24;
const HANDLE_SIZE = 4;
const ANCHOR_SIZE = 4;

const Canvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const rulerCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [eyedropperColor, setEyedropperColor] = useState<string | null>(null);

  const {
    canvas,
    tool,
    selection,
    penState,
    brushState,
    dragState,
    polygonSides,
    starPoints,
    starInnerRatio,
    getActiveDoc,
    setCanvas,
    setSelection,
    setPenState,
    setBrushState,
    setDragState,
    addShape,
    updateShape,
    addAnchorToShape,
    updateAnchor,
    selectShape,
    deselectAll,
    deleteSelected,
    convertAnchorToCorner,
    pushHistory,
  } = useEditorStore();

  const doc = getActiveDoc();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(32, Math.max(0.1, canvas.zoom * zoomFactor));

      const newPanX = mouseX - (mouseX - canvas.panX) * (newZoom / canvas.zoom);
      const newPanY = mouseY - (mouseY - canvas.panY) * (newZoom / canvas.zoom);

      setCanvas({ zoom: newZoom, panX: newPanX, panY: newPanY });
    };

    svg.addEventListener('wheel', wheelHandler, { passive: false });
    return () => svg.removeEventListener('wheel', wheelHandler);
  }, [canvas.zoom, canvas.panX, canvas.panY, setCanvas]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const keyHandler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
        e.preventDefault();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
        e.preventDefault();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        if (e.shiftKey) {
          useEditorStore.getState().ungroupSelected();
        } else {
          useEditorStore.getState().groupSelected();
        }
        e.preventDefault();
      }

      if (e.altKey && tool === 'directSelect' && selection.anchorIndices.length > 0 && selection.shapeIds.length === 1) {
        const shapeId = selection.shapeIds[0];
        for (const idx of selection.anchorIndices) {
          convertAnchorToCorner(shapeId, idx);
        }
        e.preventDefault();
      }
    };

    svg.addEventListener('keydown', keyHandler);
    return () => svg.removeEventListener('keydown', keyHandler);
  }, [tool, selection, deleteSelected, convertAnchorToCorner]);

  useEffect(() => {
    const gridCanvas = gridCanvasRef.current;
    if (!gridCanvas) return;
    const ctx = gridCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    if (canvas.showGrid) {
      renderGrid(ctx, canvasSize.width, canvasSize.height, canvas.zoom, canvas.panX, canvas.panY, canvas.gridSize, canvas.gridType);
    }
  }, [canvasSize, canvas.zoom, canvas.panX, canvas.panY, canvas.gridType, canvas.gridSize, canvas.showGrid]);

  useEffect(() => {
    const rulerCanvas = rulerCanvasRef.current;
    if (!rulerCanvas) return;
    const ctx = rulerCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    if (canvas.showRulers) {
      renderRulers(ctx, canvasSize.width, canvasSize.height, canvas.zoom, canvas.panX, canvas.panY, RULER_SIZE);
    }
  }, [canvasSize, canvas.zoom, canvas.panX, canvas.panY, canvas.showRulers]);

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent): Point => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return screenToCanvas(e.clientX, e.clientY, canvas.zoom, canvas.panX, canvas.panY, rect);
    },
    [canvas.zoom, canvas.panX]
  );

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX: canvas.panX, panY: canvas.panY };
        return;
      }

      if (e.button !== 0) return;
      const point = getCanvasPoint(e);
      const snappedPoint = canvas.snapToGrid ? snapToGrid(point, canvas.gridSize) : point;

      switch (tool) {
        case 'select': {
          const hitShape = hitTest(point, doc);
          if (hitShape) {
            selectShape(hitShape.id, e.shiftKey);
            const layer = doc?.layers.find((l) => l.shapeIds.includes(hitShape.id));
            if (layer && !layer.locked) {
              pushHistory();
              setDragState({
                isDragging: true,
                startX: point.x,
                startY: point.y,
                currentX: point.x,
                currentY: point.y,
                shapeId: hitShape.id,
                anchorIndex: -1,
                handleType: 'none',
              });
            }
          } else {
            deselectAll();
          }
          break;
        }

        case 'directSelect': {
          const hitAnchor = hitTestAnchor(point, doc, selection.shapeIds, canvas.zoom);
          if (hitAnchor) {
            setSelection({
              shapeIds: [hitAnchor.shapeId],
              anchorIndices: [hitAnchor.index],
            });
            pushHistory();
            setDragState({
              isDragging: true,
              startX: point.x,
              startY: point.y,
              currentX: point.x,
              currentY: point.y,
              shapeId: hitAnchor.shapeId,
              anchorIndex: hitAnchor.index,
              handleType: 'none',
            });
          } else {
            const hitShape = hitTest(point, doc);
            if (hitShape) {
              selectShape(hitShape.id, e.shiftKey);
            } else {
              deselectAll();
            }
          }
          break;
        }

        case 'pen': {
          if (!penState.isDrawing) {
            const shape = createShape('path');
            const anchor: AnchorPoint = {
              x: snappedPoint.x,
              y: snappedPoint.y,
              handleIn: null,
              handleOut: null,
              type: 'corner',
            };
            shape.anchors = [anchor];
            shape.pathData = `M ${anchor.x} ${anchor.y}`;
            addShape(shape);
            setPenState({ isDrawing: true, currentPathId: shape.id, closePath: false });
          } else if (penState.currentPathId) {
            const currentDoc = getActiveDoc();
            const currentShape = currentDoc?.shapes[penState.currentPathId];
            if (currentShape) {
              const lastAnchor = currentShape.anchors[currentShape.anchors.length - 1];
              const dist = distanceBetween(snappedPoint, { x: lastAnchor.x, y: lastAnchor.y });
              if (dist < 5 / canvas.zoom && currentShape.anchors.length > 2) {
                const newAnchors = [...currentShape.anchors];
                newAnchors[0] = { ...newAnchors[0], handleIn: lastAnchor.handleIn };
                const newPathData = anchorsToPathData(newAnchors.slice(0, -1), true);
                updateShape(penState.currentPathId, (s) => ({
                  ...s,
                  anchors: newAnchors.slice(0, -1),
                  pathData: newPathData,
                }));
                setPenState({ isDrawing: false, currentPathId: null, closePath: true });
              } else {
                addAnchorToShape(penState.currentPathId, {
                  x: snappedPoint.x,
                  y: snappedPoint.y,
                  handleIn: null,
                  handleOut: null,
                  type: 'corner',
                });
              }
            }
          }
          break;
        }

        case 'brush': {
          setBrushState({ isDrawing: true, currentPathId: null, points: [snappedPoint] });
          break;
        }

        case 'rect':
        case 'circle':
        case 'ellipse': {
          pushHistory();
          setDragState({
            isDragging: true,
            startX: snappedPoint.x,
            startY: snappedPoint.y,
            currentX: snappedPoint.x,
            currentY: snappedPoint.y,
            shapeId: null,
            anchorIndex: -1,
            handleType: 'none',
          });
          break;
        }

        case 'polygon':
        case 'star': {
          pushHistory();
          setDragState({
            isDragging: true,
            startX: snappedPoint.x,
            startY: snappedPoint.y,
            currentX: snappedPoint.x,
            currentY: snappedPoint.y,
            shapeId: null,
            anchorIndex: -1,
            handleType: 'none',
          });
          break;
        }

        case 'text': {
          const shape = createShape('text');
          shape.anchors = [{ x: snappedPoint.x, y: snappedPoint.y, handleIn: null, handleOut: null, type: 'corner' }];
          shape.pathData = `M ${snappedPoint.x} ${snappedPoint.y}`;
          addShape(shape);
          break;
        }

        case 'eyedropper': {
          pickColor(e);
          break;
        }
      }
    },
    [tool, canvas, doc, penState, selection, getCanvasPoint, selectShape, deselectAll, setDragState, setPenState, setBrushState, setSelection, addShape, updateShape, addAnchorToShape, pushHistory]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setCanvas({
          panX: panStart.current.panX + dx,
          panY: panStart.current.panY + dy,
        });
        return;
      }

      const point = getCanvasPoint(e);
      const snappedPoint = canvas.snapToGrid ? snapToGrid(point, canvas.gridSize) : point;

      if (tool === 'pen' && penState.isDrawing && penState.currentPathId && e.buttons === 0) {
        const currentDoc = getActiveDoc();
        const currentShape = currentDoc?.shapes[penState.currentPathId];
        if (currentShape && currentShape.anchors.length > 0) {
          const lastIdx = currentShape.anchors.length - 1;
          const lastAnchor = currentShape.anchors[lastIdx];
          const dx = snappedPoint.x - lastAnchor.x;
          const dy = snappedPoint.y - lastAnchor.y;
          updateAnchor(penState.currentPathId, lastIdx, (a) => ({
            ...a,
            handleOut: { x: dx, y: dy },
            type: 'smooth' as const,
          }));
        }
      }

      if (tool === 'pen' && penState.isDrawing && penState.currentPathId && e.buttons === 1) {
        const currentDoc = getActiveDoc();
        const currentShape = currentDoc?.shapes[penState.currentPathId];
        if (currentShape && currentShape.anchors.length > 0) {
          const lastIdx = currentShape.anchors.length - 1;
          const lastAnchor = currentShape.anchors[lastIdx];
          const dx = snappedPoint.x - lastAnchor.x;
          const dy = snappedPoint.y - lastAnchor.y;
          updateAnchor(penState.currentPathId, lastIdx, (a) => ({
            ...a,
            handleOut: { x: dx, y: dy },
            type: 'smooth' as const,
          }));
        }
      }

      if (tool === 'brush' && brushState.isDrawing) {
        setBrushState((prev) => ({
          ...prev,
          points: [...prev.points, snappedPoint],
        }));
        return;
      }

      if (dragState.isDragging) {
        if (tool === 'directSelect' && dragState.anchorIndex >= 0 && dragState.shapeId) {
          const dx = snappedPoint.x - dragState.startX;
          const dy = snappedPoint.y - dragState.startY;

          if (dragState.handleType === 'in') {
            updateAnchor(dragState.shapeId, dragState.anchorIndex, (a) => ({
              ...a,
              handleIn: { x: a.handleIn ? a.handleIn.x + dx : dx, y: a.handleIn ? a.handleIn.y + dy : dy },
            }));
            setDragState((prev) => ({ ...prev, startX: snappedPoint.x, startY: snappedPoint.y }));
          } else if (dragState.handleType === 'out') {
            updateAnchor(dragState.shapeId, dragState.anchorIndex, (a) => ({
              ...a,
              handleOut: { x: a.handleOut ? a.handleOut.x + dx : dx, y: a.handleOut ? a.handleOut.y + dy : dy },
            }));
            setDragState((prev) => ({ ...prev, startX: snappedPoint.x, startY: snappedPoint.y }));
          } else {
            updateAnchor(dragState.shapeId, dragState.anchorIndex, (a) => ({
              ...a,
              x: a.x + dx,
              y: a.y + dy,
            }));
            setDragState((prev) => ({ ...prev, startX: snappedPoint.x, startY: snappedPoint.y }));
          }
        } else if (tool === 'select' && dragState.shapeId) {
          const dx = snappedPoint.x - dragState.startX;
          const dy = snappedPoint.y - dragState.startY;
          const selectedIds = selection.shapeIds.length > 0 ? selection.shapeIds : [dragState.shapeId];

          const currentDoc = getActiveDoc();
          if (currentDoc) {
            for (const id of selectedIds) {
              const shape = currentDoc.shapes[id];
              if (shape && !shape.locked) {
                updateShape(id, (s) => ({
                  ...s,
                  anchors: s.anchors.map((a) => ({ ...a, x: a.x + dx, y: a.y + dy })),
                }));
              }
            }
          }
          setDragState((prev) => ({ ...prev, startX: snappedPoint.x, startY: snappedPoint.y }));
        } else if (['rect', 'circle', 'ellipse', 'polygon', 'star'].includes(tool)) {
          setDragState((prev) => ({
            ...prev,
            currentX: snappedPoint.x,
            currentY: snappedPoint.y,
          }));
        }
      }

      if (tool === 'directSelect' && !dragState.isDragging) {
        const hitAnchor = hitTestAnchor(point, doc, selection.shapeIds, canvas.zoom);
        if (hitAnchor) {
          setSelection({ hoverShapeId: hitAnchor.shapeId, hoverAnchorIndex: hitAnchor.index });
        } else {
          setSelection({ hoverShapeId: null, hoverAnchorIndex: -1 });
        }
      }
    },
    [tool, canvas, doc, penState, brushState, dragState, selection, getCanvasPoint, setCanvas, setDragState, setBrushState, setSelection, updateAnchor, updateShape, getActiveDoc]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        return;
      }

      if (tool === 'brush' && brushState.isDrawing) {
        const latestBrush = useEditorStore.getState().brushState;
        const smoothed = smoothBrushPoints(latestBrush.points, 0.3);
        const anchors = pointsToAnchors(smoothed);
        if (anchors.length >= 2) {
          const shape = createShape('path');
          shape.anchors = anchors;
          shape.pathData = anchorsToPathData(anchors, false);
          shape.fill = { type: 'none', color: '', opacity: 1, gradient: null, pattern: null };
          addShape(shape);
        }
        setBrushState({ isDrawing: false, currentPathId: null, points: [] });
        return;
      }

      if (dragState.isDragging && ['rect', 'circle', 'ellipse', 'polygon', 'star'].includes(tool)) {
        const latestDrag = useEditorStore.getState().dragState;
        const x1 = Math.min(latestDrag.startX, latestDrag.currentX);
        const y1 = Math.min(latestDrag.startY, latestDrag.currentY);
        const x2 = Math.max(latestDrag.startX, latestDrag.currentX);
        const y2 = Math.max(latestDrag.startY, latestDrag.currentY);
        const w = x2 - x1;
        const h = y2 - y1;

        if (w > 2 || h > 2) {
          let shape: Shape | null = null;
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2;

          switch (tool) {
            case 'rect':
              shape = createShape('rect');
              shape.anchors = createRectAnchors(x1, y1, w, h);
              shape.pathData = createRectPath(x1, y1, w, h);
              break;
            case 'circle': {
              const r = Math.max(w, h) / 2;
              shape = createShape('circle');
              shape.anchors = createCircleAnchors(cx, cy, r);
              shape.pathData = createCirclePath(cx, cy, r);
              break;
            }
            case 'ellipse':
              shape = createShape('ellipse');
              shape.anchors = createEllipseAnchors(cx, cy, w / 2, h / 2);
              shape.pathData = createEllipsePath(cx, cy, w / 2, h / 2);
              break;
            case 'polygon': {
              const r = Math.max(w, h) / 2;
              shape = createShape('polygon');
              shape.anchors = createPolygonAnchors(cx, cy, r, polygonSides);
              shape.pathData = createPolygonPath(cx, cy, r, polygonSides);
              break;
            }
            case 'star': {
              const outerR = Math.max(w, h) / 2;
              const innerR = outerR * starInnerRatio;
              shape = createShape('star');
              shape.anchors = createStarAnchors(cx, cy, outerR, innerR, starPoints);
              shape.pathData = createStarPath(cx, cy, outerR, innerR, starPoints);
              break;
            }
          }

          if (shape) {
            addShape(shape);
          }
        }

        setDragState({
          isDragging: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          shapeId: null,
          anchorIndex: -1,
          handleType: 'none',
        });
      } else if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          shapeId: null,
          anchorIndex: -1,
          handleType: 'none',
        });
      }
    },
    [tool, brushState, dragState, polygonSides, starPoints, starInnerRatio, addShape, setBrushState, setDragState]
  );

  const pickColor = useCallback((e: React.MouseEvent) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(e.target as HTMLCanvasElement, e.clientX, e.clientY, 1, 1, 0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    const hex = '#' + [pixel[0], pixel[1], pixel[2]].map((c) => c.toString(16).padStart(2, '0')).join('');
    setEyedropperColor(hex);
    useEditorStore.getState().updateShapeFill(selection.shapeIds[0], { color: hex, type: 'solid' });
  }, [selection.shapeIds]);

  const renderShape = (shape: Shape, layerOpacity: number = 1): React.ReactNode => {
    if (!shape.visible) return null;
    if (shape.type === 'group') {
      const childShapes = shape.children
        .map((childId) => doc?.shapes[childId])
        .filter(Boolean) as Shape[];
      return (
        <g key={shape.id} opacity={shape.opacity * layerOpacity} style={{ mixBlendMode: shape.blendMode !== 'normal' ? shape.blendMode : undefined }}>
          {childShapes.map((child) => renderShape(child, shape.opacity * layerOpacity))}
        </g>
      );
    }

    const { attrs: fillAttrs, defs: fillDefs } = generateFillSVG(shape.fill, shape.id);
    const strokeAttrs = generateStrokeSVG(shape.stroke);
    const isSelected = selection.shapeIds.includes(shape.id);

    const allAttrs: Record<string, string> = {
      ...fillAttrs,
      ...strokeAttrs,
      opacity: (shape.opacity * layerOpacity).toString(),
      transform: shape.transform || undefined,
      'mix-blend-mode': shape.blendMode !== 'normal' ? shape.blendMode : undefined,
    };

    const cleanAttrs = Object.fromEntries(
      Object.entries(allAttrs).filter(([, v]) => v !== undefined && v !== null)
    );

    if (shape.type === 'text' && shape.textProps) {
      const tp = shape.textProps;
      if (tp.pathId && shape.pathData) {
        return (
          <g key={shape.id}>
            {fillDefs}
            <text
              {...cleanAttrs}
              fontFamily={tp.fontFamily}
              fontSize={tp.fontSize}
              fontWeight={tp.fontWeight}
              fontStyle={tp.fontStyle}
            >
              <textPath href={`#textpath-${shape.id}`} startOffset={`${tp.startOffset}%`}>
                {tp.content}
              </textPath>
            </text>
            {isSelected && <path d={shape.pathData} fill="none" stroke="#4a90d9" strokeWidth={1 / canvas.zoom} strokeDasharray={`${4 / canvas.zoom}`} />}
          </g>
        );
      }
      const anchor = shape.anchors[0];
      return (
        <g key={shape.id}>
          {fillDefs}
          <text
            {...cleanAttrs}
            x={anchor?.x || 0}
            y={anchor?.y || 0}
            fontFamily={tp.fontFamily}
            fontSize={tp.fontSize}
            fontWeight={tp.fontWeight}
            fontStyle={tp.fontStyle}
            textAnchor={tp.textAnchor}
          >
            {tp.content}
          </text>
          {isSelected && (
            <rect
              x={anchor ? anchor.x - 2 : 0}
              y={anchor ? anchor.y - tp.fontSize : 0}
              width={tp.content.length * tp.fontSize * 0.6 + 4}
              height={tp.fontSize * 1.2}
              fill="none"
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              strokeDasharray={`${4 / canvas.zoom}`}
            />
          )}
        </g>
      );
    }

    const d = shape.pathData || anchorsToPathData(shape.anchors, true);
    const fillRule = shape.booleanOp === 'subtract' || shape.booleanOp === 'exclude' ? 'evenodd' : undefined;

    return (
      <g key={shape.id}>
        {fillDefs}
        <path
          d={d}
          {...cleanAttrs}
          fillRule={fillRule}
          style={{ cursor: tool === 'select' || tool === 'directSelect' ? 'move' : 'default' }}
        />
        {isSelected && (
          <path
            d={d}
            fill="none"
            stroke="#4a90d9"
            strokeWidth={1.5 / canvas.zoom}
            strokeDasharray={`${6 / canvas.zoom} ${3 / canvas.zoom}`}
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  const renderAnchors = (): React.ReactNode => {
    if (tool !== 'directSelect' && tool !== 'pen') return null;

    const anchors: React.ReactNode[] = [];

    for (const shapeId of selection.shapeIds) {
      const shape = doc?.shapes[shapeId];
      if (!shape || shape.type === 'text') continue;

      for (let i = 0; i < shape.anchors.length; i++) {
        const anchor = shape.anchors[i];
        const isSelected = selection.anchorIndices.includes(i);
        const isHovered = selection.hoverAnchorIndex === i && selection.hoverShapeId === shapeId;

        if (anchor.handleIn) {
          const hx = anchor.x + anchor.handleIn.x;
          const hy = anchor.y + anchor.handleIn.y;
          anchors.push(
            <line
              key={`${shapeId}-hi-${i}`}
              x1={anchor.x}
              y1={anchor.y}
              x2={hx}
              y2={hy}
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              pointerEvents="none"
            />,
            <circle
              key={`${shapeId}-hic-${i}`}
              cx={hx}
              cy={hy}
              r={HANDLE_SIZE / canvas.zoom}
              fill="white"
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                pushHistory();
                setDragState({
                  isDragging: true,
                  startX: getCanvasPoint(e).x,
                  startY: getCanvasPoint(e).y,
                  currentX: getCanvasPoint(e).x,
                  currentY: getCanvasPoint(e).y,
                  shapeId,
                  anchorIndex: i,
                  handleType: 'in',
                });
              }}
            />
          );
        }

        if (anchor.handleOut) {
          const hx = anchor.x + anchor.handleOut.x;
          const hy = anchor.y + anchor.handleOut.y;
          anchors.push(
            <line
              key={`${shapeId}-ho-${i}`}
              x1={anchor.x}
              y1={anchor.y}
              x2={hx}
              y2={hy}
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              pointerEvents="none"
            />,
            <circle
              key={`${shapeId}-hoc-${i}`}
              cx={hx}
              cy={hy}
              r={HANDLE_SIZE / canvas.zoom}
              fill="white"
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                pushHistory();
                setDragState({
                  isDragging: true,
                  startX: getCanvasPoint(e).x,
                  startY: getCanvasPoint(e).y,
                  currentX: getCanvasPoint(e).x,
                  currentY: getCanvasPoint(e).y,
                  shapeId,
                  anchorIndex: i,
                  handleType: 'out',
                });
              }}
            />
          );
        }

        anchors.push(
          <rect
            key={`${shapeId}-a-${i}`}
            x={anchor.x - ANCHOR_SIZE / canvas.zoom}
            y={anchor.y - ANCHOR_SIZE / canvas.zoom}
            width={(ANCHOR_SIZE * 2) / canvas.zoom}
            height={(ANCHOR_SIZE * 2) / canvas.zoom}
            fill={isSelected ? '#4a90d9' : isHovered ? '#6ab0ff' : 'white'}
            stroke="#4a90d9"
            strokeWidth={1 / canvas.zoom}
            style={{ cursor: tool === 'pen' ? 'crosshair' : 'pointer' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (tool === 'directSelect') {
                setSelection({ shapeIds: [shapeId], anchorIndices: [i] });
                pushHistory();
                setDragState({
                  isDragging: true,
                  startX: getCanvasPoint(e).x,
                  startY: getCanvasPoint(e).y,
                  currentX: getCanvasPoint(e).x,
                  currentY: getCanvasPoint(e).y,
                  shapeId,
                  anchorIndex: i,
                  handleType: 'none',
                });
              }
            }}
          />
        );
      }
    }

    if (penState.isDrawing && penState.currentPathId) {
      const shape = doc?.shapes[penState.currentPathId];
      if (shape) {
        for (let i = 0; i < shape.anchors.length; i++) {
          const anchor = shape.anchors[i];
          if (anchor.handleOut) {
            const hx = anchor.x + anchor.handleOut.x;
            const hy = anchor.y + anchor.handleOut.y;
            anchors.push(
              <line
                key={`pen-ho-${i}`}
                x1={anchor.x}
                y1={anchor.y}
                x2={hx}
                y2={hy}
                stroke="#4a90d9"
                strokeWidth={1 / canvas.zoom}
                pointerEvents="none"
              />,
              <circle
                key={`pen-hoc-${i}`}
                cx={hx}
                cy={hy}
                r={HANDLE_SIZE / canvas.zoom}
                fill="white"
                stroke="#4a90d9"
                strokeWidth={1 / canvas.zoom}
                pointerEvents="none"
              />
            );
          }
          anchors.push(
            <circle
              key={`pen-a-${i}`}
              cx={anchor.x}
              cy={anchor.y}
              r={ANCHOR_SIZE / canvas.zoom}
              fill={i === shape.anchors.length - 1 ? '#4a90d9' : 'white'}
              stroke="#4a90d9"
              strokeWidth={1 / canvas.zoom}
              pointerEvents="none"
            />
          );
        }
      }
    }

    return anchors;
  };

  const renderBrushPreview = (): React.ReactNode => {
    if (!brushState.isDrawing || brushState.points.length < 2) return null;
    const smoothed = smoothBrushPoints(brushState.points, 0.3);
    const anchors = pointsToAnchors(smoothed);
    const d = anchorsToPathData(anchors, false);
    return (
      <path
        d={d}
        fill="none"
        stroke="#222222"
        strokeWidth={2 / canvas.zoom}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
    );
  };

  const renderShapePreview = (): React.ReactNode => {
    if (!dragState.isDragging || !['rect', 'circle', 'ellipse', 'polygon', 'star'].includes(tool)) return null;

    const x1 = Math.min(dragState.startX, dragState.currentX);
    const y1 = Math.min(dragState.startY, dragState.currentY);
    const x2 = Math.max(dragState.startX, dragState.currentX);
    const y2 = Math.max(dragState.startY, dragState.currentY);
    const w = x2 - x1;
    const h = y2 - y1;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    let previewPath = '';
    switch (tool) {
      case 'rect':
        previewPath = createRectPath(x1, y1, w, h);
        break;
      case 'circle': {
        const r = Math.max(w, h) / 2;
        previewPath = createCirclePath(cx, cy, r);
        break;
      }
      case 'ellipse':
        previewPath = createEllipsePath(cx, cy, w / 2, h / 2);
        break;
      case 'polygon': {
        const r = Math.max(w, h) / 2;
        previewPath = createPolygonPath(cx, cy, r, polygonSides);
        break;
      }
      case 'star': {
        const outerR = Math.max(w, h) / 2;
        const innerR = outerR * starInnerRatio;
        previewPath = createStarPath(cx, cy, outerR, innerR, starPoints);
        break;
      }
    }

    return (
      <path
        d={previewPath}
        fill="rgba(74, 144, 217, 0.2)"
        stroke="#4a90d9"
        strokeWidth={1 / canvas.zoom}
        strokeDasharray={`${4 / canvas.zoom}`}
        pointerEvents="none"
      />
    );
  };

  const renderSelectionBounds = (): React.ReactNode => {
    if (selection.shapeIds.length === 0 || tool === 'pen') return null;

    const boundses = selection.shapeIds.map((id) => {
      const shape = doc?.shapes[id];
      if (!shape) return null;
      const { x, y, w, h } = (() => {
        if (shape.type === 'text' && shape.textProps && shape.anchors[0]) {
          const a = shape.anchors[0];
          return {
            x: a.x,
            y: a.y - shape.textProps.fontSize,
            w: shape.textProps.content.length * shape.textProps.fontSize * 0.6,
            h: shape.textProps.fontSize * 1.2,
          };
        }
        const bounds = { x: 0, y: 0, w: 0, h: 0 };
        if (shape.anchors.length > 0) {
          const b = (() => {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const a of shape.anchors) {
              minX = Math.min(minX, a.x);
              minY = Math.min(minY, a.y);
              maxX = Math.max(maxX, a.x);
              maxY = Math.max(maxY, a.y);
            }
            return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
          })();
          Object.assign(bounds, b);
        }
        return bounds;
      })();
      return { x, y, w, h };
    }).filter(Boolean) as { x: number; y: number; w: number; h: number }[];

    if (boundses.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const b of boundses) {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w);
      maxY = Math.max(maxY, b.y + b.h);
    }

    const handleSize = 3 / canvas.zoom;
    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];

    return (
      <g pointerEvents="none">
        <rect
          x={minX}
          y={minY}
          width={maxX - minX}
          height={maxY - minY}
          fill="none"
          stroke="#4a90d9"
          strokeWidth={1 / canvas.zoom}
        />
        {corners.map((c, i) => (
          <rect
            key={i}
            x={c.x - handleSize}
            y={c.y - handleSize}
            width={handleSize * 2}
            height={handleSize * 2}
            fill="white"
            stroke="#4a90d9"
            strokeWidth={1 / canvas.zoom}
          />
        ))}
      </g>
    );
  };

  const getCursor = (): string => {
    if (isPanning.current) return 'grabbing';
    switch (tool) {
      case 'select': return 'default';
      case 'directSelect': return 'default';
      case 'pen': return 'crosshair';
      case 'brush': return 'crosshair';
      case 'rect':
      case 'circle':
      case 'ellipse':
      case 'polygon':
      case 'star': return 'crosshair';
      case 'text': return 'text';
      case 'eyedropper': return 'crosshair';
      default: return 'default';
    }
  };

  const renderArtboard = () => {
    if (!doc) return null;
    return (
      <rect
        x={0}
        y={0}
        width={doc.width}
        height={doc.height}
        fill="#2a2a2a"
        stroke="#555"
        strokeWidth={1 / canvas.zoom}
      />
    );
  };

  return (
    <div ref={containerRef} className="canvas-container" style={{ cursor: getCursor() }}>
      <canvas
        ref={gridCanvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="grid-canvas"
      />
      <canvas
        ref={rulerCanvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="ruler-canvas"
        style={{ pointerEvents: 'none' }}
      />
      <svg
        ref={svgRef}
        className="drawing-svg"
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        tabIndex={0}
      >
        <defs>
          {doc && Object.values(doc.shapes).map((shape) => {
            if (shape.type === 'text' && shape.textProps?.pathId) {
              return (
                <path key={`textpath-${shape.id}`} id={`textpath-${shape.id}`} d={shape.pathData || ''} />
              );
            }
            return null;
          })}
        </defs>
        <g transform={`translate(${canvas.panX}, ${canvas.panY}) scale(${canvas.zoom})`}>
          {doc && renderArtboard()}
          {doc && doc.layers.map((layer) => {
            if (!layer.visible) return null;
            return (
              <g key={layer.id} opacity={layer.opacity} style={{ mixBlendMode: layer.blendMode !== 'normal' ? layer.blendMode : undefined }}>
                {layer.shapeIds.map((shapeId) => {
                  const shape = doc.shapes[shapeId];
                  if (!shape) return null;
                  return renderShape(shape, layer.opacity);
                })}
              </g>
            );
          })}
          {renderAnchors()}
          {renderBrushPreview()}
          {renderShapePreview()}
          {renderSelectionBounds()}
        </g>
      </svg>
      <div className="zoom-indicator">
        {Math.round(canvas.zoom * 100)}%
      </div>
      {eyedropperColor && (
        <div className="eyedropper-indicator" style={{ backgroundColor: eyedropperColor }}>
          {eyedropperColor}
        </div>
      )}
    </div>
  );
};

function hitTest(point: Point, doc: any | null): Shape | null {
  if (!doc) return null;

  for (let li = doc.layers.length - 1; li >= 0; li--) {
    const layer = doc.layers[li];
    if (!layer.visible || layer.locked) continue;

    for (let si = layer.shapeIds.length - 1; si >= 0; si--) {
      const shapeId = layer.shapeIds[si];
      const shape = doc.shapes[shapeId];
      if (!shape || !shape.visible || shape.locked) continue;

      if (shape.type === 'group') {
        for (const childId of shape.children) {
          const child = doc.shapes[childId];
          if (child && isPointInShapeBounds(point, child)) {
            return shape;
          }
        }
      } else if (isPointInShapeBounds(point, shape)) {
        return shape;
      }
    }
  }
  return null;
}

function isPointInShapeBounds(point: Point, shape: Shape): boolean {
  if (shape.anchors.length === 0) return false;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const a of shape.anchors) {
    minX = Math.min(minX, a.x);
    minY = Math.min(minY, a.y);
    maxX = Math.max(maxX, a.x);
    maxY = Math.max(maxY, a.y);
  }
  const margin = 5;
  return point.x >= minX - margin && point.x <= maxX + margin && point.y >= minY - margin && point.y <= maxY + margin;
}

function hitTestAnchor(
  point: Point,
  doc: any | null,
  selectedIds: string[],
  zoom: number
): { shapeId: string; index: number } | null {
  if (!doc) return null;
  const threshold = 8 / zoom;

  for (const shapeId of selectedIds) {
    const shape = doc.shapes[shapeId];
    if (!shape || !shape.anchors) continue;

    for (let i = 0; i < shape.anchors.length; i++) {
      const anchor = shape.anchors[i];
      if (distanceBetween(point, { x: anchor.x, y: anchor.y }) < threshold) {
        return { shapeId, index: i };
      }
      if (anchor.handleIn) {
        if (distanceBetween(point, { x: anchor.x + anchor.handleIn.x, y: anchor.y + anchor.handleIn.y }) < threshold) {
          return { shapeId, index: i };
        }
      }
      if (anchor.handleOut) {
        if (distanceBetween(point, { x: anchor.x + anchor.handleOut.x, y: anchor.y + anchor.handleOut.y }) < threshold) {
          return { shapeId, index: i };
        }
      }
    }
  }
  return null;
}

export default Canvas;
