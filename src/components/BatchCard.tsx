import { useState, useEffect } from 'react';
import { Leaf, Flower2, Sparkles, Heart, Apple, Droplets, Clock, User, MapPin } from 'lucide-react';
import { Batch, Tea } from '@/types';
import StatusBadge from './StatusBadge';
import Countdown from './Countdown';
import { calculateProgress, formatTime, formatDateTime } from '@/utils/time';

interface BatchCardProps {
  batch: Batch;
  tea: Tea | undefined;
  onFilter: (batchId: string) => void;
  onView: (batch: Batch) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Leaf: <Leaf className="w-5 h-5" />,
  Flower2: <Flower2 className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Apple: <Apple className="w-5 h-5" />,
};

export default function BatchCard({ batch, tea, onFilter, onView }: BatchCardProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (['filtered', 'off_shelf'].includes(batch.status)) {
      setProgress(100);
      return;
    }
    
    const updateProgress = () => {
      setProgress(calculateProgress(batch.startTime, batch.targetFilterTime));
    };
    
    updateProgress();
    const timer = setInterval(updateProgress, 1000);
    return () => clearInterval(timer);
  }, [batch.startTime, batch.targetFilterTime, batch.status]);
  
  if (!tea) return null;
  
  const isOverdue = batch.status === 'overdue';
  const isReady = batch.status === 'ready';
  
  const progressColor = isOverdue 
    ? 'bg-coral-500' 
    : isReady 
      ? 'bg-amber-500' 
      : 'bg-matcha-500';
  
  const cardBg = isOverdue 
    ? 'bg-coral-50/80 border-coral-200' 
    : isReady 
      ? 'bg-amber-50/80 border-amber-200' 
      : 'bg-white border-gray-100';
  
  return (
    <div
      className={`
        relative rounded-2xl border ${cardBg} p-4 shadow-sm
        transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
        cursor-pointer overflow-hidden
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isOverdue ? 'animate-breathe' : ''}
      `}
      onClick={() => onView(batch)}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: tea.color }} />
      
      <div className="flex items-start justify-between mb-3 pl-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: tea.color }}
          >
            {iconMap[tea.icon] || <Leaf className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 font-serif">{tea.name}</h3>
            <p className="text-xs text-gray-500">桶号 {batch.bucketNumber} · {batch.waterAmountMl}ml</p>
          </div>
        </div>
        <StatusBadge status={batch.status} />
      </div>
      
      <div className="pl-2 space-y-2">
        {batch.status !== 'filtered' && batch.status !== 'off_shelf' ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                剩余时间
              </span>
              <Countdown targetTime={batch.targetFilterTime} size="sm" />
            </div>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColor} transition-all duration-1000 ease-linear rounded-full`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>开始 {formatTime(batch.startTime)}</span>
              <span>目标 {formatTime(batch.targetFilterTime)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Droplets className="w-4 h-4 text-matcha-500" />
                <span>出品 {batch.outputAmountMl || 0}ml</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-amber-500" />
                <span>{batch.operator}</span>
              </div>
              {batch.shelfLocation && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-coral-500" />
                  <span>{batch.shelfLocation}</span>
                </div>
              )}
              {batch.tasteRating !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-amber-500">{'★'.repeat(batch.tasteRating)}</span>
                  <span>口感</span>
                </div>
              )}
            </div>
            
            {batch.actualFilterTime && (
              <p className="text-xs text-gray-400 mt-2">
                过滤时间: {formatDateTime(batch.actualFilterTime)}
              </p>
            )}
          </>
        )}
        
        {batch.status !== 'filtered' && batch.status !== 'off_shelf' && (
          <button
            className={`
              w-full mt-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isOverdue 
                ? 'bg-coral-500 text-white hover:bg-coral-600' 
                : isReady 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-matcha-50 text-matcha-600 hover:bg-matcha-100'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              if (isOverdue || isReady) {
                onFilter(batch.id);
              } else {
                onView(batch);
              }
            }}
          >
            {isOverdue ? '立即过滤' : isReady ? '准备过滤' : '查看详情'}
          </button>
        )}
        
        {batch.status === 'filtered' && batch.lossReason && (
          <p className="text-xs text-gray-400 mt-2">
            损耗 {batch.lossAmountMl}ml · {batch.lossReason}
          </p>
        )}
        
        {batch.status === 'off_shelf' && batch.offShelfReason && (
          <p className="text-xs text-gray-400 mt-2">
            下架原因: {batch.offShelfReason}
          </p>
        )}
      </div>
    </div>
  );
}
