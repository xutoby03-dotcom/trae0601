import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shuffle, Sparkles } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { getSpreadById } from '@/data/spreads';
import { CardFan } from '@/components/CardFan';
import { TarotCard } from '@/components/TarotCard';

export default function Reading() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();
  const spread = spreadId ? getSpreadById(spreadId) : undefined;

  const {
    question,
    setQuestion,
    startReading,
    shuffledDeck,
    drawnCards,
    drawCard,
    isComplete
  } = useReadingStore();

  const [step, setStep] = useState<'question' | 'drawing'>('question');
  const [showFlipAnimation, setShowFlipAnimation] = useState(false);
  const [flippingCard, setFlippingCard] = useState<number | null>(null);

  useEffect(() => {
    if (!spread) {
      navigate('/');
    }
  }, [spread, navigate]);

  const handleStart = () => {
    if (!question.trim()) return;
    startReading();
    setStep('drawing');
  };

  const handleCardClick = (index: number) => {
    if (!spread || drawnCards.length >= spread.cardCount) return;

    setFlippingCard(index);
    setShowFlipAnimation(true);

    setTimeout(() => {
      const isComplete = drawCard(index);
      setShowFlipAnimation(false);
      setFlippingCard(null);

      if (isComplete) {
        setTimeout(() => {
          navigate(`/reading/${spreadId}/interpretation`);
        }, 1000);
      }
    }, 800);
  };

  if (!spread) return null;

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-gold hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-5xl mb-6 animate-float">{spread.icon}</div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gradient-gold">
                {spread.name}
              </h1>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {spread.description}
                <br />
                共 {spread.cardCount} 张牌
              </p>

              <div className="max-w-xl mx-auto bg-glass card-shadow rounded-2xl p-8 border border-gold">
                <label className="block text-left mb-3 text-lg font-medium">
                  请在心中默念你的问题
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例如：我的事业近期会有什么发展？"
                  className="w-full h-32 p-4 rounded-xl bg-transparent border-2 border-gold border-opacity-30 focus:border-opacity-100 outline-none resize-none transition-all placeholder-opacity-50"
                  style={{ color: 'var(--text-primary)' }}
                />
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Sparkles className="w-4 h-4" />
                    <span>静心冥想，专注于你的问题</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    disabled={!question.trim()}
                    className="px-8 py-3 rounded-full bg-gold text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Shuffle className="w-5 h-5" />
                    开始抽牌
                  </motion.button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">牌阵位置</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {spread.positions.map((pos, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-full bg-glass border border-gold text-sm"
                    >
                      {i + 1}. {pos.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-gradient-gold">
                {spread.name}
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                你的问题：{question}
              </p>
              <p className="mb-8 text-gold">
                已抽取 {drawnCards.length} / {spread.cardCount} 张牌
              </p>

              <div className="mb-8">
                {spread.positions[drawnCards.length] && (
                  <motion.div
                    key={drawnCards.length}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-6 py-3 rounded-full bg-gold bg-opacity-20 text-gold animate-pulse"
                  >
                    请选择第 {drawnCards.length + 1} 张牌 · {spread.positions[drawnCards.length].name}
                  </motion.div>
                )}
              </div>

              <CardFan
                cards={shuffledDeck}
                onCardClick={handleCardClick}
                disabled={showFlipAnimation}
              />

              {drawnCards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <h3 className="text-lg font-medium mb-6">已抽取的牌</h3>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {drawnCards.map((dc, i) => (
                      <TarotCard
                        key={i}
                        card={dc.card}
                        isFlipped={true}
                        isReversed={dc.isReversed}
                        size="sm"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
