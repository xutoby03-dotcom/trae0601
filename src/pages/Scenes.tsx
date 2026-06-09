import { useStore } from '@/store';
import { Plus, Play, Film, Gamepad2, Music, Tv, Headphones, Radio, BookOpen, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sceneIconMap: Record<string, React.ElementType> = {
  Film,
  Gamepad2,
  Music,
  Tv,
  Headphones,
  Radio,
  BookOpen,
  Coffee,
};

export default function Scenes() {
  const navigate = useNavigate();
  const scenes = useStore((s) => s.scenes);
  const sceneDevices = useStore((s) => s.sceneDevices);
  const activeSceneId = useStore((s) => s.activeSceneId);
  const activateScene = useStore((s) => s.activateScene);

  const getDeviceCount = (sceneId: string) =>
    sceneDevices.filter((sd) => sd.sceneId === sceneId).length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">场景管理</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/scenes/new')}
        >
          <Plus size={16} />
          创建场景
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map((scene) => {
          const isActive = activeSceneId === scene.id;
          const Icon = sceneIconMap[scene.icon] || Film;
          const deviceCount = getDeviceCount(scene.id);

          return (
            <div
              key={scene.id}
              className={`card-glass p-4 cursor-pointer transition-all duration-200 hover:border-white/20 ${
                isActive ? 'animate-pulse-glow border-amber-400/60' : ''
              }`}
              onClick={() => navigate(`/scenes/${scene.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/60'
                }`}>
                  <Icon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg truncate">{scene.name}</span>
                    {isActive && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        已激活
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {scene.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-xs bg-white/5 text-[var(--text-secondary)] px-2 py-1 rounded-md">
                  {deviceCount} 个设备
                </span>
                <button
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    activateScene(scene.id);
                  }}
                >
                  <Play size={12} />
                  激活
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {scenes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
          <Film size={48} className="mb-4 opacity-30" />
          <p className="text-lg">还没有场景</p>
          <p className="text-sm mt-1">点击上方按钮创建第一个场景</p>
        </div>
      )}
    </div>
  );
}
