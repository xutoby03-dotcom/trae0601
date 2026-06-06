import { useState, useEffect } from 'react';
import GameCanvas from '../components/GameCanvas';
import ShopPanel from '../components/ShopPanel';
import ControlBar from '../components/ControlBar';
import FishStatusModal from '../components/FishStatusModal';
import { useGameStore } from '../store/gameStore';
import { FishType, DecorationType } from '../store/types';
import { DECORATION_CONFIGS } from '../utils/constants';

type DragItem = { type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number } | null;

export default function Home() {
  const { initialize, addFish, addDecoration, feed, selectFish, selectedFishId, coins, save } = useGameStore();
  const [dragItem, setDragItem] = useState<DragItem>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initialize().then(() => setIsInitialized(true));
  }, [initialize]);

  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        save();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, save]);

  const handleFishClick = (fishId: string) => {
    selectFish(fishId);
  };

  const handleCloseModal = () => {
    selectFish(null);
  };

  const handleDragStart = (item: DragItem) => {
    setDragItem(item);
  };

  const handleDragEnd = () => {
    setDragItem(null);
  };

  const handleDrop = (x: number, y: number) => {
    if (!dragItem) return;
    
    if (dragItem.type === 'fish') {
      addFish(dragItem.itemType as FishType, x, y);
    } else {
      addDecoration(dragItem.itemType as DecorationType, x, y);
    }
    setDragItem(null);
  };

  const handleFeed = () => {
    feed();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐠</div>
          <div className="text-white text-xl">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
        🐠 电子鱼缸
      </h1>

      <div className="flex gap-4 items-start">
        <ShopPanel onDragStart={handleDragStart} onDragEnd={handleDragEnd} />

        <div className="flex flex-col gap-4">
          <GameCanvas
            onFishClick={handleFishClick}
            dragItem={dragItem}
            onDrop={handleDrop}
          />
          <ControlBar onFeed={handleFeed} />
        </div>
      </div>

      <div className="text-gray-500 text-sm mt-2">
        从左侧商店拖拽鱼和装饰到鱼缸中 · 点击鱼查看状态 · 关闭网页后鱼仍会生长
      </div>

      {selectedFishId && (
        <FishStatusModal fishId={selectedFishId} onClose={handleCloseModal} />
      )}
    </div>
  );
}
