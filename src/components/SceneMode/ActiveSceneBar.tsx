import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import type { SceneType } from '@/types';
import { Home, LogOut, Moon, Music, Clock, Sparkles } from 'lucide-react';

const sceneConfig: Record<SceneType, { name: string; icon: React.ReactNode; color: string }> = {
  home: {
    name: '回家模式',
    icon: <Home className="w-4 h-4" />,
    color: 'from-cyan-500 to-blue-600',
  },
  away: {
    name: '离家模式',
    icon: <LogOut className="w-4 h-4" />,
    color: 'from-amber-500 to-orange-600',
  },
  sleep: {
    name: '睡眠模式',
    icon: <Moon className="w-4 h-4" />,
    color: 'from-purple-500 to-indigo-600',
  },
  party: {
    name: '派对模式',
    icon: <Music className="w-4 h-4" />,
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
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 border border-gray-700/50 rounded-full backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">尚未选择场景</span>
        </div>
      </div>
    );
  }

  const config = sceneConfig[activeScene];

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20">
      <div className={`flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${config.color} rounded-full shadow-lg shadow-black/30 animate-slide-in`}>
        <div className="flex items-center gap-1.5">
          {config.icon}
          <span className="text-sm font-medium text-white">{config.name}</span>
        </div>
        <div className="w-px h-4 bg-white/30" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white/80" />
          <span className="text-xs text-white/80">
            {formatTime(activeSceneTimestamp)} 激活
          </span>
        </div>
      </div>
    </div>
  );
};
