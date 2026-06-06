import React, { useState, useCallback } from 'react';
import { Fretboard } from '../components/Fretboard';
import { ChordLibrary } from '../components/ChordLibrary';
import { useAppStore } from '../store/appStore';
import { Play, RotateCcw, Volume2, Shuffle, Check, X } from 'lucide-react';
import { audioEngine } from '../utils/audio';
import { CHORDS } from '../data/chords';
import { Chord } from '../types';

export const PracticePage: React.FC = () => {
  const selectedChord = useAppStore(state => state.selectedChord);
  const setSelectedChord = useAppStore(state => state.setSelectedChord);
  
  const [quizChord, setQuizChord] = useState<Chord | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const playChord = useCallback((chord: Chord) => {
    audioEngine.playChord(chord.frets);
  }, []);

  const startQuiz = () => {
    const randomIndex = Math.floor(Math.random() * CHORDS.filter(c => 
      ['major', 'minor'].includes(c.type)
    ).length);
    const quizChords = CHORDS.filter(c => ['major', 'minor'].includes(c.type));
    setQuizChord(quizChords[randomIndex]);
    setUserAnswer(null);
    setIsQuizMode(true);
    setSelectedChord(null);
  };

  const playQuizChord = () => {
    if (quizChord) {
      setIsPlaying(true);
      playChord(quizChord);
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  const submitAnswer = (chord: Chord) => {
    if (userAnswer) return;
    
    setUserAnswer(chord.id);
    const isCorrect = chord.id === quizChord?.id;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    const randomIndex = Math.floor(Math.random() * CHORDS.filter(c => 
      ['major', 'minor'].includes(c.type)
    ).length);
    const quizChords = CHORDS.filter(c => ['major', 'minor'].includes(c.type));
    setQuizChord(quizChords[randomIndex]);
    setUserAnswer(null);
    setSelectedChord(null);
  };

  const resetQuiz = () => {
    setIsQuizMode(false);
    setQuizChord(null);
    setUserAnswer(null);
    setScore({ correct: 0, total: 0 });
    setSelectedChord(null);
  };

  const answerOptions = CHORDS.filter(c => ['major', 'minor'].includes(c.type)).slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-amber-900 mb-4">听音模式</h3>
            
            {!isQuizMode ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  选择一个和弦，点击播放按钮试听吉他声音。
                </p>
                <button
                  onClick={startQuiz}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Shuffle className="w-5 h-5" />
                  开始听音测验
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-700 font-medium">得分</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {score.correct} / {score.total}
                  </p>
                  {score.total > 0 && (
                    <p className="text-sm text-purple-600 mt-1">
                      正确率: {Math.round((score.correct / score.total) * 100)}%
                    </p>
                  )}
                </div>

                <button
                  onClick={playQuizChord}
                  disabled={!quizChord || isPlaying}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? '播放中...' : '播放和弦'}
                </button>

                {userAnswer && (
                  <>
                    <div className={`p-4 rounded-xl ${
                      userAnswer === quizChord?.id 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2 font-semibold">
                        {userAnswer === quizChord?.id ? (
                          <><Check className="w-5 h-5" /> 回答正确！</>
                        ) : (
                          <><X className="w-5 h-5" /> 回答错误</>
                        )}
                      </div>
                      <p className="text-sm mt-1">
                        正确答案: <span className="font-bold">{quizChord?.name}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={nextQuestion}
                        className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                      >
                        下一题
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {!isQuizMode && (
            <div className="mt-6">
              <ChordLibrary
                selectedChord={selectedChord}
                onSelectChord={setSelectedChord}
              />
            </div>
          )}
        </div>

        <div className="col-span-9">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8">
            {isQuizMode ? (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Volume2 className="w-16 h-16 text-purple-500" />
                </div>
                <h2 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  听音辨和弦
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  点击播放按钮聆听和弦，然后选择你认为正确的答案
                </p>

                {userAnswer === null && quizChord && (
                  <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
                    {answerOptions.map(chord => (
                      <button
                        key={chord.id}
                        onClick={() => submitAnswer(chord)}
                        className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all border-2 border-transparent hover:border-amber-300"
                      >
                        <span className="text-2xl font-bold text-amber-900">{chord.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {userAnswer && quizChord && (
                  <div className="max-w-md mx-auto">
                    <Fretboard chord={quizChord} />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                      听音练习
                    </h2>
                    <p className="text-amber-700 mt-1">
                      WebAudio 模拟真实吉他音色
                    </p>
                  </div>
                  
                  {selectedChord && (
                    <button
                      onClick={() => playChord(selectedChord)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                    >
                      <Play className="w-5 h-5" />
                      播放和弦
                    </button>
                  )}
                </div>

                <Fretboard chord={selectedChord} onPlay={() => selectedChord && playChord(selectedChord)} />

                {selectedChord && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      💡 提示：点击指板或播放按钮可以试听和弦声音
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
