import { TarotCard } from '@/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CardFanProps {
  cards: TarotCard[];
  onCardClick: (index: number) => void;
  disabled?: boolean;
}

export function CardFan({ cards, onCardClick, disabled = false }: CardFanProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayCount = Math.min(cards.length, 30);
  const totalRotation = 140;
  const startRotation = -totalRotation / 2;
  const rotationStep = displayCount > 1 ? totalRotation / (displayCount - 1) : 0;

  return (
    <div className="relative w-full h-96 md:h-[28rem] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div 
          className="w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--accent-gold)' }}
        />
      </motion.div>
      
      {cards.slice(0, displayCount).map((card, index) => {
        const rotation = startRotation + (index % displayCount) * rotationStep;
        const isHovered = hoveredIndex === index;

        return (
          <motion.div
            key={`${card.id}-${index}`}
            className="absolute origin-bottom cursor-pointer"
            style={{
              rotate: rotation,
              zIndex: isHovered ? 100 : index
            }}
            initial={{ y: 100, opacity: 0, rotate: rotation * 1.5 }}
            animate={{
              y: isHovered ? -80 : 0,
              scale: isHovered ? 1.15 : 1,
              rotate: isHovered ? rotation * 0.4 : rotation,
              opacity: 1
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 350, 
              damping: 25,
              delay: index * 0.02
            }}
            onMouseEnter={() => !disabled && setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => !disabled && onCardClick(index)}
          >
            <div className="w-24 h-36 md:w-28 md:h-44 rounded-xl overflow-hidden border-2 card-shadow relative" style={{ borderColor: 'var(--accent-gold)' }}>
              <div
                className="w-full h-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #16213e 75%, #1a1a3e 100%)'
                }}
              >
                <div className="absolute inset-3 border-2 rounded-lg opacity-50" style={{ borderColor: 'var(--accent-gold)' }} />
                <div className="absolute inset-5 border rounded-lg opacity-30" style={{ borderColor: 'var(--accent-gold)' }} />
                
                <motion.div
                  animate={{ 
                    scale: isHovered ? [1, 1.3, 1] : 1,
                    rotate: isHovered ? [0, 15, -15, 0] : 0
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl relative z-10"
                >
                  ✨
                </motion.div>

                <div className="absolute top-2 left-2 text-lg opacity-50">☽</div>
                <div className="absolute top-2 right-2 text-lg opacity-50">☾</div>
                <div className="absolute bottom-2 left-2 text-lg opacity-50">☆</div>
                <div className="absolute bottom-2 right-2 text-lg opacity-50">★</div>

                <div className="absolute top-1/2 left-2 right-2 h-px opacity-30" style={{ background: 'var(--accent-gold)' }} />
                <div className="absolute top-2 bottom-2 left-1/2 w-px opacity-30" style={{ background: 'var(--accent-gold)' }} />
              </div>
              
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: '0 0 30px var(--accent-gold), 0 0 60px var(--accent)',
                    opacity: 0.6
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
      {cards.length > displayCount && (
        <div className="absolute bottom-0 text-center w-full" style={{ color: 'var(--text-secondary)' }}>
          共 {cards.length} 张牌，仅展示前 {displayCount} 张
        </div>
      )}
    </div>
  );
}
