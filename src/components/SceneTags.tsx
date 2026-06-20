import { SCENE_COLORS, SCENE_ICONS, SCENE_LABELS } from '@/types';
import type { SceneType } from '@/types';

interface SceneTagsProps {
  scenes: SceneType[];
  size?: 'sm' | 'md';
}

export function SceneTags({ scenes, size = 'sm' }: SceneTagsProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm';
  
  return (
    <div className="flex flex-wrap gap-2">
      {scenes.map((scene) => (
        <span
          key={scene}
          className={`inline-flex items-center gap-1 rounded-full font-medium ${SCENE_COLORS[scene]} ${sizeClasses}`}
        >
          <span>{SCENE_ICONS[scene]}</span>
          <span>{SCENE_LABELS[scene]}</span>
        </span>
      ))}
    </div>
  );
}

interface SceneFilterProps {
  current: SceneType | 'all';
  onChange: (scene: SceneType | 'all') => void;
}

export function SceneFilter({ current, onChange }: SceneFilterProps) {
  const scenes: (SceneType | 'all')[] = ['all', 'commute', 'date', 'rainy', 'bedtime'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {scenes.map((scene) => {
        const isActive = current === scene;
        const label = scene === 'all' ? '全部' : SCENE_LABELS[scene];
        const icon = scene === 'all' ? '✨' : SCENE_ICONS[scene];
        
        return (
          <button
            key={scene}
            onClick={() => onChange(scene)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-stone-800 text-white shadow-md'
                : 'bg-white text-stone-600 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
