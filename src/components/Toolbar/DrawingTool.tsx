import { useEditorStore } from '../../store/editorStore';
import type { DrawingLayer } from '../../types';

const presetColors = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff',
  '#0000ff', '#8b00ff', '#ff00ff', '#ffffff', '#000000',
  '#808080', '#8b4513', '#ffc0cb', '#ffa500', '#228b22',
];

export const DrawingTool = () => {
  const { activeTool, selectedLayerId, updateLayer, getSelectedLayer } = useEditorStore();
  
  const selectedLayer = getSelectedLayer() as DrawingLayer | null;
  
  if (activeTool !== 'drawing' || !selectedLayer || selectedLayer.type !== 'drawing') return null;

  return (
    <div className="w-56 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-3">涂鸦设置</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">画笔颜色</label>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => updateLayer(selectedLayerId!, { brushColor: color } as Partial<DrawingLayer>)}
                className={`w-7 h-7 rounded transition-all ${
                  selectedLayer.brushColor === color
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#2d2d2d]'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLayer.brushColor}
              onChange={(e) => updateLayer(selectedLayerId!, { brushColor: e.target.value } as Partial<DrawingLayer>)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <input
              type="text"
              value={selectedLayer.brushColor}
              onChange={(e) => updateLayer(selectedLayerId!, { brushColor: e.target.value } as Partial<DrawingLayer>)}
              className="flex-1 bg-gray-700 text-gray-200 text-xs px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">
            画笔粗细: {selectedLayer.brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={selectedLayer.brushSize}
            onChange={(e) => updateLayer(selectedLayerId!, { brushSize: Number(e.target.value) } as Partial<DrawingLayer>)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          在图片上自由绘制
        </div>
      </div>
    </div>
  );
};
