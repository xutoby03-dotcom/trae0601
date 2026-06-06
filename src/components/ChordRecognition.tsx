import React, { useState, useRef } from 'react';
import { Upload, Play, Music, Loader2, Mic, FileAudio, Save, Heart } from 'lucide-react';
import { CHORDS } from '../data/chords';
import { audioEngine } from '../utils/audio';
import { useAppStore } from '../store/appStore';
import { ChordProgression } from '../types';

export const ChordRecognition: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognizedChords, setRecognizedChords] = useState<string[]>([]);
  const [confidences, setConfidences] = useState<number[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToFavorites = useAppStore(state => state.addToFavorites);

  const mockChordProgressions = [
    ['C', 'G', 'Am', 'F'],
    ['G', 'D', 'Em', 'C'],
    ['D', 'A', 'Bm', 'G'],
    ['A', 'E', 'F#m', 'D'],
    ['E', 'B', 'C#m', 'A'],
    ['F', 'C', 'Dm', 'Bb'],
    ['C', 'Am', 'F', 'G'],
    ['G', 'Em', 'C', 'D'],
  ];

  const generateConfidences = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 20) + 75);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setIsAnalyzing(true);
    setRecognizedChords([]);
    setConfidences([]);
    setSaved(false);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockChordProgressions.length);
      const chords = mockChordProgressions[randomIndex];
      setRecognizedChords(chords);
      setConfidences(generateConfidences(chords.length));
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSaveToFavorites = () => {
    if (recognizedChords.length === 0) return;

    const progression: ChordProgression = {
      id: 'recog-' + Date.now(),
      name: `识别结果 - ${fileName || '未命名'}`,
      category: '识别结果',
      chords: [...recognizedChords],
      bpm: 100,
      beatsPerMeasure: 4,
      createdAt: Date.now(),
    };
    addToFavorites(progression);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const playChord = (chordId: string) => {
    const chord = CHORDS.find(c => c.id === chordId);
    if (chord) {
      audioEngine.playChord(chord.frets);
    }
  };

  const playAllChords = () => {
    let delay = 0;
    recognizedChords.forEach(chordId => {
      const chord = CHORDS.find(c => c.id === chordId);
      if (chord) {
        setTimeout(() => {
          audioEngine.playChord(chord.frets);
        }, delay);
        delay += 800;
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        <Mic className="w-6 h-6" />
        和弦识别
      </h3>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-700">正在分析音频...</p>
            <p className="text-sm text-gray-500 mt-2">识别和弦进行中，请稍候</p>
            <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              拖拽音频文件到这里，或点击上传
            </p>
            <p className="text-sm text-gray-500 mt-2">
              支持 MP3, WAV, M4A 等格式
            </p>
            {fileName && (
              <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
                <FileAudio className="w-4 h-4" />
                <span className="text-sm">{fileName}</span>
              </div>
            )}
          </>
        )}
      </div>

      {recognizedChords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Music className="w-5 h-5 text-green-500" />
              识别结果
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleSaveToFavorites}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  saved
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
                }`}
              >
                {saved ? (
                  <><Heart className="w-4 h-4 fill-current" /> 已保存</>
                ) : (
                  <><Save className="w-4 h-4" /> 保存到收藏夹</>
                )}
              </button>
              <button
                onClick={playAllChords}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                播放全部
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300 -translate-y-1/2" />
              
              <div className="relative flex justify-between">
                {recognizedChords.map((chordId, index) => {
                  const chord = CHORDS.find(c => c.id === chordId);
                  const confidence = confidences[index] || 85;
                  const measureNumber = index + 1;
                  
                  return (
                    <div key={index} className="flex flex-col items-center relative z-10">
                      <div className="text-xs text-gray-500 mb-1 font-medium">
                        小节 {measureNumber}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold mb-2">
                        {confidence}%
                      </div>
                      <button
                        onClick={() => playChord(chordId)}
                        className="w-16 h-16 bg-white border-2 border-amber-300 rounded-xl flex items-center justify-center shadow-md hover:border-amber-500 hover:shadow-lg transition-all group"
                      >
                        <span className="text-lg font-bold text-amber-900">
                          {chord?.name || chordId}
                        </span>
                        <Play className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                      </button>
                      <div className="w-full max-w-[4rem] h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            confidence >= 90 ? 'bg-emerald-500' :
                            confidence >= 80 ? 'bg-amber-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600">平均置信度:</span>
            <span className="text-sm font-semibold text-emerald-600">
              {Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)}%
            </span>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              <strong>提示:</strong> 这是模拟识别功能。实际应用中需要专业的音频分析算法。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
