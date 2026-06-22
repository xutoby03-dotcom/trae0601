import React, { useState, useCallback, useMemo } from 'react';
import { Save, Trash2, Download, Plus, X, Image, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import { StageVersion } from '@/types';
import { computeDiff, DiffHint } from '@/utils/diff';
import html2canvas from 'html2canvas';

interface ToolbarProps {
  canvasRef: React.RefObject<{ getCanvasElement: () => HTMLDivElement | null } | null>;
}

const Toolbar: React.FC<ToolbarProps> = ({ canvasRef }) => {
  const { versions, currentVersionId, saveVersion, loadVersion, deleteVersion, clearAll, items, clothConfig } =
    useTeaStore();
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<StageVersion | null>(null);

  const captureCanvas = useCallback(async (): Promise<string | undefined> => {
    if (!canvasRef.current) return undefined;
    const canvasElement = canvasRef.current.getCanvasElement();
    if (!canvasElement) return undefined;

    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#FFFBEB',
        scale: 0.5,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('截图失败:', error);
      return undefined;
    }
  }, [canvasRef]);

  const handleSaveVersion = async () => {
    if (!newVersionName.trim()) return;
    setIsSaving(true);

    const thumbnail = await captureCanvas();
    saveVersion(newVersionName.trim(), thumbnail);

    setNewVersionName('');
    setIsSaving(false);
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

  const handleVersionClick = (version: StageVersion) => {
    loadVersion(version.id);
    setPreviewVersion(version);
  };

  const currentVersion = versions.find((v) => v.id === currentVersionId);

  const diffHints = useMemo(() => {
    if (!previewVersion) return [];
    return computeDiff(previewVersion, items, clothConfig);
  }, [previewVersion, items, clothConfig]);

  return (
    <div className="h-14 bg-stone-800 text-stone-100 flex items-center justify-between px-4 border-b border-stone-700">
      <div className="flex items-center gap-3">
        <span className="text-xl">🍵</span>
        <h1 className="text-lg font-medium" style={{ fontFamily: 'serif' }}>
          茶席推演
        </h1>
        <span className="text-xs text-stone-400 ml-2">茶艺备课工具</span>
        {currentVersion && (
          <span className="text-xs text-amber-400 ml-2 flex items-center gap-1">
            <Image size={12} />
            {currentVersion.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => {
              setShowVersionModal(!showVersionModal);
              if (currentVersion) {
                setPreviewVersion(currentVersion);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-stone-700 hover:bg-stone-600 rounded-md transition-colors"
          >
            <Plus size={14} />
            版本管理
            {versions.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-600 rounded-full">
                {versions.length}
              </span>
            )}
          </button>

          {showVersionModal && (
            <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-stone-200 z-50 overflow-hidden animate-slide-up">
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
                    disabled={!newVersionName.trim() || isSaving || items.length === 0}
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    保存
                  </button>
                </div>
                {items.length === 0 && (
                  <p className="text-xs text-stone-400 mt-2">请先布置茶席再保存版本</p>
                )}
              </div>

              {versions.length > 0 && (
                <div className="flex">
                  <div className="w-40 border-r border-stone-200 max-h-72 overflow-y-auto">
                    {versions
                      .slice()
                      .reverse()
                      .map((version) => (
                        <div
                          key={version.id}
                          className={`p-2 cursor-pointer border-b border-stone-100 last:border-b-0 transition-colors ${
                            version.id === currentVersionId
                              ? 'bg-amber-50 border-l-2 border-l-amber-500'
                              : 'hover:bg-stone-50'
                          }`}
                          onClick={() => handleVersionClick(version)}
                          onMouseEnter={() => setPreviewVersion(version)}
                        >
                          <div className="w-full h-16 bg-stone-100 rounded overflow-hidden mb-1.5">
                            {version.thumbnail ? (
                              <img
                                src={version.thumbnail}
                                alt={version.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                                无预览
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-medium text-stone-800 truncate">
                            {version.name}
                          </div>
                          <div className="text-xs text-stone-400">
                            {formatDate(version.createdAt)}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex-1 p-3 bg-stone-50 flex flex-col">
                    <div className="text-xs font-medium text-stone-600 mb-2 flex items-center gap-1">
                      <Image size={12} />
                      预览
                    </div>
                    <div className="flex-1 bg-white rounded-lg border border-stone-200 overflow-hidden flex items-center justify-center min-h-0">
                      {previewVersion?.thumbnail ? (
                        <img
                          src={previewVersion.thumbnail}
                          alt={previewVersion.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-stone-300 text-sm text-center p-4">
                          <Image size={32} className="mx-auto mb-2 opacity-50" />
                          选择版本查看预览
                        </div>
                      )}
                    </div>
                    {previewVersion && (
                      <div className="mt-2 space-y-1">
                        <div className="text-sm font-medium text-stone-800">
                          {previewVersion.name}
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>{previewVersion.items.length} 件器物</span>
                          <span>{formatDate(previewVersion.createdAt)}</span>
                        </div>

                        {diffHints.length > 0 && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md space-y-1">
                            <div className="text-xs font-medium text-amber-800 mb-1 flex items-center gap-1">
                              <RefreshCw size={11} />
                              与当前茶席差异
                            </div>
                            {diffHints.map((hint, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-1.5 text-xs"
                              >
                                {hint.severity === 'added' && (
                                  <ArrowUpRight size={12} className="text-green-600 flex-shrink-0 mt-0.5" />
                                )}
                                {hint.severity === 'removed' && (
                                  <ArrowDownRight size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                {hint.severity === 'changed' && (
                                  <RefreshCw size={11} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={
                                  hint.severity === 'added' ? 'text-green-700' :
                                  hint.severity === 'removed' ? 'text-red-600' :
                                  'text-amber-700'
                                }>
                                  {hint.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {diffHints.length === 0 && previewVersion.id !== currentVersionId && (
                          <div className="mt-1 text-xs text-stone-400 flex items-center gap-1">
                            <RefreshCw size={11} />
                            与当前茶席一致，无差异
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              loadVersion(previewVersion.id);
                              setShowVersionModal(false);
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                          >
                            应用此版本
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除此版本吗？')) {
                                deleteVersion(previewVersion.id);
                                setPreviewVersion(null);
                              }
                            }}
                            className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {versions.length === 0 && (
                <div className="p-8 text-center">
                  <Image size={40} className="mx-auto mb-2 text-stone-300" />
                  <p className="text-sm text-stone-400">暂无保存的版本</p>
                  <p className="text-xs text-stone-400 mt-1">布置好茶席后点击上方保存</p>
                </div>
              )}
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
