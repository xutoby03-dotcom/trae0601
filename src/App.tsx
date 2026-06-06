import React, { useRef, useCallback } from 'react';
import { useScoreStore } from './store/useScoreStore';
import { Toolbar } from './components/Toolbar';
import { EditorCanvas } from './components/EditorCanvas';
import { VoiceSwitcher } from './components/VoiceSwitcher';
import { LyricsEditor } from './components/LyricsEditor';
import { ExportPanel } from './components/ExportPanel';
import { HelpPanel } from './components/HelpPanel';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { flattenAllNotes, cycleOctave, cycleAccidental } from './utils/musicUtils';
import { exportPNG, exportMusicXML } from './utils/exportUtils';
import { PitchNumber, OctaveShift, Accidental } from './types/score';

function App() {
  const {
    score,
    setBpm,
    setCurrentDuration,
    addNote,
    removeNote,
    updateNote,
    setActiveVoice,
    setSelectedNote,
    togglePlay,
    stopPlay,
    setPlayPosition,
  } = useScoreStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const allNotes = flattenAllNotes(score.measures);
  const selectedNote = allNotes.find((n) => n.id === score.selectedNoteId) || null;

  useAudioPlayer({
    notes: allNotes,
    bpm: score.bpm,
    isPlaying: score.isPlaying,
    currentPlayPosition: score.currentPlayPosition,
    onPositionChange: setPlayPosition,
    onStop: stopPlay,
  });

  const getSelectedNote = useCallback(() => {
    const note = allNotes.find((n) => n.id === score.selectedNoteId);
    return note ? { octave: note.octave, accidental: note.accidental } : null;
  }, [allNotes, score.selectedNoteId]);

  const updateSelectedNote = useCallback(
    (updates: { octave?: OctaveShift; accidental?: Accidental }) => {
      if (score.selectedNoteId) {
        updateNote(score.selectedNoteId, updates);
      }
    },
    [score.selectedNoteId, updateNote]
  );

  useKeyboardInput({
    onAddNote: (pitch: PitchNumber | null) => addNote(pitch),
    onRemoveSelected: () => {
      if (score.selectedNoteId) {
        removeNote(score.selectedNoteId);
      }
    },
    selectedNoteId: score.selectedNoteId,
    getSelectedNote,
    updateSelectedNote,
  });

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId || null);
  };

  const handleLyricsChange = (lyrics: string) => {
    if (score.selectedNoteId) {
      updateNote(score.selectedNoteId, { lyrics });
    }
  };

  const handleOctaveUp = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { octave: cycleOctave(selectedNote.octave, 'up') });
    }
  };

  const handleOctaveDown = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { octave: cycleOctave(selectedNote.octave, 'down') });
    }
  };

  const handleSharp = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { accidental: cycleAccidental(selectedNote.accidental, 'up') });
    }
  };

  const handleFlat = () => {
    if (selectedNote) {
      updateNote(selectedNote.id, { accidental: cycleAccidental(selectedNote.accidental, 'down') });
    }
  };

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportPNG(canvasRef.current, `${score.title}.png`);
    }
  };

  const handleExportMusicXML = () => {
    exportMusicXML(score, `${score.title}.xml`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toolbar
        currentDuration={score.currentDuration}
        onDurationChange={setCurrentDuration}
        bpm={score.bpm}
        onBpmChange={setBpm}
        isPlaying={score.isPlaying}
        onPlayToggle={togglePlay}
        onStop={stopPlay}
      />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <VoiceSwitcher
              activeVoice={score.activeVoice}
              onVoiceChange={setActiveVoice}
            />
            <div className="text-sm text-gray-500">
              共 {allNotes.length} 个音符
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <EditorCanvas
                measures={score.measures}
                selectedNoteId={score.selectedNoteId}
                currentPlayPosition={score.currentPlayPosition}
                isPlaying={score.isPlaying}
                onNoteClick={handleNoteClick}
                canvasRef={canvasRef}
              />

              <div className="mt-4 flex gap-2 flex-wrap">
                {([1, 2, 3, 4, 5, 6, 7] as PitchNumber[]).map((pitch) => (
                  <button
                    key={pitch}
                    onClick={() => addNote(pitch)}
                    className="w-12 h-12 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors font-bold text-lg text-gray-700 shadow-sm"
                  >
                    {pitch}
                  </button>
                ))}
                <button
                  onClick={() => addNote(null)}
                  className="px-4 h-12 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium text-gray-600 shadow-sm"
                >
                  休止符
                </button>
              </div>
            </div>

            <div className="w-72 space-y-4">
              <LyricsEditor
                selectedNote={selectedNote}
                onLyricsChange={handleLyricsChange}
                onOctaveUp={handleOctaveUp}
                onOctaveDown={handleOctaveDown}
                onSharp={handleSharp}
                onFlat={handleFlat}
              />
              <ExportPanel
                onExportPNG={handleExportPNG}
                onExportMusicXML={handleExportMusicXML}
              />
              <HelpPanel />
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto text-sm text-gray-500 text-center">
          简谱乐谱编辑器 · 专为老歌民谣爱好者设计 · 提示：使用数字键 1-7 快速输入音符
        </div>
      </footer>
    </div>
  );
}

export default App;
