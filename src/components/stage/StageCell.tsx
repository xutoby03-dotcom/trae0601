import { memo } from 'react';
import { X } from 'lucide-react';
import type { Member } from '@/types';
import { VOICE_PART_CONFIG } from '@/utils/constants';
import { getInitial } from '@/utils/helpers';

interface StageCellProps {
  row: number;
  col: number;
  member: Member | null;
  isDragOver: boolean;
  isHighlighted?: boolean;
  highlightColor?: string;
  heatValue?: number;
  showHeatmap?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onRemove?: () => void;
  onClick?: () => void;
}

export const StageCell = memo(function StageCell({
  row,
  col,
  member,
  isDragOver,
  isHighlighted,
  highlightColor,
  heatValue,
  showHeatmap,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onClick,
}: StageCellProps) {
  const partConfig = member ? VOICE_PART_CONFIG[member.voicePart] : null;
  const label = `R${row + 1}C${col + 1}`;

  const heatBg =
    showHeatmap && heatValue !== undefined
      ? `rgba(255, ${Math.max(50, 200 - heatValue * 12)}, ${Math.max(30, 100 - heatValue * 6)}, ${Math.min(0.7, heatValue / 20)})`
      : 'transparent';

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      style={{
        boxShadow: isDragOver
          ? '0 0 0 2px #D4AF37, 0 0 20px rgba(212, 175, 55, 0.4) inset'
          : isHighlighted
          ? `0 0 0 2px ${highlightColor || '#ef4444'}, 0 0 16px ${highlightColor || 'rgba(239, 68, 68, 0.4)'} inset`
          : undefined,
      }}
      className={`group relative flex aspect-[4/5] w-full cursor-grab flex-col items-center justify-center rounded-lg border transition-all duration-200
        ${member
          ? `border-[${partConfig?.borderColor}] bg-[${partConfig?.bgColor}] hover:scale-[1.03] hover:shadow-xl active:cursor-grabbing`
          : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
        }
        ${isDragOver ? 'scale-[1.02] bg-amber-500/10' : ''}
      `}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{ backgroundColor: heatBg }}
      />

      {member ? (
        <>
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="relative z-10 flex flex-col items-center gap-1 px-1 py-2"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-bold shadow-lg sm:h-12 sm:w-12 sm:text-xl"
              style={{
                borderColor: partConfig!.color,
                backgroundColor: `linear-gradient(135deg, ${partConfig!.color}33, ${partConfig!.color}11)`,
                color: partConfig!.textColor,
              }}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitial(member.name)
              )}
            </div>
            <div className="flex items-center gap-1">
              <span
                className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold"
                style={{ backgroundColor: partConfig!.color, color: '#fff' }}
              >
                {partConfig!.shortLabel}
              </span>
              <span className="text-[11px] font-medium text-white/90 drop-shadow sm:text-xs">
                {member.name.length > 3 ? member.name.slice(0, 3) : member.name}
              </span>
            </div>
          </div>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-1 top-1 z-20 flex h-5 w-5 scale-75 items-center justify-center rounded-full bg-rose-600/80 text-white opacity-0 transition hover:bg-rose-500 group-hover:scale-100 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-0.5 text-white/30">
          <span className="text-xl font-light opacity-50">+</span>
          <span className="text-[9px] font-mono tracking-wide">{label}</span>
        </div>
      )}
    </div>
  );
});
