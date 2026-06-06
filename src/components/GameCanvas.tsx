import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer } from '../game/engine/Renderer';
import { updateFishAI, checkFishFoodCollision } from '../game/engine/FishAI';
import { useGameStore } from '../store/gameStore';
import { TANK_WIDTH, TANK_HEIGHT, SAND_HEIGHT, DAY_MS, DECORATION_CONFIGS } from '../utils/constants';
import { FishType, DecorationType } from '../store/types';

interface GameCanvasProps {
  onFishClick: (fishId: string) => void;
  dragItem: { type: 'fish' | 'decoration'; itemType: FishType | DecorationType; price: number } | null;
  onDrop: (x: number, y: number) => void;
}

export default function GameCanvas({ onFishClick, dragItem, onDrop }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastSettleCheckRef = useRef<number>(Date.now());
  const [canvasSize, setCanvasSize] = useState({ width: TANK_WIDTH, height: TANK_HEIGHT });
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingDecorationId, setDraggingDecorationId] = useState<string | null>(null);

  const { fish, food, decorations, updateFish, updateFood, removeFood, dailySettle, selectFish, coins, moveDecoration, save } = useGameStore();

  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, TANK_WIDTH);
      const maxHeight = Math.min(window.innerHeight - 200, TANK_HEIGHT);
      const ratio = TANK_WIDTH / TANK_HEIGHT;
      let width = maxWidth;
      let height = width / ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
      }
      setCanvasSize({ width, height });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new Renderer(ctx, TANK_WIDTH, TANK_HEIGHT);

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

      const currentFood = useGameStore.getState().food;
      const currentFish = useGameStore.getState().fish;

      currentFish.forEach((f) => {
        const updatedFish = updateFishAI(f, currentFood, deltaTime);
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
        if (f.y < f.targetY) {
          updateFood(f.id, { y: f.y + 30 * deltaTime });
        }
      });

      if (rendererRef.current) {
        const state = useGameStore.getState();
        rendererRef.current.render(state.fish, state.food, state.decorations, deltaTime);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [updateFish, updateFood, removeFood, dailySettle]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.DragEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = TANK_WIDTH / rect.width;
    const scaleY = TANK_HEIGHT / rect.height;
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clientY = 'clientY' in e ? e.clientY : 0;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    
    const { x, y } = getCanvasCoords(e);

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
      setDraggingDecorationId(clickedDecoration);
      selectFish(null);
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
      }
    }
  }, [fish, decorations, onFishClick, selectFish, getCanvasCoords]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingDecorationId) return;

    const { x, y } = getCanvasCoords(e);
    const clampedY = Math.max(TANK_HEIGHT - SAND_HEIGHT - 60, Math.min(y, TANK_HEIGHT - 10));
    const clampedX = Math.max(30, Math.min(x, TANK_WIDTH - 30));
    
    moveDecoration(draggingDecorationId, clampedX, clampedY);
  }, [draggingDecorationId, moveDecoration, getCanvasCoords]);

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingDecorationId) {
      setDraggingDecorationId(null);
      save();
    }
  }, [draggingDecorationId, save]);

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
    if (!dragItem) return;
    if (coins < dragItem.price) return;
    
    const { x, y } = getCanvasCoords(e);
    const clampedY = Math.max(50, Math.min(y, TANK_HEIGHT - SAND_HEIGHT - 30));
    onDrop(x, clampedY);
  }, [dragItem, coins, getCanvasCoords, onDrop]);

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-blue-900/50"
      style={{ width: canvasSize.width, height: canvasSize.height }}
    >
      <canvas
        ref={canvasRef}
        width={TANK_WIDTH}
        height={TANK_HEIGHT}
        className={`w-full h-full ${draggingDecorationId ? 'cursor-grabbing' : 'cursor-pointer'}`}
        style={{ imageRendering: 'auto' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
      {isDragOver && dragItem && (
        <div className="absolute inset-0 bg-blue-400/20 pointer-events-none flex items-center justify-center">
          <span className="text-white text-lg font-bold bg-blue-600/80 px-4 py-2 rounded-lg">
            松开放置
          </span>
        </div>
      )}
      <div className="absolute top-3 left-3 text-white/60 text-sm">
        点击鱼查看状态
      </div>
    </div>
  );
}
