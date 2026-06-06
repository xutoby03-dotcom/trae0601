import React from 'react';
import { Note } from '../types/score';

interface LyricsEditorProps {
  selectedNote: Note | null;
  onLyricsChange: (lyrics: string) => void;
  onOctaveUp: () => void;
  onOctaveDown: () => void;
  onSharp: () => void;
  onFlat: () => void;
}

export const LyricsEditor: React.FC<LyricsEditorProps> = ({
  selectedNote,
  onLyricsChange,
  onOctaveUp,
  onOctaveDown,
  onSharp,
  onFlat,
}) => {
  if (!selectedNote) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <p className="text-gray-500 text-sm">请选择一个音符进行编辑</p>
      </div>
    );
  }

  const octaveLabels: Record<number, string> = {
    '-1': '低八度',
    '0': '中央',
    '1': '高八度',
  };

  const accidentalLabels: Record<string, string> = {
    none: '无',
    sharp: '升半音 #',
    flat: '降半音 b',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 space-y-4">
      <h3 className="font-semibold text-gray-800">音符属性</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">音高</label>
          <div className="text-2xl font-bold text-blue-600">
            {selectedNote.pitch ?? '休止符'}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">八度</label>
          <div className="flex items-center gap-2">
            <button
              onClick={onOctaveDown}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              ↓
            </button>
            <span className="text-sm font-medium min-w-16 text-center">
              {octaveLabels[selectedNote.octave]}
            </span>
            <button
              onClick={onOctaveUp}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">半音</label>
          <div className="flex items-center gap-2">
            <button
              onClick={onFlat}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              ♭
            </button>
            <span className="text-sm font-medium min-w-20 text-center">
              {accidentalLabels[selectedNote.accidental]}
            </span>
            <button
              onClick={onSharp}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              ♯
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">声部</label>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            selectedNote.voice === 'melody' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {selectedNote.voice === 'melody' ? '主旋律' : '和声'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">歌词</label>
        <input
          type="text"
          value={selectedNote.lyrics}
          onChange={(e) => onLyricsChange(e.target.value)}
          placeholder="输入歌词..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
