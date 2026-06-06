import { X, Heart, Utensils, Smile } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { FISH_CONFIGS } from '../utils/constants';

interface FishStatusModalProps {
  fishId: string;
  onClose: () => void;
}

export default function FishStatusModal({ fishId, onClose }: FishStatusModalProps) {
  const { fish, removeFish } = useGameStore();
  const selectedFish = fish.find((f) => f.id === fishId);

  if (!selectedFish) return null;

  const config = FISH_CONFIGS[selectedFish.type];
  const ageDays = Math.floor((Date.now() - selectedFish.birthTime) / (1000 * 60 * 60 * 24));

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (value: number) => {
    if (value >= 70) return '良好';
    if (value >= 40) return '一般';
    return '较差';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-2xl p-6 w-96 border border-blue-800/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{config.emoji}</div>
            <div>
              <h3 className="text-white font-bold text-xl">{config.name}</h3>
              <p className="text-gray-400 text-sm">
                {config.size === 'small' ? '小型鱼' : config.size === 'medium' ? '中型鱼' : '大型鱼'}
                {' · '}
                {ageDays}天
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Utensils className="text-orange-400" size={20} />
                <span className="text-white font-medium">饥饿值</span>
              </div>
              <span className={`text-sm font-bold ${
                selectedFish.hunger >= 70 ? 'text-green-400' :
                selectedFish.hunger >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(selectedFish.hunger)}% · {getStatusText(selectedFish.hunger)}
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(selectedFish.hunger)} transition-all duration-500`}
                style={{ width: `${selectedFish.hunger}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {selectedFish.hunger < 50 ? '⚠️ 该喂食了！饥饿会影响健康' : '✓ 饱食状态良好'}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smile className="text-yellow-400" size={20} />
                <span className="text-white font-medium">心情值</span>
              </div>
              <span className={`text-sm font-bold ${
                selectedFish.mood >= 70 ? 'text-green-400' :
                selectedFish.mood >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(selectedFish.mood)}% · {getStatusText(selectedFish.mood)}
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(selectedFish.mood)} transition-all duration-500`}
                style={{ width: `${selectedFish.mood}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {selectedFish.mood < 50 ? '⚠️ 心情低落，多喂食互动' : '✓ 心情愉悦'}
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="text-red-400" size={20} />
                <span className="text-white font-medium">健康值</span>
              </div>
              <span className={`text-sm font-bold ${
                selectedFish.health >= 70 ? 'text-green-400' :
                selectedFish.health >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(selectedFish.health)}% · {getStatusText(selectedFish.health)}
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(selectedFish.health)} transition-all duration-500`}
                style={{ width: `${selectedFish.health}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              每日产蛋价值: 💰 {Math.round(config.eggValue * (selectedFish.health / 100))}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            基础产蛋: 💰 {config.eggValue}/天
          </div>
          <button
            onClick={() => {
              if (confirm('确定要放生这条鱼吗？')) {
                removeFish(fishId);
                onClose();
              }
            }}
            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg text-sm transition-colors"
          >
            放生
          </button>
        </div>
      </div>
    </div>
  );
}
