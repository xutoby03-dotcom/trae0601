import React, { useMemo } from 'react';
import { Fretboard } from '../components/Fretboard';
import { ChordLibrary } from '../components/ChordLibrary';
import { useAppStore } from '../store/appStore';
import { Volume2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { Chord } from '../types';
import { CHORDS } from '../data/chords';
import { ROOT_NOTES } from '../data/chords';

export const ChordLookupPage: React.FC = () => {
  const selectedChord = useAppStore(state => state.selectedChord);
  const setSelectedChord = useAppStore(state => state.setSelectedChord);
  const addChordToProgression = useAppStore(state => state.addChordToProgression);
  const [transpose, setTranspose] = React.useState(0);

  const findTransposedChord = (chord: Chord, semitones: number): Chord | null => {
    if (semitones === 0) return chord;

    const rootIndex = ROOT_NOTES.indexOf(chord.rootNote);
    if (rootIndex === -1) return chord;

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
      const flatToSharp: Record<string, string> = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
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
      }
    }

    return found || chord;
  };

  const displayChord = useMemo(() => {
    if (!selectedChord) return null;
    return findTransposedChord(selectedChord, transpose);
  }, [selectedChord, transpose]);

  const handleTranspose = (delta: number) => {
    const newTranspose = (transpose + delta + 12) % 12;
    setTranspose(newTranspose);
  };

  const handleResetTranspose = () => {
    setTranspose(0);
  };

  const handlePlayChord = () => {
    if (displayChord) {
      audioEngine.playChord(displayChord.frets);
    }
  };

  const handleAddToProgression = (chord: Chord) => {
    const chordToAdd = transpose !== 0 && displayChord ? displayChord : chord;
    addChordToProgression(chordToAdd.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <ChordLibrary
            selectedChord={selectedChord}
            onSelectChord={setSelectedChord}
            onAddToProgression={handleAddToProgression}
          />
        </div>

        <div className="col-span-9">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  吉他指板
                </h2>
                <p className="text-amber-700 mt-1">点击指板试听和弦声音</p>
              </div>
              
              <div className="flex gap-3">
                <div className="flex items-center gap-1 bg-white rounded-xl shadow-md px-3 py-1">
                  <button
                    onClick={() => handleTranspose(-1)}
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                    title="降半音"
                  >
                    <ChevronDown className="w-4 h-4 text-amber-700" />
                  </button>
                  <div className="px-3 text-center min-w-[60px]">
                    <div className="text-xs text-gray-500">移调</div>
                    <div className="text-sm font-bold text-amber-900">
                      {transpose === 0 ? '0' : transpose > 0 ? `+${transpose}` : transpose}
                    </div>
                  </div>
                  <button
                    onClick={() => handleTranspose(1)}
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                    title="升半音"
                  >
                    <ChevronUp className="w-4 h-4 text-amber-700" />
                  </button>
                  {transpose !== 0 && (
                    <button
                      onClick={handleResetTranspose}
                      className="ml-1 px-2 py-1 text-xs text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      重置
                    </button>
                  )}
                </div>
                <button
                  onClick={handlePlayChord}
                  disabled={!displayChord}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 className="w-5 h-5" />
                  播放和弦
                </button>
                {displayChord && (
                  <button
                    onClick={() => handleAddToProgression(displayChord)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    添加到进行
                  </button>
                )}
              </div>
            </div>

            {transpose !== 0 && displayChord && selectedChord && selectedChord.id !== displayChord.id && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <span className="text-blue-700 text-sm">
                  {selectedChord.name} → <span className="font-bold">{displayChord.name}</span>
                  <span className="text-blue-600 ml-2">（移调 {transpose > 0 ? '+' : ''}{transpose} 半音）</span>
                </span>
              </div>
            )}

            <Fretboard chord={displayChord} onPlay={handlePlayChord} />

            {displayChord && (
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">根音</h4>
                  <p className="text-2xl font-bold text-amber-900">{displayChord.rootNote}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">和弦类型</h4>
                  <p className="text-2xl font-bold text-amber-900">
                    {displayChord.type === 'major' ? '大三' :
                     displayChord.type === 'minor' ? '小三' :
                     displayChord.type === '7' ? '属七' :
                     displayChord.type === 'maj7' ? '大七' :
                     displayChord.type === 'm7' ? '小七' :
                     displayChord.type === 'dim' ? '减' :
                     displayChord.type === 'aug' ? '增' :
                     displayChord.type === 'sus2' ? '挂二' :
                     displayChord.type === 'sus4' ? '挂四' :
                     displayChord.type === '6' ? '六' : displayChord.type}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">品位</h4>
                  <p className="text-2xl font-bold text-amber-900">
                    {displayChord.baseFret > 1 ? `${displayChord.baseFret} 品起` : '开放'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
