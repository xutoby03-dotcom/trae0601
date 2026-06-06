import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import { useTestStore } from '@/store/useTestStore';
import { questions } from '@/data/questions';

export default function Test() {
  const navigate = useNavigate();
  const {
    currentQuestion,
    answers,
    startTest,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitTest,
  } = useTestStore();

  const [intensity, setIntensity] = useState(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    startTest();
  }, [startTest]);

  useEffect(() => {
    const currentAnswer = answers.find(
      (a) => a.questionId === questions[currentQuestion].id
    );
    if (currentAnswer) {
      setSelectedOption(currentAnswer.selectedOption);
      setIntensity(currentAnswer.intensity);
    } else {
      setSelectedOption(null);
      setIntensity(3);
    }
  }, [currentQuestion, answers]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = selectedOption !== null;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (isAnswered) {
      selectAnswer(question.id, selectedOption!, intensity);
      if (isLastQuestion) {
        handleSubmit();
      } else {
        nextQuestion();
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      if (isAnswered) {
        selectAnswer(question.id, selectedOption!, intensity);
      }
      prevQuestion();
    }
  };

  const handleSubmit = () => {
    selectAnswer(question.id, selectedOption!, intensity);
    submitTest();
    navigate('/result');
  };

  const intensityLabels = ['轻微', '有点', '一般', '比较', '非常'];

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/60 text-sm">
                第 {currentQuestion + 1} / {questions.length} 题
              </span>
              <span className="text-neon-pink font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-neon-pink to-neon-purple"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="glass-card p-8 mb-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-relaxed">
              {question.scenario}
            </h2>

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`w-full p-5 rounded-2xl text-left transition-all duration-300 ${
                    selectedOption === index
                      ? 'bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border-2 border-neon-pink/50 scale-105'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                        selectedOption === index
                          ? 'bg-gradient-to-r from-neon-pink to-neon-purple'
                          : 'bg-white/20'
                      }`}
                    >
                      {selectedOption === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                    </div>
                    <span
                      className={`text-lg ${
                        selectedOption === index
                          ? 'text-white font-medium'
                          : 'text-white/80'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="animate-slide-up">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/60 text-sm">认同程度</span>
                <span className="text-neon-cyan font-semibold">
                  {intensityLabels[intensity - 1]}
                </span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 px-1">
                  {intensityLabels.map((label, i) => (
                    <span
                      key={i}
                      className={`text-xs transition-colors duration-300 ${
                        i + 1 === intensity
                          ? 'text-white font-medium'
                          : 'text-white/40'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className={`btn-secondary flex items-center ${
                currentQuestion === 0 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              上一题
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`btn-primary flex items-center ${
                !isAnswered ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLastQuestion ? (
                <>
                  提交测试
                  <Send className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  下一题
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
