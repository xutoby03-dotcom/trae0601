import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Timer, Music, Headphones, Piano, BarChart3, Sparkles, Flame } from 'lucide-react';
import { getTodayStats } from '@/utils/storage';
import { cn } from '@/lib/utils';

const cards = [
  {
    to: '/metronome',
    title: '节拍器',
    description: 'BPM 30-300 可调，支持多种节拍',
    icon: Timer,
    gradient: 'from-violet-500 to-indigo-600',
    glow: 'shadow-violet-500/25',
  },
  {
    to: '/rhythm',
    title: '节奏训练',
    description: '跟打节奏型，实时判定准确率',
    icon: Music,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/25',
  },
  {
    to: '/ear-training',
    title: '听音训练',
    description: '五级难度，从单音到七和弦',
    icon: Headphones,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/25',
  },
  {
    to: '/chord-training',
    title: '和弦识别',
    description: '分辨大三、小三、减、增和弦',
    icon: Piano,
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'shadow-blue-500/25',
  },
  {
    to: '/statistics',
    title: '学习统计',
    description: '查看练习数据，追踪进步',
    icon: BarChart3,
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/25',
    showBadge: true,
  },
];

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins}分钟`;
};

export default function Home() {
  const navigate = useNavigate();
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    const today = getTodayStats();
    if (today) {
      setTodayMinutes(Math.floor(today.practiceDuration / 60));
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-violet-300 text-sm font-medium">音乐练耳神器</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            音乐训练工具箱
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            节拍训练、听音练习、和弦识别，一站式提升你的音乐素养
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className={cn(
                'group relative p-6 rounded-2xl text-left transition-all duration-300',
                'bg-slate-800/30 border border-slate-700/50',
                'hover:bg-slate-800/50 hover:border-slate-600',
                'hover:scale-[1.02] active:scale-[0.98]',
                index === 0 && 'sm:col-span-2 lg:col-span-1'
              )}
            >
              {card.showBadge && todayMinutes > 0 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/30">
                    <Flame className="w-3.5 h-3.5 text-white" />
                    <span className="text-white text-xs font-bold">今日 {formatDuration(todayMinutes * 60)}</span>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg',
                  card.gradient,
                  card.glow,
                  'group-hover:scale-110 transition-transform duration-300'
                )}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-slate-400 text-sm">{card.description}</p>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)`,
                  opacity: 0.05,
                }}
              />
            </button>
          ))}
        </div>

        <div className="mt-10 p-6 bg-slate-800/20 rounded-2xl border border-slate-700/30">
          <h3 className="text-white font-medium mb-2">💡 使用提示</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• 建议先从节拍器开始，找到稳定的节奏感</li>
            <li>• 节奏训练和听音训练建议每天练习 10-15 分钟</li>
            <li>• 循序渐进，从简单难度开始，逐步提升</li>
            <li>• 所有练习数据会自动保存，可在统计中查看</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
