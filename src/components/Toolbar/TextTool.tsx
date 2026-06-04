import { useEditorStore } from '../../store/editorStore';
import { FONT_FAMILIES } from '../../types';
import type { TextLayer } from '../../types';

export const TextTool = () => {
  const { selectedLayerId, layers, updateTextLayer, getSelectedLayer } = useEditorStore();
  
  const selectedLayer = getSelectedLayer() as TextLayer | null;
  
  if (!selectedLayer || selectedLayer.type !== 'text') return null;

  return (
    <div className="w-56 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-3">文字设置</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">内容</label>
          <input
            type="text"
            value={selectedLayer.content}
            onChange={(e) => updateTextLayer(selectedLayerId!, { content: e.target.value })}
            className="w-full bg-gray-700 text-gray-200 text-sm px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">字体</label>
          <select
            value={selectedLayer.fontFamily}
            onChange={(e) => updateTextLayer(selectedLayerId!, { fontFamily: e.target.value })}
            className="w-full bg-gray-700 text-gray-200 text-sm px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">
            大小: {selectedLayer.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="200"
            value={selectedLayer.fontSize}
            onChange={(e) => updateTextLayer(selectedLayerId!, { fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedLayer.color}
                onChange={(e) => updateTextLayer(selectedLayerId!, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={selectedLayer.color}
                onChange={(e) => updateTextLayer(selectedLayerId!, { color: e.target.value })}
                className="flex-1 bg-gray-700 text-gray-200 text-xs px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">描边色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedLayer.strokeColor}
                onChange={(e) => updateTextLayer(selectedLayerId!, { strokeColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={selectedLayer.strokeColor}
                onChange={(e) => updateTextLayer(selectedLayerId!, { strokeColor: e.target.value })}
                className="flex-1 bg-gray-700 text-gray-200 text-xs px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">
            描边宽度: {selectedLayer.strokeWidth}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={selectedLayer.strokeWidth}
            onChange={(e) => updateTextLayer(selectedLayerId!, { strokeWidth: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">
            阴影模糊: {selectedLayer.shadowBlur}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={selectedLayer.shadowBlur}
            onChange={(e) => updateTextLayer(selectedLayerId!, { shadowBlur: Number(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1.5">阴影颜色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedLayer.shadowColor}
              onChange={(e) => updateTextLayer(selectedLayerId!, { shadowColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <input
              type="text"
              value={selectedLayer.shadowColor}
              onChange={(e) => updateTextLayer(selectedLayerId!, { shadowColor: e.target.value })}
              className="flex-1 bg-gray-700 text-gray-200 text-xs px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">阴影X偏移</label>
            <input
              type="number"
              value={selectedLayer.shadowOffsetX}
              onChange={(e) => updateTextLayer(selectedLayerId!, { shadowOffsetX: Number(e.target.value) })}
              className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">阴影Y偏移</label>
            <input
              type="number"
              value={selectedLayer.shadowOffsetY}
              onChange={(e) => updateTextLayer(selectedLayerId!, { shadowOffsetY: Number(e.target.value) })}
              className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
