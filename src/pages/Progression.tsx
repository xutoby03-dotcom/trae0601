import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChordLibrary } from '../components/ChordLibrary';
import { ProgressionEditor } from '../components/ProgressionEditor';
import { Metronome } from '../components/Metronome';
import { useAppStore } from '../store/appStore';
import { Chord, ChordProgression } from '../types';
import { CHORDS, ROOT_NOTES } from '../data/chords';
import { audioEngine } from '../utils/audio';
import { Save, ChevronUp, ChevronDown } from 'lucide-react';

export const ProgressionPage: React.FC = () => {
  const selectedChord = useAppStore(state => state.selectedChord);
  const setSelectedChord = useAppStore(state => state.setSelectedChord);
  const currentProgression = useAppStore(state => state.currentProgression);
  const setCurrentProgression = useAppStore(state => state.setCurrentProgression);
  const addChordToProgression = useAppStore(state => state.addChordToProgression);
  const removeChordFromProgression = useAppStore(state => state.removeChordFromProgression);
  const reorderProgression = useAppStore(state => state.reorderProgression);
  const setBpm = useAppStore(state => state.setBpm);
  const addToFavorites = useAppStore(state => state.addToFavorites);
  
  const isPlaying = useAppStore(state => state.isPlaying);
  const setIsPlaying = useAppStore(state => state.setIsPlaying);
  const currentBeat = useAppStore(state => state.currentBeat);
  const setCurrentBeat = useAppStore(state => state.setCurrentBeat);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('');
  const [playingChordIndex, setPlayingChordIndex] = useState(-1);
  const [transpose, setTranspose] = useState(0);
  
  const intervalRef = useRef<number | null>(null);

  const findTransposedChordId = (chordId: string, semitones: number): string => {
    if (semitones === 0) return chordId;

    const chord = CHORDS.find(c => c.id === chordId);
    if (!chord) return chordId;

    const rootIndex = ROOT_NOTES.indexOf(chord.rootNote);
    if (rootIndex === -1) return chordId;

    const newRootIndex = (rootIndex + semitones + 12) % 12;
    const newRoot = ROOT_NOTES[newRootIndex];

    let newId = newRoot;
    if (chord.type === 'minor') newId += 'm';
    else if (chord.type === '7') newId += '7';
    else if (chord.type === 'maj7') newId += 'maj7';
    else if (chord.type === 'm7') newId += 'm7';
    else if (chord.type === 'dim') newId += 'dim';
    else if (chord.type === 'aug') newId += 'aug';
    else if (chord.type === 'sus2') newId += 'sus2';
    else if (chord.type === 'sus4') newId += 'sus4';
    else if (chord.type === '6') newId += '6';
    else if (chord.type === 'm6') newId += 'm6';

    let found = CHORDS.find(c => c.id === newId);

    if (!found) {
      const sharpToFlat: Record<string, string> = {
        'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
      };
      if (sharpToFlat[newRoot]) {
        let flatId = sharpToFlat[newRoot];
        if (chord.type === 'minor') flatId += 'm';
        else if (chord.type === '7') flatId += '7';
        else if (chord.type === 'maj7') flatId += 'maj7';
        else if (chord.type === 'm7') flatId += 'm7';
        else if (chord.type === 'dim') flatId += 'dim';
        else if (chord.type === 'aug') flatId += 'aug';
        else if (chord.type === 'sus2') flatId += 'sus2';
        else if (chord.type === 'sus4') flatId += 'sus4';
        else if (chord.type === '6') flatId += '6';
        else if (chord.type === 'm6') flatId += 'm6';
        found = CHORDS.find(c => c.id === flatId);
        if (found) newId = flatId;
      }
    }

    return newId;
  };

  const displayChordIds = useMemo(() => {
    if (transpose === 0) return currentProgression.chords;
    return currentProgression.chords.map(id => findTransposedChordId(id, transpose));
  }, [currentProgression.chords, transpose]);

  const handleTranspose = (delta: number) => {
    setTranspose((prev) => (prev + delta + 12) % 12);
  };

  const handleResetTranspose = () => {
    setTranspose(0);
  };

  const applyTransposeToProgression = () => {
    if (transpose === 0) return;
    setCurrentProgression({
      ...currentProgression,
      chords: displayChordIds,
    });
    setTranspose(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && displayChordIds.length > 0) {
      const beatInterval = (60 / currentProgression.bpm) * 1000;
      let beat = 0;
      let chordIndex = 0;

      const playNextBeat = () => {
        audioEngine.init();
        audioEngine.resume();
        
        const isAccent = beat === 0;
        audioEngine.playMetronomeClick(isAccent);
        setCurrentBeat(beat);

        if (beat === 0) {
          setPlayingChordIndex(chordIndex);
          const chordId = displayChordIds[chordIndex];
          const chord = CHORDS.find(c => c.id === chordId);
          if (chord) {
            audioEngine.playChord(chord.frets);
          }
        }

        beat++;
        if (beat >= currentProgression.beatsPerMeasure) {
          beat = 0;
          chordIndex = (chordIndex + 1) % displayChordIds.length;
        }
      };

      playNextBeat();
      intervalRef.current = window.setInterval(playNextBeat, beatInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(0);
      setPlayingChordIndex(-1);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentProgression, displayChordIds, setCurrentBeat]);

  const handleSave = () => {
    setShowSaveModal(true);
    setSaveName(currentProgression.name);
    setSaveCategory(currentProgression.category);
  };

  const confirmSave = () => {
    const progressionToSave: ChordProgression = {
      ...currentProgression,
      name: saveName || '未命名进行',
      category: saveCategory || '未分类',
    };
    addToFavorites(progressionToSave);
    setShowSaveModal(false);
    setSaveName('');
    setSaveCategory('');
  };

  const handleClear = () => {
    setCurrentProgression({
      ...currentProgression,
      chords: [],
    });
  };

  const handleAddChord = (chord: Chord) => {
    addChordToProgression(chord.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <ChordLibrary
            selectedChord={selectedChord}
            onSelectChord={setSelectedChord}
            onAddToProgression={handleAddChord}
          />
        </div>

        <div className="col-span-6">
          <ProgressionEditor
            chordIds={displayChordIds}
            onReorder={reorderProgression}
            onRemove={removeChordFromProgression}
            onClear={handleClear}
            onSave={handleSave}
            playingIndex={playingChordIndex}
            transpose={transpose}
            onTranspose={handleTranspose}
            onResetTranspose={handleResetTranspose}
            onApplyTranspose={applyTransposeToProgression}
          />
        </div>

        <div className="col-span-3">
          <Metronome
            bpm={currentProgression.bpm}
            beatsPerMeasure={currentProgression.beatsPerMeasure}
            isPlaying={isPlaying}
            onBeat={setCurrentBeat}
            onTogglePlay={togglePlay}
            onBpmChange={setBpm}
          />

          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">快捷进行</h3>
            <div className="space-y-2">
              {[
                { name: '经典流行 I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'] },
                { name: 'G大调进行', chords: ['G', 'D', 'Em', 'C'] },
                { name: 'D大调进行', chords: ['D', 'A', 'Bm', 'G'] },
                { name: '50年代进行', chords: ['C', 'Am', 'F', 'G'] },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentProgression({
                      ...currentProgression,
                      chords: preset.chords,
                      name: preset.name,
                    });
                  }}
                  className="w-full p-3 text-left bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  <p className="text-sm font-medium text-amber-900">{preset.name}</p>
                  <p className="text-xs text-amber-700 mt-1">{preset.chords.join(' - ')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-amber-900 mb-4">保存和弦进行</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="输入和弦进行名称"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  placeholder="如：流行、摇滚、民谣"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmSave}
                  className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
