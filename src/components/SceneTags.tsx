import { SCENE_COLORS, SCENE_ICONS, SCENE_LABELS } from '@/types';
import type { SceneType } from '@/types';
import type { SceneWithReason } from '@/utils/sceneClassifier';

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

interface SceneReasonCardsProps {
  items: SceneWithReason[];
}

export function SceneReasonCards({ items }: SceneReasonCardsProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-stone-500">完善更多信息后将自动推荐场景</p>
    );
  }
  
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ scene, reason }) => (
        <div
          key={scene}
          className={`rounded-xl p-3 ring-1 ${SCENE_COLORS[scene]} ring-current/20 bg-opacity-60`}
        >
          <div className="mb-1 flex items-center gap-1.5 font-semibold">
            <span>{SCENE_ICONS[scene]}</span>
            <span>适合{SCENE_LABELS[scene]}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{reason}</p>
        </div>
      ))}
    </div>
  );
}

interface SceneReasonsListProps {
  items: SceneWithReason[];
}

export function SceneReasonsList({ items }: SceneReasonsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map(({ scene, reason }) => (
        <div key={scene} className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${SCENE_COLORS[scene]}`}
          >
            <span>{SCENE_ICONS[scene]}</span>
            <span>{SCENE_LABELS[scene]}</span>
          </span>
          <p className="text-sm text-stone-600">{reason}</p>
        </div>
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
