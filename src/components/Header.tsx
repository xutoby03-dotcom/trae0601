import { useState, useEffect } from 'react';
import { Flame, BarChart3, Clock } from 'lucide-react';

interface HeaderProps {
  showStats: boolean;
  onToggleStats: () => void;
}

export default function Header({ showStats, onToggleStats }: HeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-espresso-700 via-copper-600 to-copper-500 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
          <Flame className="w-6 h-6 text-copper-200" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide">烘焙批次看板</h1>
          <p className="text-xs text-copper-100/80">Baking Batch Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="font-display text-3xl font-semibold tabular-nums tracking-wider">
            {timeStr}
          </div>
          <div className="text-xs text-copper-100/80 flex items-center gap-2 justify-end">
            <Clock className="w-3 h-3" />
            {dateStr} · {weekdays[now.getDay()]}
          </div>
        </div>

        <button
          onClick={onToggleStats}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
            showStats
              ? 'bg-white text-copper-700 shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {showStats ? '返回看板' : '统计报表'}
        </button>
      </div>
    </header>
  );
}
