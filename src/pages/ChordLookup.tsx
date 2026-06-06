import React from 'react';
import { Fretboard } from '../components/Fretboard';
import { ChordLibrary } from '../components/ChordLibrary';
import { useAppStore } from '../store/appStore';
import { Volume2, Plus } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { Chord } from '../types';

export const ChordLookupPage: React.FC = () => {
  const selectedChord = useAppStore(state => state.selectedChord);
  const setSelectedChord = useAppStore(state => state.setSelectedChord);
  const addChordToProgression = useAppStore(state => state.addChordToProgression);

  const handlePlayChord = () => {
    if (selectedChord) {
      audioEngine.playChord(selectedChord.frets);
    }
  };

  const handleAddToProgression = (chord: Chord) => {
    addChordToProgression(chord.id);
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
                <button
                  onClick={handlePlayChord}
                  disabled={!selectedChord}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Volume2 className="w-5 h-5" />
                  播放和弦
                </button>
                {selectedChord && (
                  <button
                    onClick={() => handleAddToProgression(selectedChord)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    添加到进行
                  </button>
                )}
              </div>
            </div>

            <Fretboard chord={selectedChord} onPlay={handlePlayChord} />

            {selectedChord && (
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">根音</h4>
                  <p className="text-2xl font-bold text-amber-900">{selectedChord.rootNote}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">和弦类型</h4>
                  <p className="text-2xl font-bold text-amber-900">
                    {selectedChord.type === 'major' ? '大三' :
                     selectedChord.type === 'minor' ? '小三' :
                     selectedChord.type === '7' ? '属七' :
                     selectedChord.type === 'maj7' ? '大七' :
                     selectedChord.type === 'm7' ? '小七' :
                     selectedChord.type === 'dim' ? '减' :
                     selectedChord.type === 'aug' ? '增' :
                     selectedChord.type === 'sus2' ? '挂二' :
                     selectedChord.type === 'sus4' ? '挂四' :
                     selectedChord.type === '6' ? '六' : selectedChord.type}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">品位</h4>
                  <p className="text-2xl font-bold text-amber-900">
                    {selectedChord.baseFret > 1 ? `${selectedChord.baseFret} 品起` : '开放'}
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
