import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/types';
import { useState } from 'react';

interface TarotCardProps {
  card?: TarotCardType;
  isFlipped?: boolean;
  isReversed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function TarotCard({
  card,
  isFlipped = false,
  isReversed = false,
  onClick,
  size = 'md',
  showDetails = false
}: TarotCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-20 h-32',
    md: 'w-28 h-44',
    lg: 'w-40 h-64'
  };

  return (
    <motion.div
      className={`card-perspective ${sizeClasses[size]} cursor-pointer`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!isFlipped ? { y: -20, scale: 1.08, rotateZ: isHovered ? 2 : 0 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateY: isFlipped ? 180 : 0,
          rotate: isReversed && isFlipped ? 180 : 0
        }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute w-full h-full rounded-xl overflow-hidden border-2 card-shadow"
          style={{
            backfaceVisibility: 'hidden',
            borderColor: 'var(--accent-gold)'
          }}
        >
          <div
            className="w-full h-full flex items-center justify-center relative"
            style={{
              background: isHovered
                ? 'linear-gradient(135deg, #3d2066 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a3e 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #16213e 100%)'
            }}
          >
            <div className="absolute inset-3 border-2 rounded-lg opacity-50" style={{ borderColor: 'var(--accent-gold)' }} />
            <div className="absolute inset-5 border rounded-lg opacity-30" style={{ borderColor: 'var(--accent-gold)' }} />
            
            <div className="relative z-10">
              <motion.div
                animate={{ 
                  scale: isHovered ? [1, 1.2, 1] : 1,
                  rotate: isHovered ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                ✨
              </motion.div>
            </div>

            <div className="absolute top-3 left-3 text-xl opacity-60">☽</div>
            <div className="absolute top-3 right-3 text-xl opacity-60">☾</div>
            <div className="absolute bottom-3 left-3 text-xl opacity-60">☆</div>
            <div className="absolute bottom-3 right-3 text-xl opacity-60">★</div>

            <div className="absolute top-1/2 left-3 right-3 h-px opacity-40" style={{ background: 'var(--accent-gold)' }} />
            <div className="absolute top-3 bottom-3 left-1/2 w-px opacity-40" style={{ background: 'var(--accent-gold)' }} />
          </div>
        </div>

        <div
          className="absolute w-full h-full rounded-xl overflow-hidden border-2 card-shadow bg-glass"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderColor: 'var(--accent-gold)'
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-3 relative">
            <div className="absolute inset-2 rounded-lg opacity-30" style={{ border: '1px solid var(--accent-gold)' }} />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-5xl mb-2"
            >
              {card?.image || '🃏'}
            </motion.div>
            
            {size !== 'sm' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-display text-center font-bold text-gradient-gold text-sm"
                >
                  {card?.name}
                </motion.div>
                {showDetails && card && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs mt-1 text-center"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {card.type === 'major' ? '大阿尔卡纳' : '小阿尔卡纳'}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
