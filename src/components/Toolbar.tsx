import { useState } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import {
  Map,
  Save,
  GitCompare,
  Play,
  X,
  Edit2,
  Check,
  Settings,
  Layers,
} from 'lucide-react';

interface ToolbarProps {
  onOpenCompare?: () => void;
}

export function Toolbar({ onOpenCompare }: ToolbarProps) {
  const store = useSandboxStore();
  const sceneName = store.scene.name;
  const currentVersion = store.getCurrentVersion();
  const isPlaybackMode = store.isPlaybackMode;
  const versionsCount = store.scene.versions.length;

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(sceneName);

  const handleStartEdit = () => {
    setEditName(sceneName);
    setIsEditingName(true);
  };

  const handleConfirmEdit = () => {
    if (editName.trim()) {
      store.setSceneName(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditName(sceneName);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <header className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(245, 158, 11, 0.1) 2px, rgba(245, 158, 11, 0.1) 4px)',
        }}
      />

      <div className="flex items-center gap-3 relative z-10">
        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <Map size={20} className="text-amber-400" />
        </div>
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-slate-800 border border-amber-500/50 rounded px-2 py-0.5 text-lg font-bold text-amber-400 focus:outline-none"
              />
              <button
                onClick={handleConfirmEdit}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-slate-400 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <h1
              className="text-lg font-bold text-amber-400 cursor-pointer hover:text-amber-300 flex items-center gap-2"
              onClick={handleStartEdit}
              title="点击编辑场景名称"
            >
              {sceneName}
              <Edit2 size={12} className="opacity-50" />
            </h1>
          )}
          {currentVersion && (
            <p className="text-xs text-slate-500">
              当前版本: {currentVersion.name} · 第 {currentVersion.stepNumber} 步
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        {!isPlaybackMode ? (
          <>
            <button
              onClick={() => {
                const name = prompt('版本名称:', `版本 ${versionsCount + 1}`);
                if (name) {
                  const desc = prompt('版本描述（可选）:') || '';
                  store.saveVersion(name, desc);
                }
              }}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 rounded flex items-center gap-1.5 transition-colors"
              style={{
                clipPath:
                  'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
              }}
            >
              <Save size={14} />
              保存版本
            </button>

            <button
              onClick={onOpenCompare}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded flex items-center gap-1.5 transition-colors"
            >
              <GitCompare size={14} />
              版本对比
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            <button
              onClick={() => store.togglePlaybackMode()}
              disabled={versionsCount < 2}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded flex items-center gap-1.5 transition-colors"
              title={versionsCount < 2 ? '至少需要2个版本才能回放' : '进入回放模式'}
            >
              <Play size={14} />
              推演回放
            </button>
          </>
        ) : (
          <button
            onClick={() => store.togglePlaybackMode()}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded flex items-center gap-1.5 transition-colors"
          >
            <X size={14} />
            退出回放
          </button>
        )}

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">
          <Layers size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400">
            {versionsCount} 个版本
          </span>
        </div>

        <button
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="设置"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
