import { useState } from 'react';
import { FishType, DecorationType } from '../store/types';
import { FISH_CONFIGS, DECORATION_CONFIGS } from '../utils/constants';
import { useGameStore } from '../store/gameStore';
import { ShoppingBag, Fish as FishIcon, Flower2 } from 'lucide-react';

interface ShopPanelProps {
  onDragStart: (item: { type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number }) => void;
  onDragEnd: () => void;
}

export default function ShopPanel({ onDragStart, onDragEnd }: ShopPanelProps) {
  const { coins, shopTab, setShopTab } = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleFishDragStart = (e: React.DragEvent, type: FishType) => {
    const config = FISH_CONFIGS[type];
    if (coins < config.price) {
      e.preventDefault();
      return;
    }
    onDragStart({ type: 'fish', itemType: type, price: config.price });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDecorationDragStart = (e: React.DragEvent, type: DecorationType) => {
    const config = DECORATION_CONFIGS[type];
    if (coins < config.price) {
      e.preventDefault();
      return;
    }
    onDragStart({ type: 'decoration', itemType: type, price: config.price });
    e.dataTransfer.effectAllowed = 'move';
  };

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-blue-800/80 hover:bg-blue-700 text-white p-2 rounded-l-lg transition-colors"
        >
          <ShoppingBag size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 w-64 h-full flex flex-col border border-blue-800/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <ShoppingBag size={20} className="text-blue-400" />
          商店
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShopTab('fish')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            shopTab === 'fish'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <FishIcon size={16} />
          鱼类
        </button>
        <button
          onClick={() => setShopTab('decoration')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            shopTab === 'decoration'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          <Flower2 size={16} />
          装饰
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {shopTab === 'fish' &&
          Object.entries(FISH_CONFIGS).map(([type, config]) => {
            const canAfford = coins >= config.price;
            return (
              <div
                key={type}
                draggable={canAfford}
                onDragStart={(e) => handleFishDragStart(e, type as FishType)}
                onDragEnd={onDragEnd}
                className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                  canAfford
                    ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500 hover:bg-slate-700/50'
                    : 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{config.emoji}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{config.name}</div>
                    <div className="text-xs text-gray-400">
                      {config.size === 'small' ? '小型' : config.size === 'medium' ? '中型' : '大型'}
                    </div>
                  </div>
                  <div className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    💰 {config.price}
                  </div>
                </div>
              </div>
            );
          })}

        {shopTab === 'decoration' &&
          Object.entries(DECORATION_CONFIGS).map(([type, config]) => {
            const canAfford = coins >= config.price;
            return (
              <div
                key={type}
                draggable={canAfford}
                onDragStart={(e) => handleDecorationDragStart(e, type as DecorationType)}
                onDragEnd={onDragEnd}
                className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                  canAfford
                    ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500 hover:bg-slate-700/50'
                    : 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{config.emoji}</div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{config.name}</div>
                  </div>
                  <div className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    💰 {config.price}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="text-center text-yellow-400 font-bold text-lg">
          💰 {coins} 金币
        </div>
      </div>
    </div>
  );
}
