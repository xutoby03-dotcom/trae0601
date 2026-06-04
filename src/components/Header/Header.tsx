import { Upload, Download, Layers, Settings, Image as ImageIcon, RotateCcw, RotateCw } from 'lucide-react';
import { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface HeaderProps {
  onExport: () => void;
  onBatch: () => void;
}

export const Header = ({ onExport, onBatch }: HeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { layers, uploadImage, selectedLayerId, undo, redo } = useEditorStore();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith('image/')) {
      await uploadImage(file);
    }
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
    <header className="h-12 bg-[#252525] border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Photo Editor</span>
        </div>
        
        <div className="h-5 w-px bg-gray-700 mx-2" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
          >
            <Upload className="w-4 h-4" />
            打开
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        <div className="h-5 w-px bg-gray-700 mx-2" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!selectedLayerId}
            className="p-1.5 text-gray-300 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="撤销 (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!selectedLayerId}
            className="p-1.5 text-gray-300 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="重做 (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-700 mx-2" />

        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">{layers.length} 个图层</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onBatch}
          disabled={!hasImage}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Settings className="w-4 h-4" />
          批量处理
        </button>
        <button
          onClick={onExport}
          disabled={!hasImage}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>
    </header>
  );
};
