import { X, Download } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { imageDataToCanvas, canvasToBlob, downloadBlob } from '../../utils/canvasUtils';

interface ExportDialogProps {
  onClose: () => void;
}

const formatOptions = [
  { value: 'image/png', label: 'PNG', extension: 'png' },
  { value: 'image/jpeg', label: 'JPG', extension: 'jpg' },
  { value: 'image/webp', label: 'WebP', extension: 'webp' },
];

export const ExportDialog = ({ onClose }: ExportDialogProps) => {
  const {
    getCompositeImageData,
    canvasWidth,
    canvasHeight,
    exportSettings,
    setExportSettings,
    layers,
  } = useEditorStore();

  const handleExport = async () => {
    const compositeData = getCompositeImageData();
    if (!compositeData) return;

    const canvas = imageDataToCanvas(compositeData);
    const blob = await canvasToBlob(canvas, exportSettings.format, exportSettings.quality);
    
    const formatInfo = formatOptions.find((f) => f.value === exportSettings.format);
    const filename = `${exportSettings.filename}.${formatInfo?.extension || 'png'}`;
    
    downloadBlob(blob, filename);
    onClose();
  };

  const hasImage = layers.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-lg shadow-2xl w-96 border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-200">导出图片</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">文件名</label>
            <input
              type="text"
              value={exportSettings.filename}
              onChange={(e) => setExportSettings({ filename: e.target.value })}
              className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">格式</label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportSettings({ format: format.value as any })}
                  className={`px-3 py-2 rounded text-sm transition-all ${
                    exportSettings.format === format.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">
              质量: {Math.round(exportSettings.quality * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={exportSettings.quality}
              onChange={(e) => setExportSettings({ quality: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
            <p className="text-sm text-gray-400">
              输出尺寸: <span className="text-gray-200 font-mono">{canvasWidth} × {canvasHeight}</span>
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={!hasImage}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载
          </button>
        </div>
      </div>
    </div>
  );
};
