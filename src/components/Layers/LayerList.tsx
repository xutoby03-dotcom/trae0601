import { Plus } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { LayerItem } from './LayerItem';

export const LayerList = () => {
  const { layers, addTextLayer, canvasWidth, canvasHeight } = useEditorStore();

  const handleAddText = () => {
    addTextLayer('新文字', canvasWidth / 2 - 50, canvasHeight / 2);
  };

  return (
    <div className="h-36 bg-[#252525] border-b border-gray-700">
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-200">图层</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddText}
              disabled={layers.length === 0}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="添加文字图层"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-2">
          {layers.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              上传图片后显示图层
            </div>
          ) : (
            <div className="flex gap-2 h-full">
              {[...layers].reverse().map((layer, reversedIndex) => {
                const actualIndex = layers.length - 1 - reversedIndex;
                return (
                  <div key={layer.id} className="w-48 flex-shrink-0">
                    <LayerItem
                      layer={layer}
                      index={actualIndex}
                      totalLayers={layers.length}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
