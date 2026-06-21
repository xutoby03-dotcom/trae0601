import { HourlyWindData, FlagPole, MATERIAL_DAMPING, POLE_MATERIAL_STRENGTH } from '../types';

export const calculateTanglingIndex = (
  windData: HourlyWindData,
  pole: FlagPole,
  prevDirection?: number
): number => {
  const { windDirection, windSpeed, gustSpeed } = windData;
  
  const directionChange = prevDirection !== undefined
    ? Math.min(
        Math.abs(windDirection - prevDirection),
        360 - Math.abs(windDirection - prevDirection)
      ) / 180
    : 0.5;

  const gustFactor = gustSpeed / windSpeed;
  const heightFactor = pole.height / 10;
  const materialDamping = MATERIAL_DAMPING[pole.flagMaterial];
  const poleStrength = POLE_MATERIAL_STRENGTH[pole.poleMaterial];

  const baseIndex = (
    windSpeed * 3.5 * 0.35 +
    directionChange * 60 * 0.4 +
    (gustFactor - 1) * 40 * 0.2
  ) * heightFactor;

  const adjustedIndex = baseIndex * (1 - materialDamping * 0.3) / poleStrength;

  return Math.min(100, Math.max(0, adjustedIndex));
};

export const getPoleStatus = (tanglingIndex: number): 'normal' | 'warning' | 'danger' => {
  if (tanglingIndex >= 65) return 'danger';
  if (tanglingIndex >= 40) return 'warning';
  return 'normal';
};

export const getWindDirectionLabel = (degrees: number): string => {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const getBeaufortScale = (speed: number): { level: number; label: string } => {
  if (speed < 0.3) return { level: 0, label: '无风' };
  if (speed < 1.5) return { level: 1, label: '软风' };
  if (speed < 3.3) return { level: 2, label: '轻风' };
  if (speed < 5.4) return { level: 3, label: '微风' };
  if (speed < 7.9) return { level: 4, label: '和风' };
  if (speed < 10.7) return { level: 5, label: '清劲风' };
  if (speed < 13.8) return { level: 6, label: '强风' };
  if (speed < 17.1) return { level: 7, label: '疾风' };
  if (speed < 20.7) return { level: 8, label: '大风' };
  if (speed < 24.4) return { level: 9, label: '烈风' };
  if (speed < 28.4) return { level: 10, label: '狂风' };
  if (speed < 32.6) return { level: 11, label: '暴风' };
  return { level: 12, label: '飓风' };
};

export const getTanglingLevel = (index: number): { level: string; color: string } => {
  if (index < 20) return { level: '无缠绕', color: '#22c55e' };
  if (index < 40) return { level: '轻微', color: '#06b6d4' };
  if (index < 60) return { level: '中等', color: '#f59e0b' };
  if (index < 80) return { level: '严重', color: '#f97316' };
  return { level: '极严重', color: '#ef4444' };
};

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
