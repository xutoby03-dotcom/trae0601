import { useMemo } from 'react';
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

  const leftVersion = versions.find((v) => v.id === leftVersionId);
  const rightVersion = versions.find((v) => v.id === rightVersionId);

  const leftDiffMap = useMemo(() => {
    const map = new Map<string, DiffType>();
    diffs.forEach((diff) => {
      if (diff.type === 'removed' || diff.type === 'moved' || diff.type === 'role_changed' || diff.type === 'resource_changed' || diff.type === 'trigger_changed') {
        map.set(diff.pieceId, diff.type);
      }
      if (diff.type === 'added') {
        // 新增的在左边不显示
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

  if (!leftVersion || !rightVersion) {
    return null;
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
