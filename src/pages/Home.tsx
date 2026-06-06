import { motion } from 'framer-motion';
import { SpreadCard } from '@/components/SpreadCard';
import { spreads } from '@/data/spreads';
import { History, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 text-gradient-gold">
            神秘塔罗
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            探索命运的奥秘，聆听内心的声音
            <br />
            选择一个牌阵，开启你的占卜之旅
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {spreads.map((spread, index) => (
            <SpreadCard key={spread.id} spread={spread} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/history')}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-glass border border-gold card-shadow hover:shadow-lg transition-all"
          >
            <History className="w-5 h-5 text-gold" />
            <span className="text-gold">查看历史记录</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">78张完整塔罗牌 · 正逆位解读 · 四种经典牌阵</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
            塔罗占卜仅供娱乐参考，命运掌握在自己手中
          </p>
        </motion.div>
      </div>
    </div>
  );
}
