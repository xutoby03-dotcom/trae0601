import { Fish, Food } from '../../store/types';
import { getTankWidth, getTankHeight, SAND_HEIGHT } from '../../utils/constants';

export function updateFishAI(fish: Fish, foods: Food[], deltaTime: number, tankLevel: number): Fish {
  let { x, y, vx, vy, targetX, targetY, speed, facingRight, wobblePhase, hunger, mood } = fish;

  const tankWidth = getTankWidth(tankLevel);
  const tankHeight = getTankHeight(tankLevel);

  const speedMultiplier = 0.5 + (hunger / 100) * 0.3 + (mood / 100) * 0.2;
  const actualSpeed = speed * speedMultiplier;

  wobblePhase += deltaTime * 3;

  let nearestFood: Food | null = null;
  let nearestDist = Infinity;
  
  for (const food of foods) {
    if (food.eaten) continue;
    const dist = Math.hypot(food.x - x, food.y - y);
    if (dist < nearestDist && dist < 200) {
      nearestDist = dist;
      nearestFood = food;
    }
  }

  if (nearestFood && hunger < 70) {
    targetX = nearestFood.x;
    targetY = nearestFood.y;
  } else {
    const distToTarget = Math.hypot(targetX - x, targetY - y);
    if (distToTarget < 20 || Math.random() < 0.005) {
      targetX = 50 + Math.random() * (tankWidth - 100);
      targetY = 50 + Math.random() * (tankHeight - SAND_HEIGHT - 100);
    }
  }

  const dx = targetX - x;
  const dy = targetY - y;
  const dist = Math.hypot(dx, dy);

  if (dist > 1) {
    vx += (dx / dist) * actualSpeed * 0.1;
    vy += (dy / dist) * actualSpeed * 0.1;
  }

  vx *= 0.95;
  vy *= 0.95;

  const currentSpeed = Math.hypot(vx, vy);
  if (currentSpeed > actualSpeed) {
    vx = (vx / currentSpeed) * actualSpeed;
    vy = (vy / currentSpeed) * actualSpeed;
  }

  x += vx * deltaTime * 60;
  y += vy * deltaTime * 60;

  const margin = 30;
  const minY = margin;
  const maxY = tankHeight - SAND_HEIGHT - margin;

  if (x < margin) {
    x = margin;
    vx = Math.abs(vx);
    targetX = 50 + Math.random() * (tankWidth - 100);
  }
  if (x > tankWidth - margin) {
    x = tankWidth - margin;
    vx = -Math.abs(vx);
    targetX = 50 + Math.random() * (tankWidth - 100);
  }
  if (y < minY) {
    y = minY;
    vy = Math.abs(vy);
    targetY = 50 + Math.random() * (tankHeight - SAND_HEIGHT - 100);
  }
  if (y > maxY) {
    y = maxY;
    vy = -Math.abs(vy);
    targetY = 50 + Math.random() * (tankHeight - SAND_HEIGHT - 100);
  }

  if (Math.abs(vx) > 0.1) {
    facingRight = vx > 0;
  }

  return {
    ...fish,
    x,
    y,
    vx,
    vy,
    targetX,
    targetY,
    facingRight,
    wobblePhase,
  };
}

export function checkFishFoodCollision(fish: Fish, foods: Food[]): string | null {
  for (const food of foods) {
    if (food.eaten) continue;
    const dist = Math.hypot(food.x - fish.x, food.y - fish.y);
    if (dist < 25) {
      return food.id;
    }
  }
  return null;
}
