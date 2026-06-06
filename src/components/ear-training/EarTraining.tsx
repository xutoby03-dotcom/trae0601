import { useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { VirtualPiano } from '@/components/piano/VirtualPiano';
import type { EarTrainingDifficulty, EarTrainingResult, EarTrainingQuestion } from '@/types';
import { playChord, playNote, midiToNoteName, resumeAudioContext } from '@/utils/audio';
import { getRandomRootNote, getChordNotes, getSeventhChordNotes } from '@/utils/musicTheory';
import { saveEarResult, updateDailyStats } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const DIFFICULTIES: { value: EarTrainingDifficulty; label: string; description: string }[] = [
  { value: 'single', label: '单音', description: '听单个音符' },
  { value: 'double', label: '双音', description: '听两个音的音程' },
  { value: 'interval', label: '和弦', description: '听三个音的组合' },
  { value: 'triad', label: '三和弦', description: '分辨和弦类型' },
  { value: 'seventh', label: '七和弦', description: '分辨七和弦类型' },
];

const generateQuestion = (difficulty: EarTrainingDifficulty): EarTrainingQuestion => {
  const root = getRandomRootNote(55, 67);

  let notes: number[] = [];

  switch (difficulty) {
    case 'single':
      notes = [root];
      break;
    case 'double': {
      const interval = Math.floor(Math.random() * 12) + 1;
      notes = [root, root + interval];
      break;
    }
    case 'interval': {
      const chordType = ['major', 'minor'] as const;
      const type = chordType[Math.floor(Math.random() * chordType.length)];
      notes = getChordNotes(root, type);
      break;
    }
    case 'triad': {
      const chordType = ['major', 'minor', 'diminished', 'augmented'] as const;
      const type = chordType[Math.floor(Math.random() * chordType.length)];
      notes = getChordNotes(root, type);
      break;
    }
    case 'seventh': {
      const types = ['dominant', 'major', 'minor', 'diminished'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      notes = getSeventhChordNotes(root, type);
      break;
    }
  }

  return {
    id: Date.now().toString(),
    difficulty,
    notes,
  };
};

export const EarTraining = () => {
  const { earDifficulty, setEarDifficulty, addEarResult } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState<EarTrainingQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [correctNotes, setCorrectNotes] = useState<number[]>([]);
  const [wrongNotes, setWrongNotes] = useState<number[]>([]);

  const startNewQuestion = useCallback(async () => {
    await resumeAudioContext();
    const question = generateQuestion(earDifficulty);
    setCurrentQuestion(question);
    setUserAnswer([]);
    setShowResult(false);
    setCorrectNotes([]);
    setWrongNotes([]);

    setTimeout(() => {
      playQuestion(question);
    }, 300);
  }, [earDifficulty]);

  const playQuestion = useCallback((question: EarTrainingQuestion) => {
    if (question.notes.length === 1) {
      playNote(question.notes[0], 1.0, 0.5);
    } else {
      playChord(question.notes, 1.5, 0.4);
    }
  }, []);

  const replayQuestion = () => {
    if (currentQuestion) {
      playQuestion(currentQuestion);
    }
  };

  const handleKeyPress = useCallback(
    (midi: number) => {
      if (!currentQuestion || showResult) return;

      const newAnswer = [...userAnswer];

      if (earDifficulty === 'single') {
        newAnswer[0] = midi;
      } else {
        const existingIndex = newAnswer.indexOf(midi);
        if (existingIndex >= 0) {
          newAnswer.splice(existingIndex, 1);
        } else if (newAnswer.length < currentQuestion.notes.length) {
          newAnswer.push(midi);
        }
      }

      setUserAnswer(newAnswer);

      if (newAnswer.length === currentQuestion.notes.length) {
        checkAnswer(newAnswer);
      }
    },
    [currentQuestion, userAnswer, showResult, earDifficulty]
  );

  const checkAnswer = (answer: number[]) => {
    if (!currentQuestion) return;

    const correctSet = new Set(currentQuestion.notes);
    const answerSet = new Set(answer);

    let correct = true;
    if (correctSet.size !== answerSet.size) {
      correct = false;
    } else {
      for (const note of correctSet) {
        if (!answerSet.has(note)) {
          correct = false;
          break;
        }
      }
    }

    setIsCorrect(correct);
    setShowResult(true);
    setCorrectNotes(currentQuestion.notes);

    if (!correct) {
      const wrong: number[] = [];
      for (const note of answer) {
        if (!correctSet.has(note)) {
          wrong.push(note);
        }
      }
      setWrongNotes(wrong);
    }

    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    const result: EarTrainingResult = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      isCorrect: correct,
      timestamp: Date.now(),
    };

    saveEarResult(result);
    addEarResult(result);
    updateDailyStats('ear', correct, 5);
  };

  const getRequiredCount = () => {
    if (!currentQuestion) return 1;
    return currentQuestion.notes.length;
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">听音训练</h1>
      <p className="text-slate-400 mb-6">
        {currentQuestion
          ? `已选择 ${userAnswer.length} / ${getRequiredCount()} 个音`
          : '选择难度，开始训练'}
      </p>

      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-wrap justify-center gap-2">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => {
                setEarDifficulty(diff.value);
                setCurrentQuestion(null);
                setUserAnswer([]);
                setShowResult(false);
              }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                earDifficulty === diff.value
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              )}
            >
              {diff.label}
            </button>
          ))}
        </div>

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
            <Volume2 className="w-16 h-16 text-violet-500/50 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">准备好听音训练了吗？</p>
            <button
              onClick={startNewQuestion}
              className="flex items-center gap-2 px-8 py-4 mx-auto bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-400 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
            >
              <Play className="w-5 h-5" fill="white" />
              开始训练
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              <button
                onClick={replayQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-all hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
                重听
              </button>

              {showResult && (
                <button
                  onClick={startNewQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                  下一题
                </button>
              )}
            </div>

            {showResult && (
              <div
                className={cn(
                  'p-4 rounded-xl text-center',
                  isCorrect
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-medium text-lg">正确！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-red-400 font-medium text-lg">错误</span>
                    </>
                  )}
                </div>
                {!isCorrect && (
                  <p className="text-slate-400 mt-2 text-sm">
                    正确答案: {currentQuestion.notes.map((n) => midiToNoteName(n)).join(' + ')}
                  </p>
                )}
              </div>
            )}

            {earDifficulty !== 'single' && userAnswer.length > 0 && !showResult && (
              <div className="flex justify-center gap-2">
                {userAnswer.map((note, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-sm font-mono"
                  >
                    {midiToNoteName(note)}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-center overflow-x-auto py-4">
              <VirtualPiano
                startMidi={48}
                endMidi={72}
                highlightedNotes={showResult ? correctNotes : []}
                correctNotes={showResult && isCorrect ? correctNotes : []}
                wrongNotes={showResult && !isCorrect ? wrongNotes : []}
                onKeyPress={handleKeyPress}
                disabled={showResult}
              />
            </div>

            <p className="text-center text-slate-500 text-sm">
              {earDifficulty === 'single'
                ? '点击钢琴键选择你听到的音符'
                : `点击钢琴键选择 ${getRequiredCount()} 个音，再次点击可取消`}
            </p>
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
