import { Note, NoteDuration, VOICE_COLORS, VoiceType } from '../types/score';
import { DURATION_VALUES } from '../types/score';

export interface NoteRenderInfo {
  x: number;
  y: number;
  width: number;
  note: Note;
}

export const NOTE_WIDTH_BY_DURATION: Record<NoteDuration, number> = {
  whole: 120,
  half: 80,
  quarter: 50,
  eighth: 35,
  sixteenth: 25,
};

export const STAFF_LINE_SPACING = 30;
export const NOTE_FONT_SIZE = 28;
export const LYRICS_FONT_SIZE = 16;
export const MEASURE_PADDING = 40;
export const STAFF_TOP_MARGIN = 80;
export const VOICE_GAP = 100;

export function drawStaffLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
) {
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

export function drawNote(
  ctx: CanvasRenderingContext2D,
  note: Note,
  x: number,
  y: number,
  isSelected: boolean,
  isPlaying: boolean
) {
  const width = NOTE_WIDTH_BY_DURATION[note.duration];
  const color = VOICE_COLORS[note.voice];
  
  if (isPlaying) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fillRect(x - 5, y - 30, width + 10, 60);
  }
  
  if (isSelected) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 5, y - 30, width + 10, 60);
  }
  
  if (note.pitch === null) {
    ctx.fillStyle = '#666';
    ctx.font = `${NOTE_FONT_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('0', x + width / 2, y + 10);
  } else {
    ctx.fillStyle = color;
    ctx.font = `bold ${NOTE_FONT_SIZE}px "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(note.pitch.toString(), x + width / 2, y + 10);
    
    if (note.octave === 1) {
      ctx.beginPath();
      ctx.arc(x + width / 2, y - 12, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    } else if (note.octave === -1) {
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 22, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    if (note.accidental === 'sharp') {
      ctx.fillStyle = color;
      ctx.font = `${NOTE_FONT_SIZE * 0.7}px serif`;
      ctx.fillText('#', x + width / 2 - 18, y + 8);
    } else if (note.accidental === 'flat') {
      ctx.fillStyle = color;
      ctx.font = `${NOTE_FONT_SIZE * 0.7}px serif`;
      ctx.fillText('b', x + width / 2 - 18, y + 8);
    }
  }
  
  drawDurationLine(ctx, note, x, y, width);
}

export function drawDurationLine(
  ctx: CanvasRenderingContext2D,
  note: Note,
  x: number,
  y: number,
  width: number
) {
  const lineY = y + 30;
  const color = VOICE_COLORS[note.voice];
  
  if (note.duration === 'eighth') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, lineY);
    ctx.lineTo(x + width - 5, lineY);
    ctx.stroke();
  } else if (note.duration === 'sixteenth') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, lineY);
    ctx.lineTo(x + width - 5, lineY);
    ctx.moveTo(x + 5, lineY + 5);
    ctx.lineTo(x + width - 5, lineY + 5);
    ctx.stroke();
  } else if (note.duration === 'half') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + 12);
    ctx.lineTo(x + width / 2, lineY);
    ctx.stroke();
  }
}

export function drawLyrics(
  ctx: CanvasRenderingContext2D,
  note: Note,
  x: number,
  y: number
) {
  if (note.lyrics) {
    const width = NOTE_WIDTH_BY_DURATION[note.duration];
    ctx.fillStyle = '#333';
    ctx.font = `${LYRICS_FONT_SIZE}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(note.lyrics, x + width / 2, y + 55);
  }
}

export function drawMeasureBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number
) {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 40);
  ctx.lineTo(x, y + height - 20);
  ctx.stroke();
}

export function calculateNotePositions(
  notes: Note[],
  startX: number,
  staffY: number
): NoteRenderInfo[] {
  const positions: NoteRenderInfo[] = [];
  let currentX = startX + MEASURE_PADDING;
  
  for (const note of notes) {
    const width = NOTE_WIDTH_BY_DURATION[note.duration];
    positions.push({
      x: currentX,
      y: staffY,
      width,
      note,
    });
    currentX += width + 15;
  }
  
  return positions;
}

export function calculateAlignedPositions(
  melodyNotes: Note[],
  harmonyNotes: Note[],
  startX: number,
  melodyY: number,
  harmonyY: number
): { melodyPositions: NoteRenderInfo[]; harmonyPositions: NoteRenderInfo[]; measureWidth: number } {
  const melodyPositions: NoteRenderInfo[] = [];
  const harmonyPositions: NoteRenderInfo[] = [];
  
  let currentX = startX + MEASURE_PADDING;
  let melodyIdx = 0;
  let harmonyIdx = 0;
  let melodyBeat = 0;
  let harmonyBeat = 0;
  
  while (melodyIdx < melodyNotes.length || harmonyIdx < harmonyNotes.length) {
    if (melodyIdx < melodyNotes.length && melodyBeat <= harmonyBeat) {
      const note = melodyNotes[melodyIdx];
      const width = NOTE_WIDTH_BY_DURATION[note.duration];
      melodyPositions.push({ x: currentX, y: melodyY, width, note });
      melodyBeat += DURATION_VALUES[note.duration];
      melodyIdx++;
    }
    
    if (harmonyIdx < harmonyNotes.length && harmonyBeat <= melodyBeat) {
      const note = harmonyNotes[harmonyIdx];
      const width = NOTE_WIDTH_BY_DURATION[note.duration];
      harmonyPositions.push({ x: currentX, y: harmonyY, width, note });
      harmonyBeat += DURATION_VALUES[note.duration];
      harmonyIdx++;
    }
    
    const nextMelodyBeat = melodyIdx < melodyNotes.length 
      ? melodyBeat + DURATION_VALUES[melodyNotes[melodyIdx].duration] 
      : Infinity;
    const nextHarmonyBeat = harmonyIdx < harmonyNotes.length 
      ? harmonyBeat + DURATION_VALUES[harmonyNotes[harmonyIdx].duration] 
      : Infinity;
    
    if (melodyIdx < melodyNotes.length || harmonyIdx < harmonyNotes.length) {
      const nextBeat = Math.min(nextMelodyBeat, nextHarmonyBeat);
      const currentBeat = Math.min(melodyBeat, harmonyBeat);
      const beatDiff = nextBeat - currentBeat;
      
      if (beatDiff > 0) {
        const avgWidthPerBeat = (NOTE_WIDTH_BY_DURATION.quarter + NOTE_WIDTH_BY_DURATION.eighth + NOTE_WIDTH_BY_DURATION.sixteenth) / 3;
        currentX += beatDiff * avgWidthPerBeat + 15;
      }
    }
  }
  
  const measureWidth = currentX - startX - MEASURE_PADDING + 30;
  
  return { melodyPositions, harmonyPositions, measureWidth };
}

export function getCanvasHeight(measures: number): number {
  return STAFF_TOP_MARGIN + measures * 220 + 100;
}

export function getCanvasWidth(notes: Note[]): number {
  const totalWidth = notes.reduce((sum, note) => sum + NOTE_WIDTH_BY_DURATION[note.duration] + 15, 0);
  return Math.max(1200, totalWidth + MEASURE_PADDING * 2 + 200);
}

export function drawVoiceLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  voice: VoiceType
) {
  ctx.fillStyle = VOICE_COLORS[voice];
  ctx.font = 'bold 14px "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);
}
