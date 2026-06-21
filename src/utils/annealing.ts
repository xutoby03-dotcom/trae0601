export type GlassType = 'soda-lime' | 'borosilicate' | 'lead' | 'fused-silica';

export const GLASS_TYPE_LABELS: Record<GlassType, string> = {
  'soda-lime': '钠钙玻璃',
  'borosilicate': '硼硅玻璃',
  'lead': '铅玻璃',
  'fused-silica': '石英玻璃',
};

export const GLASS_TYPE_COLORS: Record<GlassType, string> = {
  'soda-lime': '#4ade80',
  'borosilicate': '#60a5fa',
  'lead': '#c084fc',
  'fused-silica': '#f472b6',
};

export interface AnnealingProfile {
  type: GlassType;
  targetTemp: number;
  soakTemp: number;
  soakDurationPerMm: number;
  coolingRate: number;
  strainPoint: number;
  heatingRate: number;
}

export const ANNEALING_PROFILES: Record<GlassType, AnnealingProfile> = {
  'soda-lime': {
    type: 'soda-lime',
    targetTemp: 510,
    soakTemp: 480,
    soakDurationPerMm: 4,
    coolingRate: 12,
    strainPoint: 470,
    heatingRate: 200,
  },
  'borosilicate': {
    type: 'borosilicate',
    targetTemp: 560,
    soakTemp: 530,
    soakDurationPerMm: 3,
    coolingRate: 15,
    strainPoint: 520,
    heatingRate: 250,
  },
  'lead': {
    type: 'lead',
    targetTemp: 430,
    soakTemp: 400,
    soakDurationPerMm: 5,
    coolingRate: 10,
    strainPoint: 390,
    heatingRate: 150,
  },
  'fused-silica': {
    type: 'fused-silica',
    targetTemp: 1050,
    soakTemp: 1000,
    soakDurationPerMm: 6,
    coolingRate: 20,
    strainPoint: 990,
    heatingRate: 300,
  },
};

export interface WorkItem {
  id: string;
  type: GlassType;
  maxThickness: number;
  entryTime: string;
  studentName: string;
  height: number;
  gridRow: number;
  gridCol: number;
}

export interface FurnaceSession {
  id: string;
  status: 'planning' | 'running' | 'completed';
  startTime: string;
  works: WorkItem[];
}

export interface CurvePoint {
  time: number;
  temp: number;
  phase: 'heating' | 'soaking' | 'cooling';
}

export interface CompatibilityResult {
  canInsert: boolean;
  reason: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  nextFurnaceTime: string | null;
}

export const FURNACE_GRID = { rows: 3, cols: 4, maxCapacity: 12 };

export function calculateCurve(
  works: WorkItem[]
): CurvePoint[] {
  if (works.length === 0) return [];

  const dominantType = getDominantGlassType(works);
  const profile = ANNEALING_PROFILES[dominantType];
  const maxThickness = Math.max(...works.map((w) => w.maxThickness));

  const heatingTime = profile.targetTemp / profile.heatingRate;
  const soakDuration = maxThickness * profile.soakDurationPerMm / 60;
  const coolingRange = profile.soakTemp - 50;
  const coolingTime = coolingRange / profile.coolingRate;

  const points: CurvePoint[] = [];

  const heatingSteps = Math.max(20, Math.ceil(heatingTime * 4));
  for (let i = 0; i <= heatingSteps; i++) {
    const t = (i / heatingSteps) * heatingTime;
    const temp = (i / heatingSteps) * profile.targetTemp;
    points.push({ time: t, temp, phase: 'heating' });
  }

  const soakSteps = Math.max(10, Math.ceil(soakDuration * 4));
  for (let i = 1; i <= soakSteps; i++) {
    const t = heatingTime + (i / soakSteps) * soakDuration;
    points.push({ time: t, temp: profile.soakTemp, phase: 'soaking' });
  }

  const coolingSteps = Math.max(20, Math.ceil(coolingTime * 4));
  for (let i = 1; i <= coolingSteps; i++) {
    const t = heatingTime + soakDuration + (i / coolingSteps) * coolingTime;
    const temp = profile.soakTemp - (i / coolingSteps) * coolingRange;
    points.push({ time: t, temp, phase: 'cooling' });
  }

  return points;
}

export function getTotalDuration(works: WorkItem[]): number {
  if (works.length === 0) return 0;
  const curve = calculateCurve(works);
  return curve[curve.length - 1]?.time ?? 0;
}

export function getDominantGlassType(works: WorkItem[]): GlassType {
  if (works.length === 0) return 'soda-lime';
  const countMap: Partial<Record<GlassType, number>> = {};
  for (const w of works) {
    countMap[w.type] = (countMap[w.type] || 0) + 1;
  }
  let maxCount = 0;
  let dominant: GlassType = 'soda-lime';
  for (const [type, count] of Object.entries(countMap)) {
    if (count && count > maxCount) {
      maxCount = count;
      dominant = type as GlassType;
    }
  }
  return dominant;
}

