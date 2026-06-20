import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import type { Scene } from '@/types';
import { useAppStore } from '@/store/appStore';

interface SceneTimelineProps {
  playId: string;
  selectedSceneId: string | null;
}

export default function SceneTimeline({ playId, selectedSceneId }: SceneTimelineProps) {
  const navigate = useNavigate();
  const { getScenesByPlay, getCuesByScene } = useAppStore();
  const scenes = getScenesByPlay(playId);

  const handleSceneClick = (scene: Scene) => {
    navigate(`/play/${playId}/scene/${scene.id}`);
  };

  return (
    <div className="bg-stage-bg-card rounded-2xl border border-stage-border p-6">
      <h2 className="text-xl font-bold text-stage-text mb-6 flex items-center gap-3">
        <Clock className="w-6 h-6 text-neon-green" />
        场次时间线
      </h2>

      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-stage-border" />

        <div className="space-y-4">
          {scenes.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            const cues = getCuesByScene(scene.id);

            return (
              <button
                key={scene.id}
                onClick={() => handleSceneClick(scene)}
                className={`relative w-full text-left rounded-xl border-2 p-5 transition-all duration-300 hover:scale-[1.01] ${
                  isSelected
                    ? 'border-neon-green bg-neon-green/5 shadow-lg shadow-neon-green/10'
                    : 'border-stage-border bg-stage-bg-secondary hover:border-neon-green/30 hover:bg-stage-bg-hover'
                }`}
              >
                {/* 时间线节点 */}
                <div
                  className={`absolute -left-[22px] top-6 w-4 h-4 rounded-full border-2 ${
                    isSelected
                      ? 'bg-neon-green border-neon-green shadow-lg shadow-neon-green/50'
                      : 'bg-stage-bg-card border-stage-border'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                        isSelected
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-stage-bg-hover text-stage-text-secondary'
                      }`}
                    >
                      {scene.order}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          isSelected ? 'text-neon-green' : 'text-stage-text'
                        }`}
                      >
                        {scene.name}
                      </h3>
                      <p className="text-base text-stage-text-secondary mt-1">
                        {scene.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        isSelected
                          ? 'bg-neon-green/20 text-neon-green'
                          : 'bg-stage-bg-hover text-stage-text-muted'
                      }`}
                    >
                      {cues.length} 个 Cue
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected
                          ? 'text-neon-green translate-x-1'
                          : 'text-stage-text-muted'
                      }`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
