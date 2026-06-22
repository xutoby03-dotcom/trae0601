import { useMemo, useState } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import { SandboxBoard } from './SandboxBoard';
import { X, ArrowRight, ArrowLeftRight, Target } from 'lucide-react';
import { diffTypeLabels, diffTypeColors } from '@/utils/diffCalculator';
import type { DiffType, PieceDiff, Resource, Trigger, Role } from '@/types';

interface CompareViewProps {
  onClose: () => void;
}

const coordLabel = (x: number | undefined, y: number | undefined) => {
  if (x === undefined || y === undefined) return '—';
  return `${String.fromCharCode(65 + y)}${x + 1}`;
};

const diffRoleName = (
  roleId: unknown,
  roles: Role[]
): string => {
  if (!roleId || typeof roleId !== 'string') return '未知';
  const role = roles.find((r) => r.id === roleId);
  return role ? `${role.symbol} ${role.name}` : roleId;
};

interface ResourceDelta {
  id: string;
  name: string;
  oldName?: string;
  newName?: string;
  oldAmount?: number;
  newAmount?: number;
  oldUnit?: string;
  newUnit?: string;
  status: 'added' | 'removed' | 'modified';
}

const calcResourceDeltas = (
  oldValue: unknown,
  newValue: unknown
): ResourceDelta[] => {
  const oldArr = (Array.isArray(oldValue) ? (oldValue as Resource[]) : []).filter(
    (r) => r && r.id
  );
  const newArr = (Array.isArray(newValue) ? (newValue as Resource[]) : []).filter(
    (r) => r && r.id
  );
  const oldMap = new Map(oldArr.map((r) => [r.id, r]));
  const newMap = new Map(newArr.map((r) => [r.id, r]));
  const deltas: ResourceDelta[] = [];

  for (const r of oldArr) {
    const match = newMap.get(r.id);
    if (!match) {
      deltas.push({
        id: r.id,
        name: r.name,
        oldName: r.name,
        newName: r.name,
        oldAmount: r.amount,
        oldUnit: r.unit,
        status: 'removed',
      });
    } else if (
      r.amount !== match.amount ||
      r.name !== match.name ||
      r.unit !== match.unit
    ) {
      deltas.push({
        id: r.id,
        name: match.name,
        oldName: r.name,
        newName: match.name,
        oldAmount: r.amount,
        newAmount: match.amount,
        oldUnit: r.unit,
        newUnit: match.unit,
        status: 'modified',
      });
    }
  }
  for (const r of newArr) {
    if (!oldMap.has(r.id)) {
      deltas.push({
        id: r.id,
        name: r.name,
        oldName: r.name,
        newName: r.name,
        newAmount: r.amount,
        newUnit: r.unit,
        status: 'added',
      });
    }
  }
  return deltas;
};

interface TriggerDelta {
  id: string;
  field: 'name' | 'condition' | 'effect';
  label: string;
  oldVal?: string;
  newVal?: string;
  status: 'added' | 'removed' | 'modified';
}

const calcTriggerDeltas = (
  oldValue: unknown,
  newValue: unknown
): TriggerDelta[] => {
  const oldArr = (Array.isArray(oldValue) ? (oldValue as Trigger[]) : []).filter(
    (t) => t && t.id
  );
  const newArr = (Array.isArray(newValue) ? (newValue as Trigger[]) : []).filter(
    (t) => t && t.id
  );
  const oldMap = new Map(oldArr.map((t) => [t.id, t]));
  const newMap = new Map(newArr.map((t) => [t.id, t]));
  const deltas: TriggerDelta[] = [];

  const pushField = (
    id: string,
    field: 'name' | 'condition' | 'effect',
    label: string,
    oldVal: string | undefined,
    newVal: string | undefined,
    status: TriggerDelta['status']
  ) => {
    if (oldVal !== newVal || status !== 'modified') {
      deltas.push({ id, field, label, oldVal, newVal, status });
    }
  };

  for (const t of oldArr) {
    const match = newMap.get(t.id);
    if (!match) {
      const base = t.name || '（未命名触发）';
      pushField(t.id, 'name', `${base} · 名称`, t.name, undefined, 'removed');
      pushField(t.id, 'condition', `${base} · 条件`, t.condition, undefined, 'removed');
      pushField(t.id, 'effect', `${base} · 效果`, t.effect, undefined, 'removed');
    } else {
      const display = t.name || match.name || '（未命名触发）';
      pushField(t.id, 'name', '名称', t.name, match.name, 'modified');
      pushField(
        t.id,
        'condition',
        `${display} · 条件`,
        t.condition,
        match.condition,
        'modified'
      );
      pushField(
        t.id,
        'effect',
        `${display} · 效果`,
        t.effect,
        match.effect,
        'modified'
      );
    }
  }
  for (const t of newArr) {
    if (!oldMap.has(t.id)) {
      const base = t.name || '（未命名触发）';
      pushField(t.id, 'name', `${base} · 名称`, undefined, t.name, 'added');
      pushField(t.id, 'condition', `${base} · 条件`, undefined, t.condition, 'added');
      pushField(t.id, 'effect', `${base} · 效果`, undefined, t.effect, 'added');
    }
  }
  return deltas;
};

