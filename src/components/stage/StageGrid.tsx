import { useState, useCallback, useMemo } from 'react';
import { Minus, Plus, Columns, Rows, Trash2, Layers } from 'lucide-react';
import { useStageStore } from '@/stores/stageStore';
import { useMembersStore } from '@/stores/membersStore';
import { StageCell } from './StageCell';
import { VOICE_PART_CONFIG, VOICE_PARTS, STAGE_CONFIG } from '@/utils/constants';
import { computeAcoustics } from '@/engine/acousticEngine';

interface DragData {
  type: 'member' | 'stage';
  memberId: string;
  fromRow?: number;
  fromCol?: number;
}

export function StageGrid() {
  const { scheme, setGridSize, placeMember, moveMember, removeMemberAt, clearStage } = useStageStore();
  const members = useMembersStore((s) => s.members);
  const getMember = useMembersStore((s) => s.getMember);

  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const acoustic = useMemo(
    () => computeAcoustics(members, scheme.positions, scheme.gridRows, scheme.gridCols),
    [members, scheme.positions, scheme.gridRows, scheme.gridCols]
  );

  const positionMap = useMemo(() => {
    const map = new Map<string, string | null>();
    scheme.positions.forEach((p) => {
      map.set(`${p.row}-${p.col}`, p.memberId);
    });
    return map;
  }, [scheme.positions]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, row: number, col: number, memberId: string) => {
      const data: DragData = {
        type: 'stage',
        memberId,
        fromRow: row,
        fromCol: col,
      };
      e.dataTransfer.setData('application/json', JSON.stringify(data));
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleCellDragOver = useCallback((e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(`${row}-${col}`);
  }, []);

  const handleCellDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleCellDrop = useCallback(
    (e: React.DragEvent, toRow: number, toCol: number) => {
      e.preventDefault();
      setDragOver(null);

      let raw: string | null = null;
      try {
        raw = e.dataTransfer.getData('application/json');
      } catch {}
      if (!raw) return;

      let data: DragData;
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      if (data.type === 'stage' && data.fromRow !== undefined && data.fromCol !== undefined) {
        if (data.fromRow === toRow && data.fromCol === toCol) return;
        moveMember(data.fromRow, data.fromCol, toRow, toCol);
      } else if (data.type === 'member') {
        placeMember(toRow, toCol, data.memberId);
      }
    },
    [moveMember, placeMember]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
            <Rows className="h-4 w-4 text-white/50" />
            <span className="text-xs text-white/60">排数</span>
            <button
              onClick={() => setGridSize(Math.max(STAGE_CONFIG.MIN_ROWS, scheme.gridRows - 1), scheme.gridCols)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/10"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-amber-400">{scheme.gridRows}</span>
            <button
              onClick={() => setGridSize(Math.min(STAGE_CONFIG.MAX_ROWS, scheme.gridRows + 1), scheme.gridCols)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/10"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
            <Columns className="h-4 w-4 text-white/50" />
            <span className="text-xs text-white/60">列数</span>
            <button
              onClick={() => setGridSize(scheme.gridRows, Math.max(STAGE_CONFIG.MIN_COLS, scheme.gridCols - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/10"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-amber-400">{scheme.gridCols}</span>
            <button
              onClick={() => setGridSize(scheme.gridRows, Math.min(STAGE_CONFIG.MAX_COLS, scheme.gridCols + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-white/70 transition hover:bg-white/10"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap((s) => !s)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              showHeatmap
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            声压热力图
          </button>
          <button
            onClick={() => {
              if (confirm('确定清空整个舞台的所有成员站位吗？')) clearStage();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空舞台
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto rounded-xl border border-amber-900/30 bg-gradient-to-b from-[#1a1020] to-[#0d0a15] p-4 shadow-inner">
        <div
          className="absolute inset-x-8 top-2 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-amber-500/50"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          观众席方向
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>

        <div className="mt-6 flex flex-col gap-2 items-center justify-center min-h-[400px]">
          {Array.from({ length: scheme.gridRows }, (_, rIdx) => {
            const row = scheme.gridRows - 1 - rIdx;
            return (
              <div key={row} className="flex gap-2 w-full max-w-4xl justify-center">
                <div className="w-8 flex items-center justify-center text-[10px] text-white/30 font-mono">
                  第{row + 1}排
                </div>
                {Array.from({ length: scheme.gridCols }, (_, col) => {
                  const key = `${row}-${col}`;
                  const memberId = positionMap.get(key);
                  const member = memberId ? getMember(memberId) ?? null : null;
                  const heatValue = acoustic.heatMatrix[row]?.[col];
                  return (
                    <div key={key} className="flex-1 min-w-[56px] max-w-[96px]">
                      <StageCell
                        row={row}
                        col={col}
                        member={member}
                        isDragOver={dragOver === key}
                        heatValue={heatValue}
                        showHeatmap={showHeatmap}
                        onDragStart={
                          member
                            ? (e) => handleDragStart(e, row, col, member.id)
                            : undefined
                        }
                        onDragEnd={() => {}}
                        onDragOver={(e) => handleCellDragOver(e, row, col)}
                        onDragLeave={handleCellDragLeave}
                        onDrop={(e) => handleCellDrop(e, row, col)}
                        onRemove={member ? () => removeMemberAt(row, col) : undefined}
                      />
                    </div>
                  );
                })}
                <div className="w-8 flex items-center justify-center text-[10px] text-white/30 font-mono">
                  第{row + 1}排
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-white/5 pt-4">
          {VOICE_PARTS.map((part) => {
            const cfg = VOICE_PART_CONFIG[part];
            const count = scheme.positions.filter(
              (p) => p.memberId && getMember(p.memberId)?.voicePart === part
            ).length;
            return (
              <div key={part} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: cfg.color }}
                >
                  {cfg.shortLabel}
                </span>
                <span className="text-xs text-white/70">{cfg.label}</span>
                <span className="text-xs font-bold" style={{ color: cfg.color }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
