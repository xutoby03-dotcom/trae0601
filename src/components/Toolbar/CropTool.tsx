import { Check, X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { CropRatio } from '../../types';
import { CROP_RATIOS } from '../../types';

const ratioOptions: { value: CropRatio; label: string }[] = [
  { value: 'free', label: '自由' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: 'custom', label: '自定义' },
];

export const CropTool = () => {
  const {
    cropSettings,
    setCropSettings,
    applyCrop,
    canvasWidth,
    canvasHeight,
    setActiveTool,
  } = useEditorStore();

  const handleRatioChange = (ratio: CropRatio) => {
    if (ratio === 'custom') {
      setCropSettings({ ratio, customWidth: cropSettings.width, customHeight: cropSettings.height });
      return;
    }

    const ratioValue = CROP_RATIOS[ratio];
    if (ratioValue === null) {
      setCropSettings({ ratio });
      return;
    }

    let newWidth = canvasWidth;
    let newHeight = canvasWidth / ratioValue;

    if (newHeight > canvasHeight) {
      newHeight = canvasHeight;
      newWidth = canvasHeight * ratioValue;
    }

    setCropSettings({
      ratio,
      x: (canvasWidth - newWidth) / 2,
      y: (canvasHeight - newHeight) / 2,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleCustomSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (cropSettings.ratio === 'custom') {
      setCropSettings({
        [dimension === 'width' ? 'customWidth' : 'customHeight']: value,
        width: dimension === 'width' ? value : cropSettings.width,
        height: dimension === 'height' ? value : cropSettings.height,
      });
    }
  };

  const handleCancel = () => {
    setCropSettings({ active: false });
    setActiveTool('select');
  };

  if (!cropSettings.active) return null;

  return (
    <div className="w-56 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 shadow-xl">
      <h3 className="text-sm font-medium text-gray-200 mb-3">裁剪设置</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1.5">比例</label>
          <div className="grid grid-cols-3 gap-1.5">
            {ratioOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleRatioChange(opt.value)}
                className={`
                  px-2 py-1.5 text-xs rounded transition-all
                  ${cropSettings.ratio === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {cropSettings.ratio === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">宽度</label>
              <input
                type="number"
                value={Math.round(cropSettings.customWidth)}
                onChange={(e) => handleCustomSizeChange('width', Number(e.target.value))}
                className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">高度</label>
              <input
                type="number"
                value={Math.round(cropSettings.customHeight)}
                onChange={(e) => handleCustomSizeChange('height', Number(e.target.value))}
                className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-xs text-gray-400 block mb-1">X</label>
            <input
              type="number"
              value={Math.round(cropSettings.x)}
              onChange={(e) => setCropSettings({ x: Number(e.target.value) })}
              className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Y</label>
            <input
              type="number"
              value={Math.round(cropSettings.y)}
              onChange={(e) => setCropSettings({ y: Number(e.target.value) })}
              className="w-full bg-gray-700 text-gray-200 text-sm px-2 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          {Math.round(cropSettings.width)} × {Math.round(cropSettings.height)}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-all text-sm"
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            onClick={applyCrop}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-all text-sm"
          >
            <Check className="w-4 h-4" />
            应用
          </button>
        </div>
      </div>
    </div>
  );
};
