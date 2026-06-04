import { RotateCcw, Copy, ClipboardPaste } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { FilterSlider } from './FilterSlider';
import { DEFAULT_FILTERS } from '../../types';
import type { FilterSettings } from '../../types';

const filterConfigs: {
  key: keyof FilterSettings;
  label: string;
  min: number;
  max: number;
  color: string;
}[] = [
  { key: 'brightness', label: '亮度', min: -100, max: 100, color: '#fbbf24' },
  { key: 'contrast', label: '对比度', min: -100, max: 100, color: '#60a5fa' },
  { key: 'saturation', label: '饱和度', min: -100, max: 100, color: '#34d399' },
  { key: 'hue', label: '色调', min: -180, max: 180, color: '#a78bfa' },
  { key: 'blur', label: '模糊', min: 0, max: 20, color: '#f472b6' },
  { key: 'sharpen', label: '锐化', min: 0, max: 100, color: '#fb923c' },
  { key: 'grayscale', label: '灰度', min: 0, max: 100, color: '#94a3b8' },
  { key: 'invert', label: '反色', min: 0, max: 100, color: '#ef4444' },
  { key: 'nostalgia', label: '怀旧', min: 0, max: 100, color: '#d97706' },
  { key: 'lomo', label: 'Lomo', min: 0, max: 100, color: '#10b981' },
];

export const FilterPanel = () => {
  const {
    layers,
    selectedLayerId,
    activeLayerFilters,
    filterClipboard,
    updateLayerFilters,
    resetLayerFilters,
    copyLayerFilters,
    pasteLayerFilters,
  } = useEditorStore();

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isImageLayer = selectedLayer?.type === 'image';
  const hasImage = layers.length > 0;
  const canCopy = isImageLayer;
  const canPaste = isImageLayer && filterClipboard !== null;

  const handleFilterChange = (key: keyof FilterSettings, value: number) => {
    if (selectedLayerId && isImageLayer) {
      updateLayerFilters(selectedLayerId, { [key]: value });
    }
  };

  const handleReset = () => {
    if (selectedLayerId && isImageLayer) {
      resetLayerFilters(selectedLayerId);
    }
  };

  const isModified = Object.entries(activeLayerFilters).some(
    ([key, value]) => value !== DEFAULT_FILTERS[key as keyof FilterSettings]
  );

  const clipboardActiveCount = filterClipboard
    ? Object.entries(filterClipboard).filter(([_, value]) => Math.abs(value as number) > 0.1).length
    : 0;

  return (
    <div className="w-72 bg-[#252525] border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-200">滤镜调节</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={copyLayerFilters}
              disabled={!canCopy}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="复制滤镜"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={pasteLayerFilters}
              disabled={!canPaste}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="粘贴滤镜"
            >
              <ClipboardPaste className="w-4 h-4 text-gray-400" />
            </button>
            {isModified && isImageLayer && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded hover:bg-gray-700 transition-colors"
                title="重置滤镜"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {filterClipboard && (
          <div className="bg-[#1a1a1a] rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1 text-gray-500 mb-1">
              <span>剪贴板滤镜</span>
              {clipboardActiveCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded">
                  {clipboardActiveCount} 项
                </span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
              {filterConfigs.slice(0, 10).map((config) => {
                const value = filterClipboard[config.key];
                const isActive = Math.abs(value as number) > 0.1;
                return (
                  <div
                    key={config.key}
                    className={isActive ? 'text-gray-300' : ''}
                    style={isActive ? { color: config.color } : {}}
                  >
                    {config.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!hasImage ? (
          <div className="text-center text-gray-500 text-sm py-8">
            上传图片后可调节滤镜
          </div>
        ) : !isImageLayer ? (
          <div className="text-center text-gray-500 text-sm py-8">
            请选择图片图层调节滤镜
          </div>
        ) : (
          <div className="space-y-4">
            {filterConfigs.map((config) => (
              <FilterSlider
                key={config.key}
                label={config.label}
                value={activeLayerFilters[config.key]}
                min={config.min}
                max={config.max}
                color={config.color}
                onChange={(value) => handleFilterChange(config.key, value)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p>提示：滤镜效果实时预览</p>
          <p>可叠加多种滤镜效果</p>
        </div>
      </div>
    </div>
  );
};
