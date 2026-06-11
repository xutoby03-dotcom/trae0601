import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCountdown, type CountdownResult } from '../utils/date';
import { cn } from '../lib/utils';

interface CountdownProps {
  targetDate: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function FlipDigit({ value, isUrgent }: { value: number; isUrgent: boolean }) {
  const displayValue = value.toString().padStart(2, '0');
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayValue}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'inline-block font-bold tabular-nums',
          isUrgent && 'text-red-500 animate-pulse'
        )}
      >
        {displayValue}
      </motion.span>
    </AnimatePresence>
  );
}

export default function Countdown({ targetDate, size = 'lg', showLabel = true }: CountdownProps) {
  const [countdown, setCountdown] = useState<CountdownResult>(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  useEffect(() => {
    setCountdown(getCountdown(targetDate));
  }, [targetDate]);

  const sizeClasses = {
    sm: 'text-xl gap-1',
    md: 'text-3xl gap-2',
    lg: 'text-6xl gap-3',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (countdown.isPast) {
    return (
      <div className={cn('font-bold text-neon-green', size === 'lg' ? 'text-4xl' : 'text-xl')}>
        开票中！
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={cn('flex items-center font-orbitron', sizeClasses[size])}>
        <div className="flex flex-col items-center">
          <FlipDigit value={countdown.days} isUrgent={countdown.isUrgent} />
          {showLabel && (
            <span className={cn('text-gray-400 mt-1', labelSizeClasses[size])}>天</span>
          )}
        </div>
        <span className={cn('mx-1 text-neon-pink', countdown.isUrgent && 'text-red-500')}>:</span>
        <div className="flex flex-col items-center">
          <FlipDigit value={countdown.hours} isUrgent={countdown.isUrgent} />
          {showLabel && (
            <span className={cn('text-gray-400 mt-1', labelSizeClasses[size])}>时</span>
          )}
        </div>
        <span className={cn('mx-1 text-neon-pink', countdown.isUrgent && 'text-red-500')}>:</span>
        <div className="flex flex-col items-center">
          <FlipDigit value={countdown.minutes} isUrgent={countdown.isUrgent} />
          {showLabel && (
            <span className={cn('text-gray-400 mt-1', labelSizeClasses[size])}>分</span>
          )}
        </div>
        <span className={cn('mx-1 text-neon-pink', countdown.isUrgent && 'text-red-500')}>:</span>
        <div className="flex flex-col items-center">
          <FlipDigit value={countdown.seconds} isUrgent={countdown.isUrgent} />
          {showLabel && (
            <span className={cn('text-gray-400 mt-1', labelSizeClasses[size])}>秒</span>
          )}
        </div>
      </div>
    </div>
  );
}
