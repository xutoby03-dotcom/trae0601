import { useEffect, useState } from 'react';
import { Check, X, AlertTriangle, Pause, SkipForward } from 'lucide-react';
import type { ErrorType } from '@/types';

interface FeedbackToastProps {
  type: 'correct' | 'error';
  errorType?: ErrorType;
  message: string;
  visible: boolean;
}

const errorIcons: Record<ErrorType, { icon: React.ReactNode; color: string; bg: string }> = {
  miss: { icon: <SkipForward className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
  reverse: { icon: <X className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50' },
  detour: { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  pause: { icon: <Pause className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function FeedbackToast({ type, errorType, message, visible }: FeedbackToastProps) {
  if (!visible) return null;

  if (type === 'correct') {
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
        <div className="flex items-center gap-3 px-6 py-3 bg-green-50 border-2 border-green-400 rounded-xl shadow-elegant">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-5 h-5" />
          </div>
          <span className="text-green-700 font-medium">{message}</span>
        </div>
      </div>
    );
  }

  const errorConfig = errorType ? errorIcons[errorType] : errorIcons.miss;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-pulse">
      <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-400 rounded-xl shadow-elegant">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
          {errorConfig.icon}
        </div>
        <span className="text-red-700 font-medium">{message}</span>
      </div>
    </div>
  );
}
