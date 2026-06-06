import { Spread } from '@/types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useReadingStore } from '@/store/useReadingStore';
import { ChevronRight } from 'lucide-react';

interface SpreadCardProps {
  spread: Spread;
  index: number;
}

export function SpreadCard({ spread, index }: SpreadCardProps) {
  const navigate = useNavigate();
  const setSpread = useReadingStore(state => state.setSpread);

  const handleClick = () => {
    setSpread(spread.id);
    navigate(`/reading/${spread.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <div className="bg-glass card-shadow rounded-2xl p-6 h-full border border-gold hover:border-opacity-100 transition-all group">
        <div className="text-5xl mb-4 text-center">{spread.icon}</div>
        <h3 className="font-display text-xl font-bold text-center mb-2 text-gradient-gold">
          {spread.name}
        </h3>
        <p className="text-sm text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
          {spread.description}
        </p>
        <div className="flex items-center justify-center gap-2 text-gold text-sm">
          <span>{spread.cardCount}张牌</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}
