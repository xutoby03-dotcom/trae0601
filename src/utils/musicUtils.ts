import { Note, PitchNumber, OctaveShift, Accidental, PITCH_FREQUENCIES, DURATION_VALUES, NoteDuration } from '../types/score';

export function getNoteFrequency(pitch: PitchNumber, octave: OctaveShift, accidental: Accidental): number {
  const key = `${pitch}${octave}`;
  let freq = PITCH_FREQUENCIES[key] || 440;
  
  if (accidental === 'sharp') {
    freq *= Math.pow(2, 1 / 12);
  } else if (accidental === 'flat') {
    freq /= Math.pow(2, 1 / 12);
  }
  
  return freq;
}

export function getNoteDurationInSeconds(duration: NoteDuration, bpm: number): number {
  const beatValue = DURATION_VALUES[duration];
  const secondsPerBeat = 60 / bpm;
  return beatValue * secondsPerBeat;
}

export function getTotalNotesDuration(notes: Note[]): number {
  return notes.reduce((total, note) => total + DURATION_VALUES[note.duration], 0);
}

export function cycleOctave(current: OctaveShift, direction: 'up' | 'down'): OctaveShift {
  const octaves: OctaveShift[] = [-1, 0, 1];
  const index = octaves.indexOf(current);
  if (direction === 'up') {
    return octaves[Math.min(index + 1, 2)] as OctaveShift;
  } else {
    return octaves[Math.max(index - 1, 0)] as OctaveShift;
  }
}

export function cycleAccidental(current: Accidental, direction: 'up' | 'down'): Accidental {
  const accidentals: Accidental[] = ['flat', 'none', 'sharp'];
  const index = accidentals.indexOf(current);
  if (direction === 'up') {
    return accidentals[Math.min(index + 1, 2)] as Accidental;
  } else {
    return accidentals[Math.max(index - 1, 0)] as Accidental;
  }
}

export function flattenAllNotes(measures: { notes: Note[] }[]): Note[] {
  return measures.flatMap(m => m.notes);
}

export function getNoteAtPosition(flatNotes: Note[], playPosition: number): Note | null {
  let cumulativeTime = 0;
  for (const note of flatNotes) {
    if (playPosition >= cumulativeTime && playPosition < cumulativeTime + DURATION_VALUES[note.duration]) {
      return note;
    }
    cumulativeTime += DURATION_VALUES[note.duration];
  }
  return null;
}

export function getTotalDuration(measures: { notes: Note[] }[]): number {
  return measures.reduce((total, measure) => {
    return total + getTotalNotesDuration(measure.notes);
  }, 0);
}
