import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Minus, Type, Undo2, Redo2, Trash2, Download, Palette } from 'lucide-react';

type Tool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text';

const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000',
    '#808000', '#008000', '#800080', '#008080', '#000080',
    '#ffa500', '#a52a2a', '#ffc0cb', '#add8e6', '#90ee90',
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([imageData]);
        setHistoryIndex(0);
      }
    }
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const newIndex = historyIndex - 1;
          ctx.putImageData(history[newIndex], 0, 0);
          setHistoryIndex(newIndex);
        }
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const newIndex = historyIndex + 1;
          ctx.putImageData(history[newIndex], 0, 0);
          setHistoryIndex(newIndex);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
      }
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'text') {
      const text = prompt('输入文字:');
      if (text) {
        ctx.font = `${brushSize * 4}px sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(text, pos.x, pos.y);
        saveState();
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    if (tool === 'pencil') {
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    if (tool === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        pos.x - startPos.x,
        pos.y - startPos.y
      );
    } else if (tool === 'circle') {
      const radiusX = Math.abs(pos.x - startPos.x) / 2;
      const radiusY = Math.abs(pos.y - startPos.y) / 2;
      const centerX = startPos.x + (pos.x - startPos.x) / 2;
      const centerY = startPos.y + (pos.y - startPos.y) / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    setIsDrawing(false);
    saveState();
  };

  const tools = [
    { id: 'pencil' as Tool, icon: <Pencil size={18} />, label: '画笔' },
    { id: 'eraser' as Tool, icon: <Eraser size={18} />, label: '橡皮擦' },
    { id: 'line' as Tool, icon: <Minus size={18} />, label: '直线' },
    { id: 'rectangle' as Tool, icon: <Square size={18} />, label: '矩形' },
    { id: 'circle' as Tool, icon: <Circle size={18} />, label: '圆形' },
    { id: 'text' as Tool, icon: <Type size={18} />, label: '文字' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-window-background)' }}>
      <div 
        className="flex items-center gap-1 px-2 py-2 border-b"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        {tools.map(t => (
          <button
            key={t.id}
            className={`p-2 rounded transition-colors ${
              tool === t.id ? 'bg-blue-500/20' : 'hover:bg-white/10'
            }`}
            onClick={() => setTool(t.id)}
            title={t.label}
            style={{ color: tool === t.id ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
          >
            {t.icon}
          </button>
        ))}

        <div className="w-px h-6 mx-2" style={{ background: 'var(--color-taskbar-border)' }} />

        <button
          className="p-2 rounded transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="撤销"
        >
          <Undo2 size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-2 rounded transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="重做"
        >
          <Redo2 size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>

        <div className="w-px h-6 mx-2" style={{ background: 'var(--color-taskbar-border)' }} />

        <button
          className="p-2 rounded transition-colors hover:bg-white/10"
          onClick={clearCanvas}
          title="清空"
        >
          <Trash2 size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-2 rounded transition-colors hover:bg-white/10"
          onClick={downloadImage}
          title="保存"
        >
          <Download size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>

        <div className="w-px h-6 mx-2" style={{ background: 'var(--color-taskbar-border)' }} />

        <div className="flex items-center gap-2">
          <Palette size={16} style={{ color: 'var(--color-text-primary)' }} />
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-20"
          />
          <div 
            className="w-6 h-6 rounded border"
            style={{ background: color, borderColor: 'var(--color-input-border)' }}
          />
        </div>
      </div>

      <div 
        className="flex gap-1 px-2 py-1 border-b overflow-x-auto"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        {colors.map(c => (
          <button
            key={c}
            className={`w-5 h-5 rounded-sm flex-shrink-0 border-2 transition-transform hover:scale-110 ${
              color === c ? 'border-blue-500' : 'border-transparent'
            }`}
            style={{ background: c, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 flex items-start justify-center"
        style={{ background: '#666' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="shadow-lg cursor-crosshair"
          style={{ background: '#ffffff' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
};

export default Paint;
