import { DrawnCard } from '@/types';
import { TarotCard } from './TarotCard';
import { motion } from 'framer-motion';

interface InterpretationCardProps {
  drawnCard: DrawnCard;
  index: number;
}

export function InterpretationCard({ drawnCard, index }: InterpretationCardProps) {
  const { card, position, isReversed } = drawnCard;
  const meaning = isReversed ? card.meaning.reversed : card.meaning.upright;
  const keywords = isReversed ? card.keywords.reversed : card.keywords.upright;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      className="bg-glass card-shadow rounded-2xl p-6 border border-gold"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 flex justify-center">
          <TarotCard
            card={card}
            isFlipped={true}
            isReversed={isReversed}
            size="lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gold bg-opacity-20 text-gold">
              {position.name}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isReversed ? 'bg-red-500 bg-opacity-20 text-red-400' : 'bg-green-500 bg-opacity-20 text-green-400'
            }`}>
              {isReversed ? '逆位' : '正位'}
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-gradient-gold mb-2">
            {card.name}
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {position.meaning}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'var(--accent-gold)', opacity: 0.2, color: 'var(--accent-gold)' }}
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {meaning}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
