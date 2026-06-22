import React, { useState } from 'react';
import { Save, Trash2, Download, RotateCcw, RotateCw, Plus, X } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';

const Toolbar: React.FC = () => {
  const { versions, currentVersionId, saveVersion, loadVersion, deleteVersion, clearAll } =
    useTeaStore();
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  const handleSaveVersion = () => {
    if (!newVersionName.trim()) return;
    saveVersion(newVersionName.trim());
    setNewVersionName('');
    setShowVersionModal(false);
  };

  const handleExport = () => {
    alert('导出功能开发中...');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-14 bg-stone-800 text-stone-100 flex items-center justify-between px-4 border-b border-stone-700">
      <div className="flex items-center gap-3">
        <span className="text-xl">🍵</span>
        <h1 className="text-lg font-medium" style={{ fontFamily: 'serif' }}>
          茶席推演
        </h1>
        <span className="text-xs text-stone-400 ml-2">茶艺备课工具</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowVersionModal(!showVersionModal)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-600 rounded-md transition-colors"
          >
            <Plus size={14} />
            版本管理
          </button>

          {showVersionModal && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden">
              <div className="p-3 border-b border-stone-200 bg-stone-50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="输入版本名称..."
                    className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-amber-500 text-stone-800"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveVersion()}
                  />
                  <button
                    onClick={handleSaveVersion}
                    disabled={!newVersionName.trim()}
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {versions.length === 0 ? (
                  <div className="p-4 text-center text-stone-400 text-sm">
                    暂无保存的版本
                  </div>
                ) : (
                  <div className="py-1">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className={`flex items-center justify-between px-3 py-2 hover:bg-stone-50 cursor-pointer ${
                          version.id === currentVersionId ? 'bg-amber-50' : ''
                        }`}
                        onClick={() => loadVersion(version.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-stone-800 truncate">
                            {version.name}
                          </div>
                          <div className="text-xs text-stone-500">
                            {formatDate(version.createdAt)} · {version.items.length} 件器物
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVersion(version.id);
                          }}
                          className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-stone-600 mx-1" />

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-600 rounded-md transition-colors"
        >
          <Download size={14} />
          导出
        </button>

        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          <Trash2 size={14} />
          清空
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
