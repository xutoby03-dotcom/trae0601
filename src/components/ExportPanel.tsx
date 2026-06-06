import React from 'react';
import { Download, FileImage, FileCode } from 'lucide-react';

interface ExportPanelProps {
  onExportPNG: () => void;
  onExportMusicXML: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onExportPNG,
  onExportMusicXML,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Download className="w-5 h-5" />
        导出乐谱
      </h3>
      <div className="space-y-2">
        <button
          onClick={onExportPNG}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FileImage className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">导出 PNG 图片</div>
            <div className="text-xs text-blue-600">适合分享和打印</div>
          </div>
        </button>
        <button
          onClick={onExportMusicXML}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          <FileCode className="w-5 h-5" />
          <div className="text-left">
            <div className="font-medium">导出 MusicXML</div>
            <div className="text-xs text-green-600">通用乐谱格式，可导入其他软件</div>
          </div>
        </button>
      </div>
    </div>
  );
};
