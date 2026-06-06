import { useEffect } from 'react';
import { PitchNumber, OctaveShift, Accidental } from '../types/score';
import { cycleOctave, cycleAccidental } from '../utils/musicUtils';

interface UseKeyboardInputProps {
  onAddNote: (pitch: PitchNumber | null) => void;
  onRemoveSelected: () => void;
  selectedNoteId: string | null;
  getSelectedNote: () => { octave: OctaveShift; accidental: Accidental } | null;
  updateSelectedNote: (updates: { octave?: OctaveShift; accidental?: Accidental }) => void;
}

export function useKeyboardInput({
  onAddNote,
  onRemoveSelected,
  selectedNoteId,
  getSelectedNote,
  updateSelectedNote,
}: UseKeyboardInputProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        onAddNote(parseInt(e.key) as PitchNumber);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        onAddNote(null);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNoteId) {
        e.preventDefault();
        onRemoveSelected();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedNoteId) {
          const note = getSelectedNote();
          if (note) {
            if (e.shiftKey) {
              updateSelectedNote({ accidental: cycleAccidental(note.accidental, 'up') });
            } else {
              updateSelectedNote({ octave: cycleOctave(note.octave, 'up') });
            }
          }
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedNoteId) {
          const note = getSelectedNote();
          if (note) {
            if (e.shiftKey) {
              updateSelectedNote({ accidental: cycleAccidental(note.accidental, 'down') });
            } else {
              updateSelectedNote({ octave: cycleOctave(note.octave, 'down') });
            }
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddNote, onRemoveSelected, selectedNoteId, getSelectedNote, updateSelectedNote]);

  return null;
}
