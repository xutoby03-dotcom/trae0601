import type { Piece, PieceDiff, Resource, Trigger } from '@/types';

const arraysEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export const calculatePieceDiffs = (
  oldPieces: Piece[],
  newPieces: Piece[]
): PieceDiff[] => {
  const diffs: PieceDiff[] = [];

  const oldPieceMap = new Map(oldPieces.map((p) => [p.id, p]));
  const newPieceMap = new Map(newPieces.map((p) => [p.id, p]));

  for (const piece of newPieces) {
    if (!oldPieceMap.has(piece.id)) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'added',
        newValue: piece,
        newX: piece.x,
        newY: piece.y,
      });
    }
  }

  for (const piece of oldPieces) {
    if (!newPieceMap.has(piece.id)) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'removed',
        oldValue: piece,
        oldX: piece.x,
        oldY: piece.y,
      });
    }
  }

  for (const piece of newPieces) {
    const oldPiece = oldPieceMap.get(piece.id);
    if (!oldPiece) continue;

    if (piece.x !== oldPiece.x || piece.y !== oldPiece.y) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'moved',
        oldX: oldPiece.x,
        oldY: oldPiece.y,
        newX: piece.x,
        newY: piece.y,
        oldValue: { x: oldPiece.x, y: oldPiece.y },
        newValue: { x: piece.x, y: piece.y },
      });
    }

    if (piece.roleId !== oldPiece.roleId) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'role_changed',
        oldValue: oldPiece.roleId,
        newValue: piece.roleId,
      });
    }

    if (!arraysEqual<Resource>(piece.resources, oldPiece.resources)) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'resource_changed',
        oldValue: oldPiece.resources,
        newValue: piece.resources,
      });
    }

    if (!arraysEqual<Trigger>(piece.triggers, oldPiece.triggers)) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'trigger_changed',
        oldValue: oldPiece.triggers,
        newValue: piece.triggers,
      });
    }

    if (piece.notes !== oldPiece.notes) {
      diffs.push({
        pieceId: piece.id,
        pieceName: piece.name,
        type: 'notes_changed',
        oldValue: oldPiece.notes,
        newValue: piece.notes,
      });
    }
  }

  return diffs;
};

export const diffTypeLabels: Record<string, string> = {
  added: '新增',
  removed: '撤掉',
  moved: '位置移动',
  role_changed: '角色变更',
  resource_changed: '资源变化',
  trigger_changed: '条件变化',
  notes_changed: '备注变更',
};

export const diffTypeColors: Record<string, string> = {
  added: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
  removed: 'text-red-400 bg-red-500/20 border-red-500/50',
  moved: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
  role_changed: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/50',
  resource_changed: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
  trigger_changed: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
  notes_changed: 'text-gray-400 bg-gray-500/20 border-gray-500/50',
};
