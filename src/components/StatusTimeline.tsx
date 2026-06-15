import { Check } from 'lucide-react';
import { OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/types';
import { canAdvanceStatus } from '@/utils/orderUtils';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  onAdvance: (status: OrderStatus) => void;
}

export default function StatusTimeline({ currentStatus, onAdvance }: StatusTimelineProps) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);

  const getDotClass = (index: number) => {
    if (index < currentIndex) {
      return 'bg-matcha-600 border-matcha-600 text-white';
    }
    if (index === currentIndex) {
      return 'bg-amber-500 border-amber-500 text-white scale-110';
    }
    return 'bg-white border-cream-300 text-cream-300';
  };

  const getLineClass = (index: number) => {
    if (index < currentIndex) {
      return 'bg-matcha-600';
    }
    return 'bg-cream-300';
  };

  const handleClick = (index: number, status: OrderStatus) => {
    if (canAdvanceStatus({ status: currentStatus } as any, status)) {
      onAdvance(status);
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between px-1">
        {ORDER_STATUS_FLOW.map((status, index) => {
          const isClickable = canAdvanceStatus({ status: currentStatus } as any, status);
          return (
            <div key={status} className="flex flex-col items-center relative z-10 flex-1">
              <button
                onClick={() => handleClick(index, status)}
                disabled={!isClickable && index !== currentIndex}
                className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 ease-out
                  ${getDotClass(index)}
                  ${isClickable ? 'cursor-pointer hover:scale-125 hover:shadow-md' : 'cursor-default'}
                  ${index === currentIndex ? 'shadow-md animate-pulse' : ''}
                `}
              >
                {index < currentIndex ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </button>
              <span className={`
                mt-1.5 text-[11px] font-medium text-center leading-tight
                ${index <= currentIndex ? 'text-coffee-800' : 'text-coffee-800/40'}
              `}>
                {ORDER_STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}

        <div className="absolute top-3.5 left-3 right-3 h-0.5 flex -z-0">
          {ORDER_STATUS_FLOW.slice(0, -1).map((_, index) => (
            <div
              key={index}
              className={`flex-1 mx-1 h-full rounded-full transition-colors duration-500 ${getLineClass(index)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
