import { useCallback, useRef, useState } from 'react';
import { useCanvasStore, Tool } from '../../store/useStore';

const GRID_SIZE = 32;
const CELL_SIZE = 20;

export const EmojiCanvas = () => {
  const { grid, currentEmoji, currentTool, setPixel, setColumn, setRow, applyBucket, saveToHistory } = useCanvasStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const lastDrawRef = useRef<{ x: number; y: number } | null>(null);

  const applyTool = useCallback((x: number, y: number, tool: Tool) => {
    switch (tool) {
      case 'pixel':
        setPixel(x, y);
        break;
      case 'column':
        setColumn(x);
        break;
      case 'row':
        setRow(y);
        break;
      case 'bucket':
        applyBucket(x, y);
        break;
    }
  }, [setPixel, setColumn, setRow, applyBucket]);

  const handleCellClick = (x: number, y: number) => {
    saveToHistory();
    applyTool(x, y, currentTool);
  };

  const handleMouseDown = (x: number, y: number) => {
    if (currentTool !== 'bucket') {
      setIsDrawing(true);
      lastDrawRef.current = { x, y };
      saveToHistory();
      applyTool(x, y, currentTool);
    }
  };

  const handleMouseEnter = (x: number, y: number) => {
    setHoveredCell({ x, y });
    if (isDrawing && currentTool === 'pixel') {
      const last = lastDrawRef.current;
      if (!last || last.x !== x || last.y !== y) {
        lastDrawRef.current = { x, y };
        setPixel(x, y);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastDrawRef.current = null;
  };

  const getPreviewCells = (): Set<string> => {
    if (!hoveredCell) return new Set();
    const { x, y } = hoveredCell;
    const preview = new Set<string>();
    
    switch (currentTool) {
      case 'pixel':
        preview.add(`${x},${y}`);
        break;
      case 'column':
        for (let i = 0; i < GRID_SIZE; i++) {
          preview.add(`${x},${i}`);
        }
        break;
      case 'row':
        for (let i = 0; i < GRID_SIZE; i++) {
          preview.add(`${i},${y}`);
        }
        break;
    }
    return preview;
  };

  const previewCells = getPreviewCells();

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl p-4 border-4 border-purple-200 animate-pulse-glow"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredCell(null);
        }}
      >
        <div 
          className="grid gap-px bg-gradient-to-br from-purple-100 to-pink-100 p-1 rounded-lg"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((emoji, x) => {
              const isPreview = previewCells.has(`${x},${y}`) && !emoji;
              const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    flex items-center justify-center
                    transition-all duration-75 cursor-pointer
                    bg-white rounded-sm
                    ${isHovered ? 'scale-125 z-10 shadow-lg' : ''}
                    ${isPreview ? 'bg-purple-50' : ''}
                    hover:bg-purple-50
                  `}
                  style={{ 
                    width: CELL_SIZE, 
                    height: CELL_SIZE,
                    fontSize: CELL_SIZE - 6,
                    lineHeight: 1,
                  }}
                  onClick={() => handleCellClick(x, y)}
                  onMouseDown={() => handleMouseDown(x, y)}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                >
                  {emoji ? (
                    <span className="animate-pop-in">{emoji}</span>
                  ) : (isPreview && currentTool !== 'bucket' ? (
                    <span className="opacity-30">{currentEmoji}</span>
                  ) : null)}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="animate-float inline-block">💡</span>
        <span>按住鼠标拖动可以连续绘制</span>
      </div>
    </div>
  );
};
