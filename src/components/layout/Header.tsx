import { Calendar, Clock, Heart } from 'lucide-react';
import { weddingInfo } from '@/data/mockData';
import { getCountdownText } from '@/utils/timeUtils';
import { useEffect, useState } from 'react';

export function Header() {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownText(`${weddingInfo.date} 08:00`));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-ivory/80 backdrop-blur-md border-b border-rose-gold/10">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-goldLight to-wine flex items-center justify-center shadow-glow">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-display text-lg text-wine font-semibold leading-tight">
                {weddingInfo.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-warm-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {weddingInfo.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {countdown}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-warm-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>进行中</span>
          </div>
        </div>
      </div>
    </header>
  );
}
