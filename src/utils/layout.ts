import { TeaItem, ClothConfig, DetectionResult, Direction } from '@/types';
import { checkOverlap, getDistance, getCenterPoint } from './collision';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const detectOcclusions = (items: TeaItem[]): DetectionResult[] => {
  const results: DetectionResult[] = [];
  const overlapThreshold = 0.15;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const { isOverlapping, overlapRatio } = checkOverlap(items[i], items[j]);
      if (isOverlapping && overlapRatio > overlapThreshold) {
        const severity = overlapRatio > 0.5 ? 'error' : 'warning';
        results.push({
          id: generateId(),
          type: 'occlusion',
          severity,
          message: `${items[i].name} 与 ${items[j].name} 存在遮挡（重叠 ${Math.round(overlapRatio * 100)}%）`,
          relatedItemIds: [items[i].id, items[j].id],
        });
      }
    }
  }

  return results;
};

export const detectDistanceIssues = (items: TeaItem[]): DetectionResult[] => {
  const results: DetectionResult[] = [];
  const minDistance = 50;
  const maxDistance = 250;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const distance = getDistance(items[i], items[j]);

      if (distance < minDistance) {
        results.push({
          id: generateId(),
          type: 'distance',
          severity: 'warning',
          message: `${items[i].name} 与 ${items[j].name} 距离过近（${Math.round(distance)}px）`,
          relatedItemIds: [items[i].id, items[j].id],
        });
      }

      if (distance > maxDistance) {
        results.push({
          id: generateId(),
          type: 'distance',
          severity: 'info',
          message: `${items[i].name} 与 ${items[j].name} 距离较远（${Math.round(distance)}px），取用动线较长`,
          relatedItemIds: [items[i].id, items[j].id],
        });
      }
    }
  }

  return results;
};

export const detectHandConflicts = (
  items: TeaItem[],
  clothConfig: ClothConfig
): DetectionResult[] => {
  const results: DetectionResult[] = [];

  const hostSide = clothConfig.hostDirection;
  const isHorizontal = hostSide === 'left' || hostSide === 'right';

  const pot = items.find((item) => item.type === 'pot');
  const gongdao = items.find((item) => item.type === 'gongdao');

  if (pot && gongdao) {
    const potCenter = getCenterPoint(pot);
    const gongdaoCenter = getCenterPoint(gongdao);

    let potOnLeft: boolean;
    let gongdaoOnLeft: boolean;

    if (isHorizontal) {
      potOnLeft = potCenter.y < gongdaoCenter.y;
      gongdaoOnLeft = gongdaoCenter.y < potCenter.y;
    } else {
      potOnLeft = potCenter.x < gongdaoCenter.x;
      gongdaoOnLeft = gongdaoCenter.x < potCenter.x;
    }

    const hostOnLeft = hostSide === 'left' || hostSide === 'top';

    if (hostOnLeft) {
      if (potOnLeft && !gongdaoOnLeft) {
        results.push({
          id: generateId(),
          type: 'handConflict',
          severity: 'info',
          message: '茶壶在左侧、公道杯在右侧，符合右手冲泡习惯',
          relatedItemIds: [pot.id, gongdao.id],
        });
      } else if (gongdaoOnLeft && !potOnLeft) {
        results.push({
          id: generateId(),
          type: 'handConflict',
          severity: 'warning',
          message: '公道杯在左侧、茶壶在右侧，可能造成左右手交叉取用',
          relatedItemIds: [pot.id, gongdao.id],
        });
      }
    } else {
      if (gongdaoOnLeft && !potOnLeft) {
        results.push({
          id: generateId(),
          type: 'handConflict',
          severity: 'info',
          message: '公道杯在左侧、茶壶在右侧，符合左手冲泡习惯',
          relatedItemIds: [pot.id, gongdao.id],
        });
      } else if (potOnLeft && !gongdaoOnLeft) {
        results.push({
          id: generateId(),
          type: 'handConflict',
          severity: 'warning',
          message: '茶壶在左侧、公道杯在右侧，可能造成左右手交叉取用',
          relatedItemIds: [pot.id, gongdao.id],
        });
      }
    }
  }

  return results;
};

export const detectBalanceIssues = (
  items: TeaItem[],
  clothConfig: ClothConfig
): DetectionResult[] => {
  const results: DetectionResult[] = [];
  const { width, height } = clothConfig;

  if (items.length < 3) return results;

  const leftHalfItems = items.filter(
    (item) => getCenterPoint(item).x < width / 2
  );
  const rightHalfItems = items.filter(
    (item) => getCenterPoint(item).x >= width / 2
  );
  const topHalfItems = items.filter(
    (item) => getCenterPoint(item).y < height / 2
  );
  const bottomHalfItems = items.filter(
    (item) => getCenterPoint(item).y >= height / 2
  );

  const horizontalDiff = Math.abs(leftHalfItems.length - rightHalfItems.length);
  const verticalDiff = Math.abs(topHalfItems.length - bottomHalfItems.length);

  const leftArea = leftHalfItems.reduce(
    (sum, item) => sum + item.width * item.height,
    0
  );
  const rightArea = rightHalfItems.reduce(
    (sum, item) => sum + item.width * item.height,
    0
  );
  const totalArea = leftArea + rightArea;
  const areaDiffRatio = totalArea > 0 ? Math.abs(leftArea - rightArea) / totalArea : 0;

  if (horizontalDiff > Math.ceil(items.length / 3)) {
    results.push({
      id: generateId(),
      type: 'balance',
      severity: 'warning',
      message: `左右分布不均衡：左侧 ${leftHalfItems.length} 件，右侧 ${rightHalfItems.length} 件`,
      relatedItemIds: items.map((item) => item.id),
    });
  }

  if (verticalDiff > Math.ceil(items.length / 3)) {
    results.push({
      id: generateId(),
      type: 'balance',
      severity: 'warning',
      message: `上下分布不均衡：上方 ${topHalfItems.length} 件，下方 ${bottomHalfItems.length} 件`,
      relatedItemIds: items.map((item) => item.id),
    });
  }

  if (areaDiffRatio > 0.4) {
    results.push({
      id: generateId(),
      type: 'balance',
      severity: 'info',
      message: `视觉重量偏${leftArea > rightArea ? '左' : '右'}，面积差 ${Math.round(areaDiffRatio * 100)}%`,
      relatedItemIds: items.map((item) => item.id),
    });
  }

  if (horizontalDiff === 0 && verticalDiff === 0 && areaDiffRatio < 0.1) {
    results.push({
      id: generateId(),
      type: 'balance',
      severity: 'info',
      message: '布局均衡，器物分布协调',
      relatedItemIds: items.map((item) => item.id),
    });
  }

  return results;
};

export const runAllDetections = (
  items: TeaItem[],
  clothConfig: ClothConfig
): DetectionResult[] => {
  const occlusions = detectOcclusions(items);
  const distanceIssues = detectDistanceIssues(items);
  const handConflicts = detectHandConflicts(items, clothConfig);
  const balanceIssues = detectBalanceIssues(items, clothConfig);

  return [...occlusions, ...distanceIssues, ...handConflicts, ...balanceIssues];
};

export const getDirectionLabel = (direction: Direction): string => {
  const labels: Record<Direction, string> = {
    top: '上方',
    bottom: '下方',
    left: '左侧',
    right: '右侧',
  };
  return labels[direction];
};
