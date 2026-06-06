import React, { useRef, useEffect, useCallback } from 'react';
import { Measure } from '../types/score';
import {
  drawNote,
  drawLyrics,
  drawMeasureBar,
  drawStaffLine,
  calculateAlignedPositions,
  MEASURE_PADDING,
  NOTE_WIDTH_BY_DURATION,
  NoteRenderInfo,
  VOICE_GAP,
  drawVoiceLabel,
} from '../utils/renderUtils';
import { getNoteAtPosition, flattenMelodyNotes, flattenAllNotes } from '../utils/musicUtils';

interface EditorCanvasProps {
  measures: Measure[];
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
    const melodyNotes = flattenMelodyNotes(measures);
    const note = getNoteAtPosition(melodyNotes, currentPlayPosition);
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
    const canvasHeight = 500;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const melodyStaffY = 120;
    const harmonyStaffY = melodyStaffY + VOICE_GAP;

    drawStaffLine(ctx, MEASURE_PADDING, melodyStaffY, canvasWidth - MEASURE_PADDING * 2);
    drawStaffLine(ctx, MEASURE_PADDING, harmonyStaffY, canvasWidth - MEASURE_PADDING * 2);

    drawVoiceLabel(ctx, MEASURE_PADDING + 10, melodyStaffY - 15, '主旋律', 'melody');
    drawVoiceLabel(ctx, MEASURE_PADDING + 10, harmonyStaffY - 15, '和声', 'harmony');

    let currentX = MEASURE_PADDING + 80;
    let allNotePositions: NoteRenderInfo[] = [];

    measures.forEach((measure, measureIdx) => {
      const { melodyPositions, harmonyPositions, measureWidth } = calculateAlignedPositions(
        measure.melody,
        measure.harmony,
        currentX - MEASURE_PADDING,
        melodyStaffY,
        harmonyStaffY
      );

      allNotePositions = allNotePositions.concat(melodyPositions, harmonyPositions);

      const playingNoteId = getPlayingNoteId();

      melodyPositions.forEach((pos) => {
        const isSelected = pos.note.id === selectedNoteId;
        const isPlayingNote = pos.note.id === playingNoteId;
        drawNote(ctx, pos.note, pos.x, pos.y, isSelected, isPlayingNote);
        drawLyrics(ctx, pos.note, pos.x, pos.y);
      });

      harmonyPositions.forEach((pos) => {
        const isSelected = pos.note.id === selectedNoteId;
        const isPlayingNote = pos.note.id === playingNoteId;
        drawNote(ctx, pos.note, pos.x, pos.y, isSelected, isPlayingNote);
        drawLyrics(ctx, pos.note, pos.x, pos.y);
      });

      if (measureIdx < measures.length - 1) {
        drawMeasureBar(ctx, currentX + measureWidth + MEASURE_PADDING, melodyStaffY, VOICE_GAP + 60);
      }

      currentX += measureWidth + MEASURE_PADDING + 20;
    });

    notePositionsRef.current = allNotePositions;

    ctx.fillStyle = '#666';
    ctx.font = '16px "PingFang SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1=C 4/4', MEASURE_PADDING + 20, melodyStaffY + 5);
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
        y >= pos.y - 30 &&
        y <= pos.y + 55
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
      style={{ minHeight: '550px' }}
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
