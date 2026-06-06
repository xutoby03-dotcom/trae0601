import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer } from '../game/engine/Renderer';
import { updateFishAI, checkFishFoodCollision } from '../game/engine/FishAI';
import { useGameStore } from '../store/gameStore';
import { getTankWidth, getTankHeight, SAND_HEIGHT, DAY_MS, BASE_TANK_WIDTH, BASE_TANK_HEIGHT } from '../utils/constants';
import { FishType, DecorationType } from '../store/types';
import { DECORATION_CONFIGS } from '../utils/constants';

type DragItem = 
  | { source: 'shop'; type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number }
  | { source: 'tank'; type: 'decoration'; decorationId: string }
  | null;

interface GameCanvasProps {
  onFishClick: (fishId: string) => void;
  dragItem: DragItem;
  onDrop: (x: number, y: number) => void;
  onFeedAtPosition: (x: number, y: number) => void;
  onDecorationDragStart: (decorationId: string) => void;
  onDragEnd: () => void;
}

export default function GameCanvas({ onFishClick, dragItem, onDrop, onFeedAtPosition, onDecorationDragStart, onDragEnd }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastSettleCheckRef = useRef<number>(Date.now());
  const [canvasSize, setCanvasSize] = useState({ width: BASE_TANK_WIDTH, height: BASE_TANK_HEIGHT });
  const [isDragOver, setIsDragOver] = useState(false);

  const { fish, food, decorations, eggs, tankLevel, updateFish, updateFood, removeFood, dailySettle, selectFish, coins, moveDecoration, save, collectEgg } = useGameStore();

  const currentTankWidth = getTankWidth(tankLevel);
  const currentTankHeight = getTankHeight(tankLevel);

  useEffect(() => {
    const updateSize = () => {
      const baseRatio = BASE_TANK_WIDTH / BASE_TANK_HEIGHT;
      const maxWidth = Math.min(window.innerWidth - 40, currentTankWidth);
      const maxHeight = Math.min(window.innerHeight - 200, currentTankHeight);
      let width = maxWidth;
      let height = width / baseRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * baseRatio;
      }
      setCanvasSize({ width, height });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [currentTankWidth, currentTankHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new Renderer(ctx, currentTankWidth, currentTankHeight);

    const gameLoop = (timestamp: number) => {
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const now = Date.now();
      if (now - lastSettleCheckRef.current > 60000) {
        lastSettleCheckRef.current = now;
        const state = useGameStore.getState();
        if (now - state.lastSettleTime >= DAY_MS) {
          dailySettle();
        }
      }

      const currentState = useGameStore.getState();
      const currentFood = currentState.food;
      const currentFish = currentState.fish;
      const currentTankLevel = currentState.tankLevel;

      currentFish.forEach((f) => {
        const updatedFish = updateFishAI(f, currentFood, deltaTime, currentTankLevel);
        updateFish(f.id, updatedFish);

        const foodId = checkFishFoodCollision(updatedFish, currentFood);
        if (foodId) {
          updateFood(foodId, { eaten: true });
          removeFood(foodId);
          updateFish(f.id, {
            hunger: Math.min(100, updatedFish.hunger + 15),
            mood: Math.min(100, updatedFish.mood + 5),
          });
        }
      });

      currentFood.forEach((f) => {
        if (f.eaten) return;
        const tankH = getTankHeight(currentTankLevel);
        if (f.y < Math.min(f.targetY, tankH - SAND_HEIGHT - 10)) {
          updateFood(f.id, { y: f.y + 30 * deltaTime });
        }
      });

      if (rendererRef.current) {
        const state = useGameStore.getState();
        rendererRef.current.resize(getTankWidth(state.tankLevel), getTankHeight(state.tankLevel));
        rendererRef.current.render(state.fish, state.food, state.decorations, state.eggs, deltaTime);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [updateFish, updateFood, removeFood, dailySettle, currentTankWidth, currentTankHeight]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.DragEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = currentTankWidth / rect.width;
    const scaleY = currentTankHeight / rect.height;
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  }, [currentTankWidth, currentTankHeight]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    
    const { x, y } = getCanvasCoords(e);

    let clickedEgg: string | null = null;
    for (const egg of eggs) {
      const dist = Math.hypot(egg.x - x, egg.y - y);
      if (dist < 20) {
        clickedEgg = egg.id;
        break;
      }
    }

    if (clickedEgg) {
      collectEgg(clickedEgg);
      return;
    }

    let clickedDecoration: string | null = null;
    for (const d of decorations) {
      const config = DECORATION_CONFIGS[d.type];
      const halfW = config.width / 2;
      const halfH = config.height / 2;
      if (x >= d.x - halfW && x <= d.x + halfW &&
          y >= d.y - halfH && y <= d.y + halfH) {
        clickedDecoration = d.id;
        break;
      }
    }

    if (clickedDecoration) {
      selectFish(null);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.setAttribute('data-dragging-decoration', clickedDecoration);
        canvas.draggable = true;
      }
    } else {
      let clickedFish: string | null = null;
      for (const f of fish) {
        const size = f.size === 'small' ? 20 : f.size === 'medium' ? 30 : 45;
        const dist = Math.hypot(f.x - x, f.y - y);
        if (dist < size) {
          clickedFish = f.id;
          break;
        }
      }

      if (clickedFish) {
        onFishClick(clickedFish);
      } else {
        selectFish(null);
        onFeedAtPosition(x, y);
      }
    }
  }, [fish, eggs, decorations, onFishClick, selectFish, getCanvasCoords, collectEgg, onFeedAtPosition]);

  const handleCanvasDragStart = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const decorationId = canvas.getAttribute('data-dragging-decoration');
    if (decorationId) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', decorationId);
      onDecorationDragStart(decorationId);
    } else {
      e.preventDefault();
    }
  }, [onDecorationDragStart]);

  const handleCanvasDragEnd = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.removeAttribute('data-dragging-decoration');
      canvas.draggable = false;
    }
    onDragEnd();
  }, [onDragEnd]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (dragItem?.source === 'shop') {
      const price = dragItem.price;
      if (coins < price) return;
      
      const { x, y } = getCanvasCoords(e);
      const clampedY = Math.max(50, Math.min(y, currentTankHeight - SAND_HEIGHT - 30));
      onDrop(x, clampedY);
    } else if (dragItem?.source === 'tank' && dragItem.type === 'decoration') {
      const { x, y } = getCanvasCoords(e);
      const clampedY = Math.max(currentTankHeight - SAND_HEIGHT - 60, Math.min(y, currentTankHeight - 10));
      const clampedX = Math.max(30, Math.min(x, currentTankWidth - 30));
      moveDecoration(dragItem.decorationId, clampedX, clampedY);
      save();
    }
  }, [dragItem, coins, getCanvasCoords, onDrop, currentTankWidth, currentTankHeight, moveDecoration, save]);

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-blue-900/50"
      style={{ width: canvasSize.width, height: canvasSize.height }}
    >
      <canvas
        ref={canvasRef}
        width={currentTankWidth}
        height={currentTankHeight}
        className="w-full h-full cursor-pointer"
        style={{ imageRendering: 'auto' }}
        onMouseDown={handleCanvasMouseDown}
        onDragStart={handleCanvasDragStart}
        onDragEnd={handleCanvasDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      {isDragOver && dragItem?.source === 'shop' && (
        <div className="absolute inset-0 bg-blue-400/20 pointer-events-none flex items-center justify-center">
          <span className="text-white text-lg font-bold bg-blue-600/80 px-4 py-2 rounded-lg">
            松开放置
          </span>
        </div>
      )}
      {isDragOver && dragItem?.source === 'tank' && (
        <div className="absolute inset-0 bg-green-400/20 pointer-events-none flex items-center justify-center">
          <span className="text-white text-lg font-bold bg-green-600/80 px-4 py-2 rounded-lg">
            松开移动
          </span>
        </div>
      )}
      <div className="absolute top-3 left-3 text-white/60 text-sm">
        点击鱼查看状态 · 点击空白处喂食 · 点击鱼蛋收钱 · 拖动装饰可移动/删除
      </div>
      {tankLevel > 1 && (
        <div className="absolute top-3 right-3 text-green-400 text-sm font-bold bg-slate-900/60 px-3 py-1 rounded-lg">
          Lv.{tankLevel} 鱼缸
        </div>
      )}
    </div>
  );
}
