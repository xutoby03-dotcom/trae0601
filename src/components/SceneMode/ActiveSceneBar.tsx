import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import type { SceneType } from '@/types';
import { Home, LogOut, Moon, Music, Clock, Sparkles } from 'lucide-react';

const sceneConfig: Record<SceneType, { name: string; icon: React.ReactNode; color: string }> = {
  home: {
    name: '回家模式',
    icon: <Home className="w-3.5 h-3.5" />,
    color: 'from-cyan-500 to-blue-600',
  },
  away: {
    name: '离家模式',
    icon: <LogOut className="w-3.5 h-3.5" />,
    color: 'from-amber-500 to-orange-600',
  },
  sleep: {
    name: '睡眠模式',
    icon: <Moon className="w-3.5 h-3.5" />,
    color: 'from-purple-500 to-indigo-600',
  },
  party: {
    name: '派对模式',
    icon: <Music className="w-3.5 h-3.5" />,
    color: 'from-pink-500 to-rose-600',
  },
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const ActiveSceneBar = () => {
  const { activeScene, activeSceneTimestamp } = useSmartHomeStore();

  if (!activeScene || !activeSceneTimestamp) {
    return (
      <div className="flex items-center justify-center gap-2 py-1.5">
        <Sparkles className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-500">尚未选择场景</span>
      </div>
    );
  }

  const config = sceneConfig[activeScene];

  return (
    <div className={`flex items-center justify-center gap-2 py-1.5 px-3 mx-2 bg-gradient-to-r ${config.color} rounded-xl shadow-md animate-fade-in`}>
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span className="text-xs font-medium text-white">{config.name}</span>
      </div>
      <div className="w-px h-3 bg-white/30" />
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-white/80" />
        <span className="text-[11px] text-white/80">
          {formatTime(activeSceneTimestamp)} 激活
        </span>
      </div>
    </div>
  );
};
