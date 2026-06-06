import { Note, NoteDuration, VOICE_COLORS } from '../types/score';

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
    ctx.fillRect(x - 5, y - 40, width + 10, 80);
  }
  
  if (isSelected) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 5, y - 40, width + 10, 80);
  }
  
  if (note.pitch === null) {
    ctx.fillStyle = '#666';
    ctx.font = `${NOTE_FONT_SIZE}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('0', x + width / 2, y + 10);
  } else {
    ctx.fillStyle = note.voice === 'melody' ? color : color;
    ctx.font = `bold ${NOTE_FONT_SIZE}px "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.fillText(note.pitch.toString(), x + width / 2, y + 10);
    
    if (note.octave === 1) {
      ctx.beginPath();
      ctx.arc(x + width / 2, y - 15, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    } else if (note.octave === -1) {
      ctx.beginPath();
      ctx.arc(x + width / 2, y + 25, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    if (note.accidental === 'sharp') {
      ctx.fillStyle = color;
      ctx.font = `${NOTE_FONT_SIZE * 0.7}px serif`;
      ctx.fillText('#', x + width / 2 - 20, y + 8);
    } else if (note.accidental === 'flat') {
      ctx.fillStyle = color;
      ctx.font = `${NOTE_FONT_SIZE * 0.7}px serif`;
      ctx.fillText('b', x + width / 2 - 20, y + 8);
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
  const lineY = y + 35;
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
    ctx.moveTo(x + width / 2, y + 15);
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
    ctx.fillText(note.lyrics, x + width / 2, y + 60);
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

export function getCanvasHeight(measures: number): number {
  return STAFF_TOP_MARGIN + measures * 120 + 100;
}

export function getCanvasWidth(notes: Note[]): number {
  const totalWidth = notes.reduce((sum, note) => sum + NOTE_WIDTH_BY_DURATION[note.duration] + 15, 0);
  return Math.max(1200, totalWidth + MEASURE_PADDING * 2 + 200);
}
