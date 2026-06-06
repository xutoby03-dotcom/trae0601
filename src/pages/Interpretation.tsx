import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Home, RotateCcw } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { getSpreadById } from '@/data/spreads';
import { InterpretationCard } from '@/components/InterpretationCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { cancel as cancelSpeech } from '@/utils/speech';

export default function Interpretation() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();
  const spread = spreadId ? getSpreadById(spreadId) : undefined;

  const {
    question,
    drawnCards,
    generateInterpretation,
    saveToHistory,
    resetReading,
    isComplete
  } = useReadingStore();

  const [interpretation, setInterpretation] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isComplete || drawnCards.length === 0) {
      navigate('/');
    } else {
      setInterpretation(generateInterpretation());
    }
  }, [isComplete, drawnCards, navigate, generateInterpretation]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const handleSave = () => {
    saveToHistory();
    setSaved(true);
  };

  const handleNewReading = () => {
    resetReading();
    navigate('/');
  };

  if (!spread || drawnCards.length === 0) return null;

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <AudioPlayer text={interpretation} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="text-4xl mb-4">{spread.icon}</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-gradient-gold">
            {spread.name}解读
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
            问题：{question}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-glass border border-gold disabled:opacity-50 hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4 text-gold" />
              <span className="text-gold">{saved ? '已保存' : '保存到历史'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewReading}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gold text-white hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新占卜</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="space-y-6 mb-12">
          {drawnCards.map((dc, index) => (
            <InterpretationCard key={index} drawnCard={dc} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + drawnCards.length * 0.2 }}
          className="bg-glass card-shadow rounded-2xl p-8 border border-gold"
        >
          <h2 className="font-display text-2xl font-bold mb-6 text-gradient-gold text-center">
            综合解读
          </h2>
          <div className="prose prose-lg max-w-none">
            {interpretation.split('\n').map((line, i) => (
              <p
                key={i}
                className="leading-relaxed mb-3"
                style={{ color: line.startsWith('【') ? 'var(--accent-gold)' : 'var(--text-primary)' }}
              >
                {line.startsWith('【') ? (
                  <span className="font-bold">{line}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + drawnCards.length * 0.2 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-glass border border-gold hover:shadow-lg transition-all"
          >
            <Home className="w-5 h-5 text-gold" />
            <span className="text-gold">回到首页</span>
          </button>
          <p className="mt-6 text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            塔罗占卜仅供娱乐参考，命运掌握在自己手中
          </p>
        </motion.div>
      </div>
    </div>
  );
}
