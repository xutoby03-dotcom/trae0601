import { TeaItem, ClothConfig, StageVersion, ItemType, Direction } from '@/types';
import { itemTemplates } from '@/data/items';

export interface DiffHint {
  type: 'itemCount' | 'itemAdded' | 'itemRemoved' | 'clothSize' | 'hostDirection' | 'guestDirection';
  severity: 'added' | 'removed' | 'changed';
  message: string;
}

const directionLabel = (d: Direction): string => {
  const m: Record<Direction, string> = { top: '上方', bottom: '下方', left: '左侧', right: '右侧' };
  return m[d];
};

const countByType = (items: TeaItem[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  return counts;
};

const typeNameMap = (): Record<string, string> => {
  const m: Record<string, string> = {};
  for (const t of itemTemplates) {
    m[t.type] = t.name;
  }
  return m;
};

export const computeDiff = (
  version: StageVersion,
  currentItems: TeaItem[],
  currentCloth: ClothConfig
): DiffHint[] => {
  const hints: DiffHint[] = [];
  const names = typeNameMap();

  const verCounts = countByType(version.items);
  const curCounts = countByType(currentItems);

  const allTypes = new Set([...Object.keys(verCounts), ...Object.keys(curCounts)]);

  const addedTypes: string[] = [];
  const removedTypes: string[] = [];

  for (const t of allTypes) {
    const vc = verCounts[t] || 0;
    const cc = curCounts[t] || 0;
    const diff = cc - vc;
    if (diff > 0) {
      addedTypes.push(`${names[t] || t} +${diff}`);
    } else if (diff < 0) {
      removedTypes.push(`${names[t] || t} -${Math.abs(diff)}`);
    }
  }

  if (addedTypes.length > 0) {
    hints.push({
      type: 'itemAdded',
      severity: 'added',
      message: `新增器物：${addedTypes.join('、')}`,
    });
  }
  if (removedTypes.length > 0) {
    hints.push({
      type: 'itemRemoved',
      severity: 'removed',
      message: `移除器物：${removedTypes.join('、')}`,
    });
  }

  const verTotal = version.items.length;
  const curTotal = currentItems.length;
  if (verTotal !== curTotal && addedTypes.length === 0 && removedTypes.length === 0) {
    hints.push({
      type: 'itemCount',
      severity: curTotal > verTotal ? 'added' : 'removed',
      message: `器物总数：${verTotal} → ${curTotal}`,
    });
  }

  const vw = version.clothConfig.width;
  const vh = version.clothConfig.height;
  const cw = currentCloth.width;
  const ch = currentCloth.height;
  if (vw !== cw || vh !== ch) {
    hints.push({
      type: 'clothSize',
      severity: 'changed',
      message: `席布尺寸：${vw}×${vh} → ${cw}×${ch}`,
    });
  }

  if (version.clothConfig.hostDirection !== currentCloth.hostDirection) {
    hints.push({
      type: 'hostDirection',
      severity: 'changed',
      message: `主人方向：${directionLabel(version.clothConfig.hostDirection)} → ${directionLabel(currentCloth.hostDirection)}`,
    });
  }

  if (version.clothConfig.guestDirection !== currentCloth.guestDirection) {
    hints.push({
      type: 'guestDirection',
      severity: 'changed',
      message: `客人方向：${directionLabel(version.clothConfig.guestDirection)} → ${directionLabel(currentCloth.guestDirection)}`,
    });
  }

  return hints;
};
