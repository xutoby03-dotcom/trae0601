import { useState } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import {
  Save,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Layers,
  GitCompare,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface VersionPanelProps {
  onStartCompare?: (leftId: string, rightId: string) => void;
}

export function VersionPanel({ onStartCompare }: VersionPanelProps) {
  const store = useSandboxStore();
  const versions = store.scene.versions;
  const currentVersionId = store.scene.currentVersionId;

  const [isSaving, setIsSaving] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  const sortedVersions = [...versions].sort((a, b) => b.stepNumber - a.stepNumber);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveVersion = () => {
    if (!newVersionName.trim()) return;
    store.saveVersion(newVersionName.trim(), newVersionDesc.trim());
    setNewVersionName('');
    setNewVersionDesc('');
    setIsSaving(false);
  };

  const handleStartRename = (versionId: string, currentName: string) => {
    setEditingId(versionId);
    setEditName(currentName);
  };

  const handleConfirmRename = () => {
    if (editingId && editName.trim()) {
      store.renameVersion(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleVersionClick = (versionId: string) => {
    if (compareMode) {
      setSelectedCompareIds((prev) => {
        if (prev.includes(versionId)) {
          return prev.filter((id) => id !== versionId);
        }
        if (prev.length >= 2) {
          return [prev[1], versionId];
        }
        return [...prev, versionId];
      });
    } else {
      store.switchVersion(versionId);
    }
  };

  const handleStartCompare = () => {
    if (selectedCompareIds.length === 2) {
      const sorted = selectedCompareIds
        .map((id) => versions.find((v) => v.id === id)!)
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((v) => v.id);

      store.startCompare(sorted[0], sorted[1]);
      setCompareMode(false);
      setSelectedCompareIds([]);

      if (onStartCompare) {
        onStartCompare(sorted[0], sorted[1]);
      }
    }
  };

  return (
    <div className="w-72 bg-slate-800/80 backdrop-blur-sm border-l border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
          <Layers size={16} />
          版本管理
        </h2>

        {!isSaving ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaving(true)}
              className="flex-1 py-2 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 rounded flex items-center justify-center gap-1.5 transition-colors"
              style={{
                clipPath:
                  'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
            >
              <Save size={14} />
              保存版本
            </button>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-2 text-xs font-medium rounded flex items-center justify-center transition-colors
                ${compareMode
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              title="对比版本"
            >
              <GitCompare size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              placeholder="版本名称"
              autoFocus
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
            <input
              type="text"
              value={newVersionDesc}
              onChange={(e) => setNewVersionDesc(e.target.value)}
              placeholder="版本描述（可选）"
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveVersion}
                disabled={!newVersionName.trim()}
                className="flex-1 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded flex items-center justify-center gap-1"
              >
                <Check size={12} />
                确认保存
              </button>
              <button
                onClick={() => {
                  setIsSaving(false);
                  setNewVersionName('');
                  setNewVersionDesc('');
                }}
                className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {compareMode && (
          <div className="mt-3 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded text-xs text-indigo-300">
            <p className="mb-2">
              选择 2 个版本进行对比 (已选 {selectedCompareIds.length}/2)
            </p>
            {selectedCompareIds.length === 2 && (
              <button
                onClick={handleStartCompare}
                className="w-full py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded flex items-center justify-center gap-1 font-medium"
              >
                <GitCompare size={12} />
                开始对比
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedVersions.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            暂无版本
          </div>
        ) : (
          sortedVersions.map((version) => {
            const isCurrent = version.id === currentVersionId;
            const isEditing = editingId === version.id;
            const isSelectedForCompare = selectedCompareIds.includes(version.id);

            return (
              <div
                key={version.id}
                onClick={() => handleVersionClick(version.id)}
                className={`p-3 rounded border cursor-pointer transition-all
                  ${isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50'
                    : isSelectedForCompare
                    ? 'bg-indigo-500/10 border-indigo-500/50'
                    : 'bg-slate-900/30 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-900/50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {version.name}
                    </span>
                  )}

                  {isCurrent && (
                    <span className="shrink-0 ml-2">
                      <CheckCircle2
                        size={14}
                        className="text-amber-400"
                      />
                    </span>
                  )}
                </div>

                {version.description && (
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {version.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={10} />
                    {formatTime(version.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">
                      第 {version.stepNumber} 步
                    </span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">
                      {version.pieces.length} 个棋子
                    </span>
                  </div>
                </div>

                {!compareMode && !isEditing && (
                  <div className="flex gap-1 mt-2 pt-2 border-t border-slate-700/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(version.id, version.name);
                      }}
                      className="flex-1 py-1 text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={10} />
                      重命名
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这个版本吗？')) {
                          store.deleteVersion(version.id);
                        }
                      }}
                      className="flex-1 py-1 text-xs text-slate-400 hover:text-red-400 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={10} />
                      删除
                    </button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-1 mt-2 pt-2 border-t border-slate-700/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmRename();
                      }}
                      className="flex-1 py-1 text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1"
                    >
                      <Check size={10} />
                      确认
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelRename();
                      }}
                      className="flex-1 py-1 text-xs text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1"
                    >
                      <X size={10} />
                      取消
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={() => {
            const pieces = store.getCurrentPieces();
            const defaultRole = store.scene.roles[0];
            if (defaultRole) {
              store.addPiece({
                name: '新棋子',
                roleId: defaultRole.id,
                x: 0,
                y: 0,
                resources: [],
                triggers: [],
                notes: '',
              });
            }
          }}
          className="w-full py-2 text-xs text-slate-400 hover:text-amber-400 border border-dashed border-slate-600/50 hover:border-amber-500/50 rounded flex items-center justify-center gap-1.5"
        >
          <Plus size={12} />
          添加棋子
        </button>
      </div>
    </div>
  );
}
