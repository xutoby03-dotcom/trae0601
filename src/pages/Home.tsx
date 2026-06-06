import { useState, useEffect } from 'react';
import GameCanvas from '../components/GameCanvas';
import ShopPanel from '../components/ShopPanel';
import ControlBar from '../components/ControlBar';
import FishStatusModal from '../components/FishStatusModal';
import { useGameStore } from '../store/gameStore';
import { FishType, DecorationType } from '../store/types';

type DragItem = 
  | { source: 'shop'; type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number }
  | { source: 'tank'; type: 'decoration'; decorationId: string }
  | null;

export default function Home() {
  const { initialize, addFish, addDecoration, feed, selectFish, selectedFishId, coins, save, removeDecorationRefund } = useGameStore();
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

  const handleShopDragStart = (item: { type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number }) => {
    setDragItem({ source: 'shop', ...item });
  };

  const handleTankDecorationDragStart = (decorationId: string) => {
    setDragItem({ source: 'tank', type: 'decoration', decorationId });
  };

  const handleDragEnd = () => {
    setDragItem(null);
  };

  const handleDropOnCanvas = (x: number, y: number) => {
    if (!dragItem) return;
    
    if (dragItem.source === 'shop') {
      if (dragItem.type === 'fish') {
        addFish(dragItem.itemType as FishType, x, y);
      } else {
        addDecoration(dragItem.itemType as DecorationType, x, y);
      }
    }
    setDragItem(null);
  };

  const handleDropOnTrash = () => {
    if (!dragItem) return;
    
    if (dragItem.source === 'tank' && dragItem.type === 'decoration') {
      removeDecorationRefund(dragItem.decorationId);
    }
    setDragItem(null);
  };

  const handleFeed = () => {
    feed();
  };

  const handleFeedAtPosition = (x: number, y: number) => {
    feed(x, y);
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
        <ShopPanel onDragStart={handleShopDragStart} onDragEnd={handleDragEnd} />

        <div className="flex flex-col gap-4">
          <GameCanvas
            onFishClick={handleFishClick}
            dragItem={dragItem}
            onDrop={handleDropOnCanvas}
            onFeedAtPosition={handleFeedAtPosition}
            onDecorationDragStart={handleTankDecorationDragStart}
            onDragEnd={handleDragEnd}
          />
          <ControlBar onFeed={handleFeed} onDropOnTrash={handleDropOnTrash} dragItem={dragItem} />
        </div>
      </div>

      <div className="text-gray-500 text-sm mt-2">
        从左侧商店拖拽鱼和装饰到鱼缸中 · 点击鱼查看状态 · 点击空白处喂食 · 点击鱼蛋收钱 · 拖动装饰到垃圾桶删除 · 关闭网页后鱼仍会生长
      </div>

      {selectedFishId && (
        <FishStatusModal fishId={selectedFishId} onClose={handleCloseModal} />
      )}
    </div>
  );
}