export function CompareView({ onClose }: CompareViewProps) {
  const store = useSandboxStore();
  const { leftVersionId, rightVersionId } = store.compare;
  const diffs = store.diffs;
  const versions = store.scene.versions;
  const roles = store.scene.roles;
  const startCompare = useSandboxStore((s) => s.startCompare);

  const [localLeftId, setLocalLeftId] = useState(leftVersionId || '');
  const [localRightId, setLocalRightId] = useState(rightVersionId || '');
  const [highlightPieceId, setHighlightPieceId] = useState<string | null>(null);

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
      if (
        diff.type === 'removed' ||
        diff.type === 'moved' ||
        diff.type === 'role_changed' ||
        diff.type === 'resource_changed' ||
        diff.type === 'trigger_changed' ||
        diff.type === 'notes_changed'
      ) {
        map.set(diff.pieceId, diff.type);
      }
    });
    return map;
  }, [diffs]);

  const rightDiffMap = useMemo(() => {
    const map = new Map<string, DiffType>();
    diffs.forEach((diff) => {
      if (
        diff.type === 'added' ||
        diff.type === 'moved' ||
        diff.type === 'role_changed' ||
        diff.type === 'resource_changed' ||
        diff.type === 'trigger_changed' ||
        diff.type === 'notes_changed'
      ) {
        map.set(diff.pieceId, diff.type);
      }
    });
    return map;
  }, [diffs]);

  const groupedDiffs = useMemo(() => {
    const groups: Record<string, PieceDiff[]> = {};
    diffs.forEach((diff) => {
      if (!groups[diff.type]) groups[diff.type] = [];
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

  const handleDiffClick = (diff: PieceDiff) => {
    setHighlightPieceId((prev) => (prev === diff.pieceId ? null : diff.pieceId));
  };

  const isHighlighted = (pieceId: string) => highlightPieceId === pieceId;

  const renderVersionPicker = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-8 max-w-lg w-full mx-4">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="text-indigo-400" size={24} />
          <h3 className="text-lg font-bold text-white">选择对比版本</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              旧版本（左侧）
            </label>
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
            <label className="block text-sm text-slate-400 mb-2">
              新版本（右侧）
            </label>
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
          {highlightPieceId && (
            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-1">
              <Target size={12} />
              已高亮对应棋子 · 再次点击取消
            </span>
          )}
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
                selectedId={highlightPieceId}
                onSelectPiece={(id) => setHighlightPieceId(id)}
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
                selectedId={highlightPieceId}
                onSelectPiece={(id) => setHighlightPieceId(id)}
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">
                差异汇总 (共 {diffs.length} 处变更 · 点击条目高亮棋子)
              </h3>
              {highlightPieceId && (
                <button
                  onClick={() => setHighlightPieceId(null)}
                  className="text-xs text-slate-400 hover:text-slate-300 px-2 py-0.5 hover:bg-slate-800 rounded"
                >
                  清除高亮
                </button>
              )}
            </div>
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

          <div className="p-3 max-h-56 overflow-y-auto space-y-3">
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
                  <div className="space-y-1.5 ml-2">
                    {items.map((diff) => {
                      const isActive = isHighlighted(diff.pieceId);
                      return (
                        <div
                          key={`${diff.pieceId}-${diff.type}`}
                          onClick={() => handleDiffClick(diff)}
                          className={`text-xs p-2 rounded border cursor-pointer transition-all
                            ${isActive
                              ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30'
                              : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/70 hover:border-slate-600/50'
                            }
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <Target
                              size={12}
                              className={`mt-0.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-200">
                                {diff.pieceName}
                              </div>

                              {diff.type === 'added' && (
                                <div className="mt-1 text-emerald-300">
                                  新增于 {coordLabel(diff.newX, diff.newY)}
                                </div>
                              )}

                              {diff.type === 'removed' && (
                                <div className="mt-1 text-red-300">
                                  从 {coordLabel(diff.oldX, diff.oldY)} 撤掉
                                </div>
                              )}

                              {diff.type === 'moved' && (
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-amber-300">
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                                    {coordLabel(diff.oldX, diff.oldY)}
                                  </span>
                                  <ArrowRight size={12} />
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                                    {coordLabel(diff.newX, diff.newY)}
                                  </span>
                                </div>
                              )}

                              {diff.type === 'role_changed' && (
                                <div className="mt-1 flex items-center flex-wrap gap-1.5 text-indigo-300">
                                  <span className="px-1.5 py-0.5 bg-slate-900/60 rounded border border-slate-700/50">
                                    {diffRoleName(diff.oldValue, roles)}
                                  </span>
                                  <ArrowRight size={12} className="text-indigo-400" />
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/30">
                                    {diffRoleName(diff.newValue, roles)}
                                  </span>
                                </div>
                              )}

                              {diff.type === 'resource_changed' && (
                                <div className="mt-1 space-y-1">
                                  {calcResourceDeltas(diff.oldValue, diff.newValue).map(
                                    (rd) => {
                                      const nameChanged =
                                        rd.status === 'modified' &&
                                        rd.oldName !== rd.newName;

                                      return (
                                        <div
                                          key={rd.id}
                                          className={`rounded px-1.5 py-1
                                            ${rd.status === 'added'
                                              ? 'bg-emerald-500/10 text-emerald-300'
                                              : rd.status === 'removed'
                                              ? 'bg-red-500/10 text-red-300'
                                              : 'bg-cyan-500/10 text-cyan-300'
                                            }
                                          `}
                                        >
                                          {rd.status === 'modified' ? (
                                            <div className="space-y-0.5">
                                              <div className="flex items-center gap-1 text-[11px]">
                                                {nameChanged ? (
                                                  <>
                                                    <span className="text-slate-400 shrink-0">
                                                      名称:
                                                    </span>
                                                    <span className="text-slate-300">
                                                      {rd.oldName}
                                                    </span>
                                                    <ArrowRight size={10} />
                                                    <span className="font-medium">
                                                      {rd.newName}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <span className="font-medium">
                                                    {rd.name}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1 text-[11px]">
                                                <span className="text-slate-400 shrink-0">
                                                  数量:
                                                </span>
                                                <span className="text-slate-300">
                                                  {rd.oldAmount}
                                                  {rd.oldUnit}
                                                </span>
                                                <ArrowRight size={10} />
                                                <span>
                                                  {rd.newAmount}
                                                  {rd.newUnit}
                                                </span>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-start flex-wrap gap-1.5 text-[11px]">
                                              <span className="font-medium">
                                                {rd.status === 'added'
                                                  ? `+ ${rd.name}`
                                                  : `− ${rd.name}`}
                                              </span>
                                              <span className="text-slate-300/80">
                                                {rd.status === 'added'
                                                  ? `${rd.newAmount}${rd.newUnit}`
                                                  : `${rd.oldAmount}${rd.oldUnit}`}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}

                              {diff.type === 'trigger_changed' && (
                                <div className="mt-1 space-y-1">
                                  {calcTriggerDeltas(diff.oldValue, diff.newValue).map(
                                    (td, idx) => {
                                      const prefix =
                                        td.status === 'added'
                                          ? '+ '
                                          : td.status === 'removed'
                                          ? '− '
                                          : '';

                                      return (
                                        <div
                                          key={`${td.id}-${td.field}-${idx}`}
                                          className={`rounded px-1.5 py-0.5 space-y-0.5
                                            ${td.status === 'added'
                                              ? 'bg-emerald-500/10 text-emerald-300'
                                              : td.status === 'removed'
                                              ? 'bg-red-500/10 text-red-300'
                                              : 'bg-purple-500/10 text-purple-300'
                                            }
                                          `}
                                        >
                                          <div className="space-y-0.5">
                                            <div
                                              className={`font-medium ${td.status === 'modified'
                                                ? 'text-purple-200'
                                                : ''
                                                }`}
                                            >
                                              {prefix}
                                              {td.label}
                                            </div>
                                            <div className="flex items-start gap-1 text-[11px]">
                                                  <span className="text-slate-400 shrink-0">
                                                    旧:
                                                  </span>
                                                  <span className="break-all">
                                                    {td.oldVal || '(空)'}
                                                  </span>
                                                </div>
                                                <div className="flex items-start gap-1 text-[11px]">
                                                  <span className="text-slate-400 shrink-0">
                                                    新:
                                                  </span>
                                                  <span className="break-all">
                                                    {td.newVal || '(空)'}
                                                  </span>
                                                </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}

                              {diff.type === 'notes_changed' && (
                                <div className="mt-1 space-y-1 bg-gray-500/10 text-gray-300 rounded px-1.5 py-0.5">
                                  <div className="flex items-start gap-1 text-[11px]">
                                    <span className="text-slate-400 shrink-0">
                                      旧:
                                    </span>
                                    <span className="break-all">
                                      {(diff.oldValue as string) || '(空)'}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-1 text-[11px]">
                                    <span className="text-slate-400 shrink-0">
                                      新:
                                    </span>
                                    <span className="break-all">
                                      {(diff.newValue as string) || '(空)'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
