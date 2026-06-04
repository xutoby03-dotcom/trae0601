import {
  MousePointer2,
  Crop,
  RotateCw,
  FlipHorizontal,
  Type,
  Grid3x3,
  Pencil,
  Lasso,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { ToolType } from '../../types';

const tools: { id: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: '选择' },
  { id: 'crop', icon: Crop, label: '裁剪' },
  { id: 'rotate', icon: RotateCw, label: '旋转' },
  { id: 'flip', icon: FlipHorizontal, label: '翻转' },
  { id: 'text', icon: Type, label: '文字' },
  { id: 'mosaic', icon: Grid3x3, label: '马赛克' },
  { id: 'drawing', icon: Pencil, label: '涂鸦' },
  { id: 'lasso', icon: Lasso, label: '套索' },
];

export const Toolbar = () => {
  const {
    activeTool,
    selectedLayerId,
    layers,
    setActiveTool,
    rotateCanvas,
    flipCanvas,
    addTextLayer,
    addMosaicLayer,
    addDrawingLayer,
    setCropSettings,
    canvasWidth,
    canvasHeight,
    undo,
    redo,
  } = useEditorStore();

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === 'rotate') {
      rotateCanvas(90);
      return;
    }
    if (toolId === 'flip') {
      flipCanvas(true);
      return;
    }
    if (toolId === 'text') {
      addTextLayer('双击编辑', canvasWidth / 2 - 50, canvasHeight / 2);
      return;
    }
    if (toolId === 'mosaic') {
      const mosaicLayer = layers.find((l) => l.type === 'mosaic');
      if (!mosaicLayer) {
        addMosaicLayer();
      } else {
        setActiveTool('mosaic');
      }
      return;
    }
    if (toolId === 'drawing') {
      const drawingLayer = layers.find((l) => l.type === 'drawing');
      if (!drawingLayer) {
        addDrawingLayer();
      } else {
        setActiveTool('drawing');
      }
      return;
    }
    if (toolId === 'crop') {
      setActiveTool('crop');
      setCropSettings({
        active: true,
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
      });
      return;
    }
    setActiveTool(toolId);
  };

  const handleUndo = () => {
    if (selectedLayerId) {
      undo(selectedLayerId);
    }
  };

  const handleRedo = () => {
    if (selectedLayerId) {
      redo(selectedLayerId);
    }
  };

  const hasImage = layers.length > 0;

  return (
    <div className="w-16 bg-[#252525] border-r border-gray-700 flex flex-col items-center py-2 gap-1">
      <div className="flex flex-col gap-1 mb-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const isDisabled = !hasImage && !['select'].includes(tool.id);
          
          return (
            <button
              key={tool.id}
              onClick={() => !isDisabled && handleToolClick(tool.id)}
              disabled={isDisabled}
              title={tool.label}
              className={`
                w-12 h-12 rounded flex items-center justify-center transition-all
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : isDisabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      
      <div className="w-10 h-px bg-gray-700 my-2" />
      
      <div className="flex flex-col gap-1">
        <button
          onClick={handleUndo}
          disabled={!selectedLayerId}
          title="撤销 (Ctrl+Z)"
          className="w-12 h-12 rounded flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-all disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!selectedLayerId}
          title="重做 (Ctrl+Y)"
          className="w-12 h-12 rounded flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white transition-all disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
