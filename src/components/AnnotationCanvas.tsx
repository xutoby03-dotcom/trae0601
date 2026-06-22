import { useRef, useEffect, useState, useCallback, RefObject } from 'react';
import { usePracticeStore } from '@/store/practiceStore';
import type { Annotation, ErrorType } from '@/types';
import { ERROR_TYPE_LABELS, ANNOTATION_COLORS } from '@/types';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
}

type DrawState = {
  isDrawing: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export default function AnnotationCanvas({ videoRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    currentTool,
    currentColor,
    currentErrorType,
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectedAnnotationId,
    setSelectedAnnotation,
    videoCurrentTime,
    currentRecordId,
  } = usePracticeStore();

  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
  const [textValue, setTextValue] = useState('');

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return { width: 0, height: 0 };
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [videoRef]);

  const drawAnnotation = useCallback(
    (ctx: CanvasRenderingContext2D, ann: Annotation, isSelected: boolean, scale: { w: number; h: number }) => {
      ctx.save();
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.type === 'rect' && ann.width && ann.height) {
        ctx.strokeRect(ann.x * scale.w, ann.y * scale.h, ann.width * scale.w, ann.height * scale.h);
        if (isSelected) {
          ctx.fillStyle = ann.color + '30';
          ctx.fillRect(ann.x * scale.w, ann.y * scale.h, ann.width * scale.w, ann.height * scale.h);
        }
      } else if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
        const x1 = ann.x * scale.w;
        const y1 = ann.y * scale.h;
        const x2 = ann.endX * scale.w;
        const y2 = ann.endY * scale.h;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 15;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'text' && ann.text) {
        ctx.font = 'bold 16px "Noto Sans SC", sans-serif';
        const padding = 6;
        const metrics = ctx.measureText(ann.text);
        const textWidth = metrics.width + padding * 2;
        const textHeight = 24;

        ctx.fillStyle = ann.color;
        ctx.beginPath();
        const x = ann.x * scale.w;
        const y = ann.y * scale.h;
        roundRect(ctx, x, y, textWidth, textHeight, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(ann.text, x + padding, y + 17);

        if (isSelected) {
          ctx.strokeStyle = '#1e3a5f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          roundRect(ctx, x, y, textWidth, textHeight, 6);
          ctx.stroke();
        }
      }

      ctx.restore();
    },
    []
  );

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = getCanvasSize();
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const scale = { w: width, h: height };
    annotations
      .filter((a) => Math.abs(a.timestamp - videoCurrentTime) < 0.5)
      .forEach((ann) => {
        drawAnnotation(ctx, ann, ann.id === selectedAnnotationId, scale);
      });

    if (drawState && drawState.isDrawing) {
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);

      if (currentTool === 'rect') {
        ctx.strokeRect(
          drawState.startX,
          drawState.startY,
          drawState.endX - drawState.startX,
          drawState.endY - drawState.startY
        );
      } else if (currentTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(drawState.startX, drawState.startY);
        ctx.lineTo(drawState.endX, drawState.endY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [annotations, selectedAnnotationId, videoCurrentTime, drawState, currentTool, currentColor, getCanvasSize, drawAnnotation]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  const getRelPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      px: e.clientX - rect.left,
      py: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'select') {
      const pos = getRelPos(e);
      const { width, height } = getCanvasSize();
      const clicked = annotations
        .filter((a) => Math.abs(a.timestamp - videoCurrentTime) < 0.5)
        .reverse()
        .find((a) => {
          if (a.type === 'rect' && a.width && a.height) {
            return (
              pos.x >= a.x &&
              pos.x <= a.x + a.width &&
              pos.y >= a.y &&
              pos.y <= a.y + a.height
            );
          }
          const dist = Math.sqrt(Math.pow(pos.x - a.x, 2) + Math.pow(pos.y - a.y, 2));
          return dist < 0.05;
        });
      setSelectedAnnotation(clicked?.id || null);
      return;
    }

    if (currentTool === 'eraser') {
      const pos = getRelPos(e);
      const toDelete = annotations.find((a) => {
        if (a.type === 'rect' && a.width && a.height) {
          return (
            pos.x >= a.x &&
            pos.x <= a.x + a.width &&
            pos.y >= a.y &&
            pos.y <= a.y + a.height
          );
        }
        const dist = Math.sqrt(Math.pow(pos.x - a.x, 2) + Math.pow(pos.y - a.y, 2));
        return dist < 0.05;
      });
      if (toDelete) {
        deleteAnnotation(toDelete.id);
      }
      return;
    }

    const pos = getRelPos(e);

    if (currentTool === 'text') {
      setTextInputPos({ x: pos.px, y: pos.py });
      setTextValue('');
      setShowTextInput(true);
      return;
    }

    setDrawState({
      isDrawing: true,
      startX: pos.px,
      startY: pos.py,
      endX: pos.px,
      endY: pos.py,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawState?.isDrawing) return;
    const pos = getRelPos(e);
    setDrawState({
      ...drawState,
      endX: pos.px,
      endY: pos.py,
    });
  };

  const handleMouseUp = () => {
    if (!drawState?.isDrawing) return;
    const { width, height } = getCanvasSize();

    const x = Math.min(drawState.startX, drawState.endX) / width;
    const y = Math.min(drawState.startY, drawState.endY) / height;
    const relW = Math.abs(drawState.endX - drawState.startX) / width;
    const relH = Math.abs(drawState.endY - drawState.startY) / height;

    if (relW < 0.02 && relH < 0.02) {
      setDrawState(null);
      return;
    }

    if (currentTool === 'rect') {
      addAnnotation({
        frameIndex: Math.floor(videoCurrentTime * 30),
        timestamp: videoCurrentTime,
        type: 'rect',
        color: currentColor,
        x,
        y,
        width: relW,
        height: relH,
        errorType: currentErrorType,
      });
    } else if (currentTool === 'arrow') {
      addAnnotation({
        frameIndex: Math.floor(videoCurrentTime * 30),
        timestamp: videoCurrentTime,
        type: 'arrow',
        color: currentColor,
        x: drawState.startX / width,
        y: drawState.startY / height,
        endX: drawState.endX / width,
        endY: drawState.endY / height,
        errorType: currentErrorType,
      });
    }

    setDrawState(null);
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) {
      setShowTextInput(false);
      return;
    }

    const { width, height } = getCanvasSize();

    addAnnotation({
      frameIndex: Math.floor(videoCurrentTime * 30),
      timestamp: videoCurrentTime,
      type: 'text',
      color: currentColor,
      x: textInputPos.x / width,
      y: textInputPos.y / height,
      text: textValue.trim(),
      errorType: currentErrorType,
    });

    setShowTextInput(false);
    setTextValue('');
  };

  const cursorStyle =
    currentTool === 'select' ? 'cursor-default' :
    currentTool === 'eraser' ? 'cursor-not-allowed' :
    'cursor-crosshair';

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${cursorStyle}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {showTextInput && (
        <div
          className="absolute z-20 flex items-center gap-1"
          style={{ left: textInputPos.x, top: textInputPos.y }}
        >
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') setShowTextInput(false);
            }}
            autoFocus
            placeholder="输入批注文字..."
            className="px-3 py-1.5 text-sm bg-white border-2 rounded-lg shadow-lg focus:outline-none"
            style={{ borderColor: currentColor }}
          />
          <button
            onClick={handleTextSubmit}
            className="px-3 py-1.5 text-sm text-white rounded-lg"
            style={{ backgroundColor: currentColor }}
          >
            确定
          </button>
          <button
            onClick={() => setShowTextInput(false)}
            className="px-2 py-1.5 text-sm text-gray-500 bg-white rounded-lg border hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      )}

      {currentRecordId && (
        <div className="absolute top-3 left-3 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg">
          编辑模式 · 可在视频上标注
        </div>
      )}
    </div>
  );
}
