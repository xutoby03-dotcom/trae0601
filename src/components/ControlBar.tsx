import { useState } from 'react';
import { Cookie, Maximize2, Info, Trash2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

type DragItem = 
  | { source: 'shop'; type: 'fish' | 'decoration'; itemType: string; price: number }
  | { source: 'tank'; type: 'decoration'; decorationId: string }
  | null;

interface ControlBarProps {
  onFeed: () => void;
  onDropOnTrash: () => void;
  dragItem: DragItem;
}

export default function ControlBar({ onFeed, onDropOnTrash, dragItem }: ControlBarProps) {
  const { coins, tankLevel, upgradeTank, fish } = useGameStore();
  const [isTrashHover, setIsTrashHover] = useState(false);
  const upgradeCost = tankLevel * 500;
  const canUpgrade = coins >= upgradeCost;

  const isDecorationDragging = dragItem?.source === 'tank' && dragItem.type === 'decoration';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isDecorationDragging) {
      setIsTrashHover(true);
    }
  };

  const handleDragLeave = () => {
    setIsTrashHover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsTrashHover(false);
    if (isDecorationDragging) {
      onDropOnTrash();
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between gap-4 border border-blue-800/50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-2xl">💰</span>
          <div>
            <div className="text-yellow-400 font-bold text-xl">{coins}</div>
            <div className="text-gray-400 text-xs">金币</div>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-700" />

        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-2xl">🐠</span>
          <div>
            <div className="text-blue-400 font-bold text-xl">{fish.length}</div>
            <div className="text-gray-400 text-xs">条鱼</div>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-700" />

        <div className="flex items-center gap-2">
          <Maximize2 className="text-green-400" size={24} />
          <div>
            <div className="text-green-400 font-bold text-xl">Lv.{tankLevel}</div>
            <div className="text-gray-400 text-xs">鱼缸等级</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => upgradeTank()}
          disabled={!canUpgrade}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            canUpgrade
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Maximize2 size={18} />
          扩缸 (💰{upgradeCost})
        </button>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border-2 ${
            isTrashHover && isDecorationDragging
              ? 'bg-red-600 border-red-400 text-white scale-110'
              : isDecorationDragging
              ? 'bg-slate-800 border-red-500/50 text-red-400 animate-pulse'
              : 'bg-slate-800 border-slate-600 text-gray-400'
          }`}
        >
          <Trash2 size={20} />
          <span className="text-sm">
            {isDecorationDragging ? '拖到这里删除' : '垃圾桶'}
          </span>
          {isDecorationDragging && (
            <span className="text-xs text-yellow-400">(退一半钱)</span>
          )}
        </div>

        <button
          onClick={onFeed}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95"
        >
          <Cookie size={20} />
          喂食
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Info size={16} />
        <span>每日自动结算产蛋收益</span>
      </div>
    </div>
  );
}
