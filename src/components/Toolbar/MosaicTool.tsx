import { useEditorStore } from '../../store/editorStore';
import type { MosaicLayer } from '../../types';

export const MosaicTool = () => {
  const { activeTool, selectedLayerId, updateLayer, getSelectedLayer } = useEditorStore();
  
  const selectedLayer = getSelectedLayer() as MosaicLayer | null;
  
  if (activeTool !== 'mosaic' || !selectedLayer || selectedLayer.type !== 'mosaic') return null;

  return (
    <div className="w-56 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-3">马赛克设置</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">
            颗粒粗细: {selectedLayer.brushSize}px
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={selectedLayer.brushSize}
            onChange={(e) => updateLayer(selectedLayerId!, { brushSize: Number(e.target.value) } as Partial<MosaicLayer>)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="text-xs text-gray-500">
          在图片上涂抹以添加马赛克效果
        </div>
      </div>
    </div>
  );
};
