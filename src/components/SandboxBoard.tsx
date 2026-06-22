import { useRef, useState, useCallback, useMemo } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import { GamePiece } from './GamePiece';
import type { Piece, DiffType } from '@/types';

interface SandboxBoardProps {
  pieces?: Piece[];
  selectedId?: string | null;
  onSelectPiece?: (id: string | null) => void;
  onMovePiece?: (id: string, x: number, y: number) => void;
  diffMap?: Map<string, DiffType>;
  readOnly?: boolean;
  cellSize?: number;
  gridCols?: number;
  gridRows?: number;
  showCoordinates?: boolean;
}

export function SandboxBoard({
  pieces: externalPieces,
  selectedId: externalSelectedId,
  onSelectPiece: externalOnSelect,
  onMovePiece: externalOnMove,
  diffMap,
  readOnly = false,
  cellSize = 60,
  gridCols = 12,
  gridRows = 10,
  showCoordinates = true,
}: SandboxBoardProps) {
  const roles = useSandboxStore((s) => s.scene.roles);
  const selectedPieceIdStore = useSandboxStore((s) => s.selectedPieceId);
  const getCurrentPieces = useSandboxStore((s) => s.getCurrentPieces);
  const selectPiece = useSandboxStore((s) => s.selectPiece);
  const movePiece = useSandboxStore((s) => s.movePiece);

  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingPieceId, setDraggingPieceId] = useState<string | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);

  const pieces = externalPieces ?? getCurrentPieces();
  const selectedPieceId = externalSelectedId ?? selectedPieceIdStore;

  const roleMap = useMemo(() => {
    const map = new Map(roles.map((r) => [r.id, r]));
    return map;
  }, [roles]);

  const getRoleById = useCallback(
    (roleId: string) => roleMap.get(roleId),
    [roleMap]
  );

  const handleBoardClick = useCallback(() => {
    if (readOnly) return;
    if (externalOnSelect) {
      externalOnSelect(null);
    } else {
      selectPiece(null);
    }
  }, [selectPiece, externalOnSelect, readOnly]);

  const handlePieceClick = useCallback(
    (pieceId: string) => {
      if (externalOnSelect) {
        externalOnSelect(pieceId);
      } else {
        selectPiece(pieceId);
      }
    },
    [selectPiece, externalOnSelect]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, pieceId: string) => {
      if (readOnly) {
        e.preventDefault();
        return;
      }
      setDraggingPieceId(pieceId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', pieceId);
    },
    [readOnly]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingPieceId(null);
    setGhostPosition(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      const clampedX = Math.max(0, Math.min(gridCols - 1, x));
      const clampedY = Math.max(0, Math.min(gridRows - 1, y));

      setGhostPosition({ x: clampedX, y: clampedY });
    },
    [cellSize, gridCols, gridRows, readOnly]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      e.preventDefault();

      const pieceId = e.dataTransfer.getData('text/plain');
      if (!pieceId) return;

      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);

      const clampedX = Math.max(0, Math.min(gridCols - 1, x));
      const clampedY = Math.max(0, Math.min(gridRows - 1, y));

      if (externalOnMove) {
        externalOnMove(pieceId, clampedX, clampedY);
      } else {
        movePiece(pieceId, clampedX, clampedY);
      }

      setDraggingPieceId(null);
      setGhostPosition(null);
    },
    [movePiece, cellSize, gridCols, gridRows, externalOnMove, readOnly]
  );

  const boardWidth = cellSize * gridCols;
  const boardHeight = cellSize * gridRows;

  return (
    <div className="relative">
      {showCoordinates && (
        <div
          className="absolute -top-6 left-0 flex"
          style={{ width: boardWidth }}
        >
          {Array.from({ length: gridCols }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-xs text-slate-500 font-mono"
              style={{ width: cellSize }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {showCoordinates && (
        <div className="absolute -left-6 top-0 flex flex-col">
          {Array.from({ length: gridRows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-xs text-slate-500 font-mono"
              style={{ height: cellSize, width: 20 }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
      )}

      <div
        ref={boardRef}
        className="relative rounded-lg overflow-hidden border border-slate-700/50"
        style={{
          width: boardWidth,
          height: boardHeight,
          background: `
            linear-gradient(135deg, #1e293b 0%, #0f172a 100%)
          `,
          boxShadow:
            'inset 0 0 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 0, 0, 0.3)',
        }}
        onClick={handleBoardClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {ghostPosition && draggingPieceId && (
          <div
            className="absolute border-2 border-dashed border-amber-400/60 rounded bg-amber-400/10 pointer-events-none transition-none"
            style={{
              left: ghostPosition.x * cellSize,
              top: ghostPosition.y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          />
        )}

        {pieces.map((piece) => (
          <GamePiece
            key={piece.id}
            piece={piece}
            role={getRoleById(piece.roleId)}
            isSelected={selectedPieceId === piece.id}
            cellSize={cellSize}
            diffType={diffMap?.get(piece.id) || null}
            onClick={() => handlePieceClick(piece.id)}
            onDragStart={(e) => handleDragStart(e, piece.id)}
            onDragEnd={handleDragEnd}
            draggable={!readOnly}
          />
        ))}

        <div className="absolute bottom-2 right-2 text-xs text-slate-600 font-mono pointer-events-none">
          {gridCols}×{gridRows}
        </div>
      </div>
    </div>
  );
}
