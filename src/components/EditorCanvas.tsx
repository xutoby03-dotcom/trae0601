import React, { useRef, useEffect, useCallback } from 'react';
import { Note } from '../types/score';
import {
  drawNote,
  drawLyrics,
  drawMeasureBar,
  drawStaffLine,
  calculateNotePositions,
  MEASURE_PADDING,
  NOTE_WIDTH_BY_DURATION,
  NoteRenderInfo,
} from '../utils/renderUtils';
import { getNoteAtPosition, flattenAllNotes } from '../utils/musicUtils';

interface EditorCanvasProps {
  measures: { id: string; notes: Note[] }[];
  selectedNoteId: string | null;
  currentPlayPosition: number;
  isPlaying: boolean;
  onNoteClick: (noteId: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  measures,
  selectedNoteId,
  currentPlayPosition,
  isPlaying,
  onNoteClick,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const notePositionsRef = useRef<NoteRenderInfo[]>([]);

  const getPlayingNoteId = useCallback(() => {
    const allNotes = flattenAllNotes(measures);
    const note = getNoteAtPosition(allNotes, currentPlayPosition);
    return note?.id || null;
  }, [measures, currentPlayPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const allNotes = flattenAllNotes(measures);
    let totalWidth = MEASURE_PADDING * 2 + 100;
    allNotes.forEach((note) => {
      totalWidth += NOTE_WIDTH_BY_DURATION[note.duration] + 15;
    });

    const canvasWidth = Math.max(1400, totalWidth);
    const canvasHeight = 400;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const staffY = 120;
    drawStaffLine(ctx, MEASURE_PADDING, staffY, canvasWidth - MEASURE_PADDING * 2);

    let currentX = MEASURE_PADDING + 80;
    let allNotePositions: NoteRenderInfo[] = [];

    measures.forEach((measure, measureIdx) => {
      const positions = calculateNotePositions(measure.notes, currentX - MEASURE_PADDING, staffY);
      allNotePositions = allNotePositions.concat(positions);

      const playingNoteId = getPlayingNoteId();

      positions.forEach((pos) => {
        const isSelected = pos.note.id === selectedNoteId;
        const isPlayingNote = pos.note.id === playingNoteId;
        drawNote(ctx, pos.note, pos.x, pos.y, isSelected, isPlayingNote);
        drawLyrics(ctx, pos.note, pos.x, pos.y);
      });

      const measureWidth = measure.notes.reduce((sum, note) => {
        return sum + NOTE_WIDTH_BY_DURATION[note.duration] + 15;
      }, 0);

      if (measureIdx < measures.length - 1) {
        drawMeasureBar(ctx, currentX + measureWidth + MEASURE_PADDING, staffY, 100);
      }

      currentX += measureWidth + MEASURE_PADDING + 20;
    });

    notePositionsRef.current = allNotePositions;

    ctx.fillStyle = '#666';
    ctx.font = '16px "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1=C 4/4', MEASURE_PADDING + 20, staffY + 5);
  }, [measures, selectedNoteId, currentPlayPosition, getPlayingNoteId, canvasRef]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const pos of notePositionsRef.current) {
      if (
        x >= pos.x - 5 &&
        x <= pos.x + pos.width + 5 &&
        y >= pos.y - 40 &&
        y <= pos.y + 60
      ) {
        onNoteClick(pos.note.id);
        return;
      }
    }

    onNoteClick('');
  };

  useEffect(() => {
    if (isPlaying && containerRef.current) {
      const playingNoteId = getPlayingNoteId();
      const pos = notePositionsRef.current.find((p) => p.note.id === playingNoteId);
      if (pos) {
        const scrollX = Math.max(0, pos.x - 300);
        containerRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
      }
    }
  }, [isPlaying, currentPlayPosition, getPlayingNoteId]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto overflow-y-hidden bg-stone-100 rounded-lg shadow-inner"
      style={{ minHeight: '450px' }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="cursor-pointer block"
        style={{ minWidth: '100%' }}
      />
    </div>
  );
};
