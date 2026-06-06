import { MousePointer2, Columns, Rows, PaintBucket, Undo2, Redo2, Trash2, Download, Share2, Save } from 'lucide-react';
import { useCanvasStore, Tool } from '../../store/useStore';
import { exportToPNG, generateThumbnail } from '../../utils/exportPNG';
import { saveArtwork } from '../../utils/db';
import { useState } from 'react';

const tools: { id: Tool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'pixel', icon: MousePointer2, label: '单格绘制' },
  { id: 'column', icon: Columns, label: '整列填充' },
  { id: 'row', icon: Rows, label: '整行填充' },
  { id: 'bucket', icon: PaintBucket, label: '油漆桶' },
];

export const Toolbar = () => {
  const { 
    currentTool, 
    setCurrentTool, 
    grid, 
    undo, 
    redo, 
    clearCanvas,
    historyIndex,
    history
  } = useCanvasStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleExport = () => {
    exportToPNG(grid, `emoji-art-${Date.now()}.png`);
  };

  const handleSave = async () => {
    try {
      const thumbnail = generateThumbnail(grid);
      await saveArtwork({
        title: `作品 ${new Date().toLocaleDateString()}`,
        grid,
        thumbnail,
      });
      setSaveMessage('✅ 保存成功！');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('❌ 保存失败');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const handleShare = () => {
    const mockId = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/gallery/${mockId}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('链接已复制到剪贴板！');
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-4 border border-purple-100">
        <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
          🛠️ 绘图工具
        </h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentTool(id)}
              className={`
                flex flex-col items-center justify-center gap-1 p-3 rounded-xl
                transition-all duration-200
                ${currentTool === id 
                  ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }
              `}
              title={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 mb-4">
          <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
            ⚡ 操作
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-sm">撤销</span>
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Redo2 className="w-4 h-4" />
              <span className="text-sm">重做</span>
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">清空</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">保存</span>
            </button>
          </div>
          {saveMessage && (
            <p className="mt-2 text-center text-sm text-green-600 animate-pulse">{saveMessage}</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
            📤 导出分享
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">导出 PNG</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">分享</span>
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎉 分享作品</h3>
            <p className="text-gray-600 mb-4">复制链接分享给朋友吧！</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                复制
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
};
