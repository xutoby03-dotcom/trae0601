import { useState, useCallback } from 'react';
import { Play, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';
import type { ChordType, ChordQuestion, ChordResult } from '@/types';
import { playChord, resumeAudioContext, midiToNoteName } from '@/utils/audio';
import { getRandomRootNote, getChordNotes, CHORD_NAMES } from '@/utils/musicTheory';
import { saveChordResult, updateDailyStats } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const CHORD_TYPES: ChordType[] = ['major', 'minor', 'diminished', 'augmented'];

const CHORD_COLORS: Record<ChordType, string> = {
  major: 'from-blue-500 to-cyan-500',
  minor: 'from-purple-500 to-violet-500',
  diminished: 'from-orange-500 to-red-500',
  augmented: 'from-emerald-500 to-teal-500',
};

const generateQuestion = (): ChordQuestion => {
  const root = getRandomRootNote(52, 67);
  const chordType = CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)];

  return {
    id: Date.now().toString(),
    rootNote: root,
    chordType,
  };
};

export const ChordTraining = () => {
  const { addChordResult } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState<ChordQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<ChordType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const startNewQuestion = useCallback(async () => {
    await resumeAudioContext();
    const question = generateQuestion();
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);

    setTimeout(() => {
      playQuestion(question);
    }, 300);
  }, []);

  const playQuestion = useCallback((question: ChordQuestion) => {
    const notes = getChordNotes(question.rootNote, question.chordType);
    playChord(notes, 2.0, 0.45);
  }, []);

  const replayQuestion = () => {
    if (currentQuestion) {
      playQuestion(currentQuestion);
    }
  };

  const handleAnswer = (answer: ChordType) => {
    if (!currentQuestion || showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.chordType;

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    const result: ChordResult = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      correctAnswer: currentQuestion.chordType,
      isCorrect,
      timestamp: Date.now(),
    };

    saveChordResult(result);
    addChordResult(result);
    updateDailyStats('chord', isCorrect, 5);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">和弦识别</h1>
      <p className="text-slate-400 mb-6">听辨和弦类型：大三、小三、减三、增三</p>

      <div className="w-full max-w-2xl space-y-8">
        {score.total > 0 && (
          <div className="flex justify-center">
            <div className="px-6 py-2 bg-slate-800/50 rounded-full text-slate-300">
              得分: <span className="text-violet-400 font-bold">{score.correct}</span> /{' '}
              {score.total}
              <span className="text-slate-500 ml-2">
                ({Math.round((score.correct / score.total) * 100)}%)
              </span>
            </div>
          </div>
        )}

        {!currentQuestion ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
              <Volume2 className="w-12 h-12 text-violet-400" />
            </div>
            <p className="text-slate-400 mb-6">听和弦，辨别类型</p>
            <button
              onClick={startNewQuestion}
              className="flex items-center gap-2 px-8 py-4 mx-auto bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-400 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
            >
              <Play className="w-5 h-5" fill="white" />
              开始训练
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50 text-center">
              <p className="text-slate-400 mb-4">根音: {midiToNoteName(currentQuestion.rootNote)}</p>

              <button
                onClick={replayQuestion}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/30"
              >
                <Volume2 className="w-8 h-8 text-white" />
              </button>
              <p className="text-slate-500 text-sm mt-3">点击重播</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {CHORD_TYPES.map((type) => {
                const isSelected = selectedAnswer === type;
                const isCorrectAnswer = type === currentQuestion.chordType;
                const showCorrect = showResult && isCorrectAnswer;
                const showWrong = showResult && isSelected && !isCorrectAnswer;

                return (
                  <button
                    key={type}
                    onClick={() => handleAnswer(type)}
                    disabled={showResult}
                    className={cn(
                      'relative p-6 rounded-xl font-medium text-lg transition-all',
                      'bg-slate-800/50 border border-slate-700/50',
                      'hover:bg-slate-700/50 hover:border-slate-600',
                      showCorrect && 'bg-emerald-500/20 border-emerald-500/50',
                      showWrong && 'bg-red-500/20 border-red-500/50',
                      isSelected && !showResult && 'bg-violet-500/20 border-violet-500/50',
                      showResult && !showCorrect && !showWrong && 'opacity-50',
                      !showResult && 'hover:scale-[1.02] active:scale-[0.98]'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br',
                        CHORD_COLORS[type],
                        'opacity-60'
                      )}
                    />
                    <span
                      className={cn(
                        'block',
                        showCorrect && 'text-emerald-400',
                        showWrong && 'text-red-400',
                        !showResult && 'text-slate-200'
                      )}
                    >
                      {CHORD_NAMES[type]}
                    </span>
                    {showCorrect && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
                    )}
                    {showWrong && (
                      <XCircle className="absolute top-3 right-3 w-5 h-5 text-red-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div
                className={cn(
                  'p-4 rounded-xl text-center',
                  selectedAnswer === currentQuestion.chordType
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {selectedAnswer === currentQuestion.chordType ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-medium text-lg">正确！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-red-400 font-medium text-lg">
                        错误，正确答案是 {CHORD_NAMES[currentQuestion.chordType]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {showResult && (
              <div className="flex justify-center">
                <button
                  onClick={startNewQuestion}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
                >
                  <ChevronRight className="w-5 h-5" />
                  下一题
                </button>
              </div>
            )}
          </div>
        )}

        {currentQuestion && !showResult && (
          <div className="flex justify-center">
            <button
              onClick={startNewQuestion}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              换一题
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
