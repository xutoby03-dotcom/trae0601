import { TeaItem } from '@/types';

export const getCenterPoint = (item: TeaItem) => ({
  x: item.x + item.width / 2,
  y: item.y + item.height / 2,
});

export const getDistance = (item1: TeaItem, item2: TeaItem): number => {
  const p1 = getCenterPoint(item1);
  const p2 = getCenterPoint(item2);
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const checkOverlap = (
  item1: TeaItem,
  item2: TeaItem
): { isOverlapping: boolean; overlapArea: number; overlapRatio: number } => {
  const overlapX =
    Math.min(item1.x + item1.width, item2.x + item2.width) -
    Math.max(item1.x, item2.x);
  const overlapY =
    Math.min(item1.y + item1.height, item2.y + item2.height) -
    Math.max(item1.y, item2.y);

  if (overlapX <= 0 || overlapY <= 0) {
    return { isOverlapping: false, overlapArea: 0, overlapRatio: 0 };
  }

  const overlapArea = overlapX * overlapY;
  const minArea = Math.min(item1.width * item1.height, item2.width * item2.height);
  const overlapRatio = overlapArea / minArea;

  return { isOverlapping: true, overlapArea, overlapRatio };
};

export const isPointInItem = (
  x: number,
  y: number,
  item: TeaItem
): boolean => {
  return (
    x >= item.x &&
    x <= item.x + item.width &&
    y >= item.y &&
    y <= item.y + item.height
  );
};

export const findItemAtPoint = (
  x: number,
  y: number,
  items: TeaItem[]
): TeaItem | null => {
  for (let i = items.length - 1; i >= 0; i--) {
    if (isPointInItem(x, y, items[i])) {
      return items[i];
    }
  }
  return null;
};
