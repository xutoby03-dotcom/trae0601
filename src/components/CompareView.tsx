import { useMemo, useState } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import { SandboxBoard } from './SandboxBoard';
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { diffTypeLabels, diffTypeColors } from '@/utils/diffCalculator';
import type { DiffType, PieceDiff } from '@/types';

interface CompareViewProps {
  onClose: () => void;
}

export function CompareView({ onClose }: CompareViewProps) {
  const store = useSandboxStore();
  const { leftVersionId, rightVersionId } = store.compare;
  const diffs = store.diffs;
  const versions = store.scene.versions;
  const startCompare = useSandboxStore((s) => s.startCompare);

  const [localLeftId, setLocalLeftId] = useState(leftVersionId || '');
  const [localRightId, setLocalRightId] = useState(rightVersionId || '');

  const leftVersion = versions.find((v) => v.id === (leftVersionId || localLeftId));
  const rightVersion = versions.find((v) => v.id === (rightVersionId || localRightId));

  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => a.stepNumber - b.stepNumber),
    [versions]
  );

  const hasBothVersions = !!leftVersion && !!rightVersion;

  const leftDiffMap = useMemo(() => {
    const map = new Map<string, DiffType>();
    diffs.forEach((diff) => {
      if (diff.type === 'removed' || diff.type === 'moved' || diff.type === 'role_changed' || diff.type === 'resource_changed' || diff.type === 'trigger_changed') {
        map.set(diff.pieceId, diff.type);
      }
    });
    return map;
  }, [diffs]);

  const rightDiffMap = useMemo(() => {
    const map = new Map<string, DiffType>();
    diffs.forEach((diff) => {
      if (diff.type === 'added' || diff.type === 'moved' || diff.type === 'role_changed' || diff.type === 'resource_changed' || diff.type === 'trigger_changed') {
        map.set(diff.pieceId, diff.type);
      }
    });
    return map;
  }, [diffs]);

  const groupedDiffs = useMemo(() => {
    const groups: Record<string, PieceDiff[]> = {};
    diffs.forEach((diff) => {
      if (!groups[diff.type]) {
        groups[diff.type] = [];
      }
      groups[diff.type].push(diff);
    });
    return groups;
  }, [diffs]);

  const diffOrder: DiffType[] = [
    'added',
    'removed',
    'moved',
    'role_changed',
    'resource_changed',
    'trigger_changed',
    'notes_changed',
  ];

  const handleConfirmSelection = () => {
    if (localLeftId && localRightId && localLeftId !== localRightId) {
      startCompare(localLeftId, localRightId);
    }
  };

  const renderVersionPicker = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-8 max-w-lg w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="text-indigo-400" size={24} />
          <h3 className="text-lg font-bold text-white">选择对比版本</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-2">旧版本（左侧）</label>
            <select
              value={localLeftId}
              onChange={(e) => setLocalLeftId(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">-- 请选择 --</option>
              {sortedVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  第{v.stepNumber}步 - {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="text-slate-600 rotate-90" size={20} />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">新版本（右侧）</label>
            <select
              value={localRightId}
              onChange={(e) => setLocalRightId(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">-- 请选择 --</option>
              {sortedVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  第{v.stepNumber}步 - {v.name}
                </option>
              ))}
            </select>
          </div>

          {localLeftId && localRightId && localLeftId === localRightId && (
            <p className="text-xs text-red-400 text-center">请选择两个不同的版本</p>
          )}

          <button
            onClick={handleConfirmSelection}
            disabled={!localLeftId || !localRightId || localLeftId === localRightId}
            className="w-full py-2.5 text-sm font-medium bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeftRight size={16} />
            开始对比
          </button>
        </div>
      </div>
    </div>
  );

  if (!hasBothVersions) {
    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="text-indigo-400" size={20} />
            <h2 className="text-lg font-bold text-white">版本对比</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {renderVersionPicker()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="text-indigo-400" size={20} />
          <h2 className="text-lg font-bold text-white">版本对比</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex gap-4 p-4 overflow-auto">
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-600/50 rounded-full text-sm text-slate-300">
                旧版本: {leftVersion.name}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                第 {leftVersion.stepNumber} 步 · {leftVersion.pieces.length} 个棋子
              </p>
            </div>
            <div className="relative">
              <SandboxBoard
                pieces={leftVersion.pieces}
                selectedId={null}
                onSelectPiece={() => {}}
                diffMap={leftDiffMap}
                readOnly
                cellSize={48}
                gridCols={12}
                gridRows={10}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 text-xs text-slate-400 rounded border border-slate-700/50">
                V{leftVersion.stepNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="text-slate-600" size={32} />
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-sm text-indigo-300">
                新版本: {rightVersion.name}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                第 {rightVersion.stepNumber} 步 · {rightVersion.pieces.length} 个棋子
              </p>
            </div>
            <div className="relative">
              <SandboxBoard
                pieces={rightVersion.pieces}
                selectedId={null}
                onSelectPiece={() => {}}
                diffMap={rightDiffMap}
                readOnly
                cellSize={48}
                gridCols={12}
                gridRows={10}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 text-xs text-indigo-400 rounded border border-indigo-700/50">
                V{rightVersion.stepNumber}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 bg-slate-900/50">
          <div className="p-3 border-b border-slate-700/30">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              差异汇总 (共 {diffs.length} 处变更)
            </h3>
            <div className="flex flex-wrap gap-2">
              {diffOrder.map((type) => {
                const count = groupedDiffs[type]?.length || 0;
                if (count === 0) return null;
                return (
                  <div
                    key={type}
                    className={`px-2 py-1 rounded text-xs font-medium border ${diffTypeColors[type]}`}
                  >
                    {diffTypeLabels[type]}: {count}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 max-h-48 overflow-y-auto space-y-3">
            {diffOrder.map((type) => {
              const items = groupedDiffs[type];
              if (!items || items.length === 0) return null;

              return (
                <div key={type}>
                  <div
                    className={`text-xs font-medium mb-1.5 px-2 py-0.5 inline-block rounded ${diffTypeColors[type]}`}
                  >
                    {diffTypeLabels[type]}
                  </div>
                  <div className="space-y-1 ml-2">
                    {items.map((diff) => (
                      <div
                        key={`${diff.pieceId}-${diff.type}`}
                        className="text-xs text-slate-400 flex items-start gap-2"
                      >
                        <span className="text-slate-500">•</span>
                        <div>
                          <span className="text-slate-300">{diff.pieceName}</span>
                          {diff.type === 'moved' && (
                            <span className="text-amber-400 ml-1">
                              ({String.fromCharCode(65 + (diff.oldY || 0))}
                              {(diff.oldX || 0) + 1} →{' '}
                              {String.fromCharCode(65 + (diff.newY || 0))}
                              {(diff.newX || 0) + 1})
                            </span>
                          )}
                          {diff.type === 'role_changed' && (
                            <span className="text-indigo-400 ml-1">
                              角色已变更
                            </span>
                          )}
                          {diff.type === 'resource_changed' && (
                            <span className="text-cyan-400 ml-1">
                              资源有变化
                            </span>
                          )}
                          {diff.type === 'trigger_changed' && (
                            <span className="text-purple-400 ml-1">
                              触发条件有变化
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
