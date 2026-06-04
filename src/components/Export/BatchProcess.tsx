import { useState, useRef, useMemo } from 'react';
import { X, Upload, Download, Loader2, Sliders } from 'lucide-react';
import JSZip from 'jszip';
import { useEditorStore } from '../../store/editorStore';
import { loadImage, getImageDataFromImage, imageDataToCanvas, canvasToBlob, downloadBlob } from '../../utils/canvasUtils';
import { applyAllFilters } from '../../utils/filterAlgorithms';
import type { FilterSettings } from '../../types';
import { DEFAULT_FILTERS } from '../../types';

interface BatchProcessProps {
  onClose: () => void;
}

interface BatchFile {
  file: File;
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}

const formatOptions = [
  { value: 'image/png', label: 'PNG', extension: 'png' },
  { value: 'image/jpeg', label: 'JPG', extension: 'jpg' },
  { value: 'image/webp', label: 'WebP', extension: 'webp' },
];

export const BatchProcess = ({ onClose }: BatchProcessProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(0.9);

  const { layers, selectedLayerId, getSelectedLayer } = useEditorStore();

  const batchFilters = useMemo((): FilterSettings => {
    const selected = getSelectedLayer();
    if (selected && selected.type === 'image' && selected.filters) {
      return selected.filters;
    }
    const imageLayer = layers.find((l) => l.type === 'image');
    if (imageLayer && 'filters' in imageLayer) {
      return imageLayer.filters;
    }
    return DEFAULT_FILTERS;
  }, [layers, selectedLayerId, getSelectedLayer]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(batchFilters).filter(([_, value]) => Math.abs(value as number) > 0.1).length;
  }, [batchFilters]);

  const filterNames: Record<keyof FilterSettings, string> = {
    brightness: '亮度',
    contrast: '对比度',
    saturation: '饱和度',
    hue: '色调',
    blur: '模糊',
    sharpen: '锐化',
    grayscale: '灰度',
    invert: '反色',
    nostalgia: '怀旧',
    lomo: 'Lomo',
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const newFiles: BatchFile[] = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        name: file.name,
        status: 'pending' as const,
        progress: 0,
      }));
    
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processImage = async (
    file: File,
    filters: FilterSettings
  ): Promise<Blob> => {
    const img = await loadImage(file);
    const imageData = getImageDataFromImage(img);
    const filteredData = applyAllFilters(imageData, filters);
    const canvas = imageDataToCanvas(filteredData);
    return canvasToBlob(canvas, format, quality);
  };

  const handleBatchProcess = async () => {
    if (files.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const zip = new JSZip();
    const formatInfo = formatOptions.find((f) => f.value === format);
    const ext = formatInfo?.extension || 'png';

    try {
      for (let i = 0; i < files.length; i++) {
        const batchFile = files[i];
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'processing', progress: 0 } : f
          )
        );

        try {
          const blob = await processImage(batchFile.file, batchFilters);
          
          const baseName = batchFile.name.replace(/\.[^/.]+$/, '');
          zip.file(`${baseName}_processed.${ext}`, blob);

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'done', progress: 100 } : f
            )
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', progress: 0 } : f
            )
          );
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'processed_images.zip');
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-lg shadow-2xl w-[500px] max-h-[80vh] flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-200">批量处理</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-500 hover:bg-white/5 transition-all mb-4"
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 mb-1">点击或拖拽添加图片</p>
            <p className="text-gray-500 text-sm">支持 JPG、PNG、WebP 格式</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {files.map((batchFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#252525] rounded-lg p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{batchFile.name}</p>
                  {batchFile.status === 'processing' && (
                    <div className="h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${batchFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {batchFile.status === 'done' && (
                    <span className="text-green-400 text-xs">完成</span>
                  )}
                  {batchFile.status === 'error' && (
                    <span className="text-red-400 text-xs">错误</span>
                  )}
                  {batchFile.status === 'pending' && !isProcessing && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">输出格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                质量: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300 font-medium">
                批量滤镜参数
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                    {activeFilterCount} 项生效
                  </span>
                )}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {(Object.keys(batchFilters) as Array<keyof FilterSettings>).map((key) => {
                const value = batchFilters[key] as number;
                const isActive = Math.abs(value) > 0.1;
                return (
                  <div
                    key={key}
                    className={`flex justify-between ${
                      isActive ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    <span>{filterNames[key]}</span>
                    <span className={isActive ? 'text-blue-400 font-mono' : ''}>
                      {value > 0 ? '+' : ''}{value.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {activeFilterCount === 0 && (
              <p className="text-xs text-gray-500 mt-2 italic">
                当前无滤镜效果，将输出原图
              </p>
            )}
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
            onClick={handleBatchProcess}
            disabled={files.length === 0 || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                开始处理 ({files.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
