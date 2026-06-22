import { memo } from 'react';
import type { Piece, Role, DiffType } from '@/types';

interface GamePieceProps {
  piece: Piece;
  role: Role | undefined;
  isSelected: boolean;
  cellSize: number;
  diffType?: DiffType | null;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  draggable?: boolean;
}

const diffBorderColors: Record<string, string> = {
  added: 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 animate-pulse',
  removed: 'ring-2 ring-red-400 ring-offset-2 ring-offset-slate-900 opacity-60',
  moved: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900',
  role_changed: 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900',
  resource_changed: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900',
  trigger_changed: 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900',
};

export const GamePiece = memo(function GamePiece({
  piece,
  role,
  isSelected,
  cellSize,
  diffType,
  onClick,
  onDragStart,
  onDragEnd,
  draggable = true,
}: GamePieceProps) {
  const size = cellSize * 0.75;

  return (
    <div
      className={`absolute flex flex-col items-center justify-center cursor-grab select-none transition-all duration-200
        ${isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105'}
        ${diffType ? diffBorderColors[diffType] || '' : ''}
        ${draggable ? '' : 'cursor-default'}
      `}
      style={{
        left: piece.x * cellSize + cellSize / 2 - size / 2,
        top: piece.y * cellSize + cellSize / 2 - size / 2,
        width: size,
        height: size,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className="relative w-full h-full rounded-md flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: role?.color || '#64748b',
          boxShadow: isSelected
            ? `0 0 20px ${role?.color || '#64748b'}80`
            : '0 4px 6px rgba(0, 0, 0, 0.4)',
          clipPath:
            'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)',
        }}
      >
        <span
          className="text-white font-bold text-lg drop-shadow-md"
          style={{ fontSize: size * 0.35 }}
        >
          {role?.symbol || '?'}
        </span>

        {isSelected && (
          <div className="absolute -inset-1 rounded-md border-2 border-amber-400 animate-ping opacity-50" />
        )}
      </div>

      <div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-1.5 py-0.5 rounded
          bg-slate-800/90 text-slate-200 border border-slate-600/50"
        style={{ fontSize: '0.65rem' }}
      >
        {piece.name}
      </div>

      {diffType === 'moved' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-10">
          ↔
        </div>
      )}
      {diffType === 'added' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-10">
          +
        </div>
      )}
      {diffType === 'removed' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold z-10">
          −
        </div>
      )}
    </div>
  );
});
