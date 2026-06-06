import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { scenes } from '@/data/initialData';
import type { SceneType } from '@/types';
import { Home, LogOut, Moon, Music } from 'lucide-react';

const sceneIcons: Record<SceneType, React.ReactNode> = {
  home: <Home className="w-5 h-5" />,
  away: <LogOut className="w-5 h-5" />,
  sleep: <Moon className="w-5 h-5" />,
  party: <Music className="w-5 h-5" />,
};

export const SceneMode = () => {
  const { activeScene, applySceneMode } = useSmartHomeStore();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex gap-3 p-2 bg-gray-900/80 border border-gray-700 rounded-2xl backdrop-blur-md shadow-xl">
        {scenes.map((scene) => {
          const isActive = activeScene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => applySceneMode(scene.id)}
              className={`group relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className={isActive ? 'animate-pulse' : ''}>
                {sceneIcons[scene.id]}
              </div>
              <span className="text-xs font-medium">{scene.name}</span>
              
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
