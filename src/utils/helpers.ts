import type { Checkpoint, RouteInfo, InspectionItem, InspectionCategory } from '@/types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateRouteInfo(checkpoints: Checkpoint[]): RouteInfo {
  if (checkpoints.length === 0) {
    return {
      totalDistance: 0,
      difficultyLevel: 'easy',
      averageDistance: 0,
      withdrawalOrder: [],
      maxDifficulty: 0,
    };
  }

  const sorted = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);
  const totalDistance = sorted.reduce((sum, cp) => sum + (cp.distanceToNext || 0), 0);
  const averageDistance = totalDistance / Math.max(sorted.length - 1, 1);
  const maxDifficulty = Math.max(...sorted.map(cp => cp.difficulty));

  let difficultyLevel: RouteInfo['difficultyLevel'] = 'easy';
  if (maxDifficulty >= 5 || totalDistance > 15000) difficultyLevel = 'extreme';
  else if (maxDifficulty >= 4 || totalDistance > 10000) difficultyLevel = 'hard';
  else if (maxDifficulty >= 3 || totalDistance > 5000) difficultyLevel = 'medium';

  const withdrawalOrder = sorted
    .slice()
    .reverse()
    .map(cp => cp.pointNumber);

  return {
    totalDistance,
    difficultyLevel,
    averageDistance: Math.round(averageDistance),
    withdrawalOrder,
    maxDifficulty,
  };
}

export function getDifficultyText(level: RouteInfo['difficultyLevel']): string {
  const labels: Record<RouteInfo['difficultyLevel'], string> = {
    easy: '入门级',
    medium: '进阶级',
    hard: '专业级',
    extreme: '挑战级',
  };
  return labels[level];
}

export function getDifficultyBarColor(level: RouteInfo['difficultyLevel']): string {
  const colors: Record<RouteInfo['difficultyLevel'], string> = {
    easy: 'from-green-400 to-emerald-500',
    medium: 'from-yellow-400 to-orange-500',
    hard: 'from-orange-500 to-red-500',
    extreme: 'from-red-500 to-rose-600',
  };
  return colors[level];
}

export function getBatteryStatus(level: number): { text: string; color: string } {
  if (level >= 80) return { text: '充足', color: 'text-alert-green' };
  if (level >= 50) return { text: '正常', color: 'text-yellow-600' };
  if (level >= 20) return { text: '偏低', color: 'text-alert-orange' };
  return { text: '不足', color: 'text-alert-red' };
}

export function generateInspectionChecklist(checkpoints: Checkpoint[]): InspectionItem[] {
  const items: InspectionItem[] = [];

  items.push(
    { id: generateId(), description: '起点打卡器功能测试正常', category: 'device' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '起点标识牌摆放到位', category: 'location' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '起点备用打卡器准备就绪', category: 'backup' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '起点安全警戒线设置', category: 'safety' as InspectionCategory, isChecked: false }
  );

  checkpoints.forEach(cp => {
    const terrain = cp.terrainDescription ? `（${cp.terrainDescription}，隐藏方式：${cp.hideMethod || '未设定'}）` : '';
    items.push(
      { id: generateId(), description: `点位${cp.pointNumber} - 位置与地图标记一致${terrain}`, category: 'location' as InspectionCategory, isChecked: false, checkpointId: cp.id },
    );

    const arrival = cp.estimatedArrival ? `，预计到达 ${cp.estimatedArrival}` : '';
    items.push(
      { id: generateId(), description: `点位${cp.pointNumber} - 打卡器电量≥${cp.batteryLevel}%${arrival}`, category: 'device' as InspectionCategory, isChecked: false, checkpointId: cp.id },
      { id: generateId(), description: `点位${cp.pointNumber} - 打卡器信号测试正常`, category: 'device' as InspectionCategory, isChecked: false, checkpointId: cp.id },
    );

    if (cp.hasBackup) {
      items.push(
        { id: generateId(), description: `点位${cp.pointNumber} - 备用标识放置到位（已配置备用标识）`, category: 'backup' as InspectionCategory, isChecked: false, checkpointId: cp.id }
      );
    }

    if (cp.difficulty >= 4) {
      items.push(
        { id: generateId(), description: `点位${cp.pointNumber} - 附近安全隐患排查`, category: 'safety' as InspectionCategory, isChecked: false, checkpointId: cp.id }
      );
    }
  });

  items.push(
    { id: generateId(), description: '终点打卡器功能测试正常', category: 'device' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '终点计时设备同步完成', category: 'device' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '终点备用打卡器准备就绪', category: 'backup' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '终点急救设备到位', category: 'safety' as InspectionCategory, isChecked: false },
    { id: generateId(), description: '所有点位打卡记录同步验证', category: 'device' as InspectionCategory, isChecked: false }
  );

  return items;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '--';
  return timeStr;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}