export function checkCompatibility(
  newWork: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'>,
  existingWorks: WorkItem[]
): CompatibilityResult {
  if (existingWorks.length === 0) {
    return { canInsert: true, reason: '当前炉次为空，可直接加入', riskLevel: 'none', nextFurnaceTime: null };
  }

  if (existingWorks.length >= FURNACE_GRID.maxCapacity) {
    const endTime = estimateEndTime(existingWorks);
    return {
      canInsert: false,
      reason: '炉内已满，无剩余格子',
      riskLevel: 'high',
      nextFurnaceTime: endTime,
    };
  }

  const dominantType = getDominantGlassType(existingWorks);
  const currentProfile = ANNEALING_PROFILES[dominantType];
  const newProfile = ANNEALING_PROFILES[newWork.type];

  if (newWork.type !== dominantType) {
    const wouldBeDominant = existingWorks.filter((w) => w.type === newWork.type).length + 1;
    const currentDominantCount = existingWorks.filter((w) => w.type === dominantType).length;

    if (wouldBeDominant > currentDominantCount) {
      const endTime = estimateEndTime(existingWorks);
      return {
        canInsert: false,
        reason: `加入后玻璃类型将变为${GLASS_TYPE_LABELS[newWork.type]}，会导致整炉退火参数大幅改变，现有作品可能因温度曲线不匹配而开裂`,
        riskLevel: 'high',
        nextFurnaceTime: endTime,
      };
    }

    if (newProfile.soakTemp > currentProfile.soakTemp + 30) {
      const endTime = estimateEndTime(existingWorks);
      return {
        canInsert: false,
        reason: `${GLASS_TYPE_LABELS[newWork.type]}保温温度(${newProfile.soakTemp}°C)远高于当前${GLASS_TYPE_LABELS[dominantType]}保温温度(${currentProfile.soakTemp}°C)，加入会提高整炉温度，可能导致其他作品过热变形`,
        riskLevel: 'high',
        nextFurnaceTime: endTime,
      };
    }
  }

  const currentMaxThickness = Math.max(...existingWorks.map((w) => w.maxThickness));
  if (newWork.maxThickness > currentMaxThickness * 1.3) {
    const extraSoakTime = (newWork.maxThickness - currentMaxThickness) * currentProfile.soakDurationPerMm;
    return {
      canInsert: true,
      reason: `可加入，但保温时间需延长约${extraSoakTime.toFixed(0)}分钟以适配更厚作品，已排入作品不受影响`,
      riskLevel: 'low',
      nextFurnaceTime: null,
    };
  }

  return {
    canInsert: true,
    reason: '兼容当前退火曲线，可安全加入',
    riskLevel: 'none',
    nextFurnaceTime: null,
  };
}

function estimateEndTime(works: WorkItem[]): string {
  const totalHours = getTotalDuration(works);
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + Math.ceil(totalHours));
  return endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function assignGridPosition(
  work: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'>,
  existingWorks: WorkItem[]
): { gridRow: number; gridCol: number } | null {
  const occupied = new Set(existingWorks.map((w) => `${w.gridRow}-${w.gridCol}`));
  if (occupied.size >= FURNACE_GRID.maxCapacity) return null;

  let bestRow = -1;
  let bestCol = -1;

  const sorted = [...existingWorks, { ...work, id: 'temp', gridRow: -1, gridCol: -1 }].sort(
    (a, b) => a.height - b.height
  );
  const workIndex = sorted.findIndex((w) => w.id === 'temp');

  const targetRow = Math.min(
    Math.floor(workIndex / FURNACE_GRID.cols),
    FURNACE_GRID.rows - 1
  );

  for (let row = targetRow; row < FURNACE_GRID.rows; row++) {
    for (let col = 0; col < FURNACE_GRID.cols; col++) {
      if (!occupied.has(`${row}-${col}`)) {
        if (bestRow === -1) {
          bestRow = row;
          bestCol = col;
        }
        if (row === targetRow) {
          return { gridRow: row, gridCol: col };
        }
      }
    }
  }

  if (bestRow !== -1) return { gridRow: bestRow, gridCol: bestCol };
  return null;
}

export function reassignAllPositions(works: WorkItem[]): WorkItem[] {
  const sorted = [...works].sort((a, b) => a.height - b.height);
  return sorted.map((work, index) => ({
    ...work,
    gridRow: Math.min(Math.floor(index / FURNACE_GRID.cols), FURNACE_GRID.rows - 1),
    gridCol: index % FURNACE_GRID.cols,
  }));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}
