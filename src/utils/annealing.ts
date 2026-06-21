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

export interface PhaseInfo {
  phase: 'heating' | 'soaking' | 'cooling' | 'done';
  elapsedHours: number;
  heatingEnd: number;
  soakingEnd: number;
  coolingEnd: number;
  progress: number;
}

export interface CompatibilityResult {
  canInsert: boolean;
  reason: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  nextFurnaceTime: string | null;
  currentPhase?: PhaseInfo;
}

export const FURNACE_GRID = { rows: 3, cols: 4, maxCapacity: 12 };

export function getPhaseDurations(works: WorkItem[]) {
  if (works.length === 0) {
    return { heating: 0, soaking: 0, cooling: 0 };
  }
  const dominantType = getDominantGlassType(works);
  const profile = ANNEALING_PROFILES[dominantType];
  const maxThickness = Math.max(...works.map((w) => w.maxThickness));

  const heating = profile.targetTemp / profile.heatingRate;
  const soaking = (maxThickness * profile.soakDurationPerMm) / 60;
  const coolingRange = profile.soakTemp - 50;
  const cooling = coolingRange / profile.coolingRate;

  return { heating, soaking, cooling };
}

export function calculateCurve(
  works: WorkItem[]
): CurvePoint[] {
  if (works.length === 0) return [];

  const { heating, soaking, cooling } = getPhaseDurations(works);
  const dominantType = getDominantGlassType(works);
  const profile = ANNEALING_PROFILES[dominantType];
  const totalTime = heating + soaking + cooling;

  const coolingRange = profile.soakTemp - 50;
  void totalTime;

  const points: CurvePoint[] = [];

  const heatingSteps = Math.max(20, Math.ceil(heating * 4));
  for (let i = 0; i <= heatingSteps; i++) {
    const t = (i / heatingSteps) * heating;
    const temp = (i / heatingSteps) * profile.targetTemp;
    points.push({ time: t, temp, phase: 'heating' });
  }

  const soakSteps = Math.max(10, Math.ceil(soaking * 4));
  for (let i = 1; i <= soakSteps; i++) {
    const t = heating + (i / soakSteps) * soaking;
    points.push({ time: t, temp: profile.soakTemp, phase: 'soaking' });
  }

  const coolingSteps = Math.max(20, Math.ceil(cooling * 4));
  for (let i = 1; i <= coolingSteps; i++) {
    const t = heating + soaking + (i / coolingSteps) * cooling;
    const temp = profile.soakTemp - (i / coolingSteps) * coolingRange;
    points.push({ time: t, temp, phase: 'cooling' });
  }

  return points;
}

export function getTotalDuration(works: WorkItem[]): number {
  if (works.length === 0) return 0;
  const { heating, soaking, cooling } = getPhaseDurations(works);
  return heating + soaking + cooling;
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

export function getCurrentPhase(session: FurnaceSession): PhaseInfo {
  const { heating, soaking, cooling } = getPhaseDurations(session.works);
  const heatingEnd = heating;
  const soakingEnd = heating + soaking;
  const coolingEnd = heating + soaking + cooling;

  let elapsedHours = 0;
  if (session.status === 'running') {
    const startTime = new Date(session.startTime).getTime();
    const now = Date.now();
    elapsedHours = Math.max(0, (now - startTime) / 3_600_000);
  }

  let phase: PhaseInfo['phase'] = 'heating';
  let progress = 0;
  if (session.status === 'completed') {
    phase = 'done';
    progress = 1;
  } else if (session.status !== 'running') {
    phase = 'heating';
    progress = 0;
  } else if (elapsedHours >= coolingEnd) {
    phase = 'done';
    progress = 1;
  } else if (elapsedHours >= soakingEnd) {
    phase = 'cooling';
    progress = cooling > 0 ? Math.min(1, (elapsedHours - soakingEnd) / cooling) : 1;
  } else if (elapsedHours >= heatingEnd) {
    phase = 'soaking';
    progress = soaking > 0 ? Math.min(1, (elapsedHours - heatingEnd) / soaking) : 1;
  } else {
    phase = 'heating';
    progress = heating > 0 ? Math.min(1, elapsedHours / heating) : 1;
  }

  return { phase, elapsedHours, heatingEnd, soakingEnd, coolingEnd, progress };
}

export function estimateEndTimeBySession(session: FurnaceSession): string {
  const end = getTotalDuration(session.works);
  const dt = new Date(session.startTime);
  dt.setMinutes(dt.getMinutes() + Math.round(end * 60));
  return dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function estimateNextFurnaceStart(session: FurnaceSession, extraBuffer = 0.5): string {
  const end = getTotalDuration(session.works);
  const dt = session.status === 'running'
    ? new Date(session.startTime)
    : new Date();
  dt.setMinutes(dt.getMinutes() + Math.round(end * 60) + Math.round(extraBuffer * 60));
  return dt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function phaseLabel(p: PhaseInfo['phase']): string {
  switch (p) {
    case 'heating': return '升温阶段';
    case 'soaking': return '保温阶段';
    case 'cooling': return '降温阶段';
    case 'done': return '退火完成';
  }
}

export function checkCompatibility(
  newWork: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'>,
  session: FurnaceSession
): CompatibilityResult {
  const existingWorks = session.works;

  if (existingWorks.length === 0) {
    return {
      canInsert: true,
      reason: '当前炉次为空，可直接加入',
      riskLevel: 'none',
      nextFurnaceTime: null,
    };
  }

  if (existingWorks.length >= FURNACE_GRID.maxCapacity) {
    const nextStart = session.status === 'running'
      ? estimateNextFurnaceStart(session)
      : null;
    return {
      canInsert: false,
      reason: '炉内已满，无剩余格子',
      riskLevel: 'high',
      nextFurnaceTime: nextStart,
    };
  }

  if (session.status === 'running' || session.status === 'completed') {
    const phaseInfo = getCurrentPhase(session);

    if (phaseInfo.phase === 'cooling' || phaseInfo.phase === 'done') {
      const nextStart = estimateNextFurnaceStart(session);
      return {
        canInsert: false,
        reason: `当前已进入${phaseLabel(phaseInfo.phase)}，再升温会造成热冲击导致作品开裂，必须等本炉结束后重新排程`,
        riskLevel: 'high',
        nextFurnaceTime: nextStart,
        currentPhase: phaseInfo,
      };
    }

    if (phaseInfo.phase === 'soaking') {
      if (phaseInfo.progress >= 0.8) {
        const nextStart = estimateNextFurnaceStart(session);
        const remainMin = Math.max(0, Math.round((1 - phaseInfo.progress) * (phaseInfo.soakingEnd - phaseInfo.heatingEnd) * 60));
        return {
          canInsert: false,
          reason: `保温窗口已过 80%（仅余约 ${remainMin} 分钟），新作品插入无法获得充分保温，内部应力无法释放，后续开裂风险极高`,
          riskLevel: 'high',
          nextFurnaceTime: nextStart,
          currentPhase: phaseInfo,
        };
      }

      const dominantType = getDominantGlassType(existingWorks);
      const currentProfile = ANNEALING_PROFILES[dominantType];
      const newProfile = ANNEALING_PROFILES[newWork.type];

      if (newProfile.soakTemp !== currentProfile.soakTemp) {
        const nextStart = estimateNextFurnaceStart(session);
        return {
          canInsert: false,
          reason: `已进入保温阶段（目标 ${currentProfile.soakTemp}°C），${GLASS_TYPE_LABELS[newWork.type]} 需要 ${newProfile.soakTemp}°C 保温，中途改温会造成温度波动，开裂风险极高`,
          riskLevel: 'high',
          nextFurnaceTime: nextStart,
          currentPhase: phaseInfo,
        };
      }

      if (newWork.maxThickness > Math.max(...existingWorks.map((w) => w.maxThickness))) {
        const remainHours = Math.max(0, (1 - phaseInfo.progress) * (phaseInfo.soakingEnd - phaseInfo.heatingEnd));
        const needHours = (newWork.maxThickness * currentProfile.soakDurationPerMm) / 60;
        if (remainHours < needHours * 0.8) {
          const nextStart = estimateNextFurnaceStart(session);
          return {
            canInsert: false,
            reason: `新作品厚度 ${newWork.maxThickness}mm 需要 ${formatDuration(needHours)} 保温，仅剩 ${formatDuration(remainHours)}，无法充分退火，必须排入下一炉`,
            riskLevel: 'high',
            nextFurnaceTime: nextStart,
            currentPhase: phaseInfo,
          };
        }
        return {
          canInsert: true,
          reason: `当前处于保温前期，剩余时间仍可覆盖 ${newWork.studentName} 的作品（${newWork.maxThickness}mm）所需保温时长，插入后需密切关注降温速度`,
          riskLevel: 'medium',
          nextFurnaceTime: null,
          currentPhase: phaseInfo,
        };
      }

      return {
        canInsert: true,
        reason: `当前处于保温阶段（${Math.round(phaseInfo.progress * 100)}%），新作品参数与当前曲线匹配，可插入`,
        riskLevel: 'low',
        nextFurnaceTime: null,
        currentPhase: phaseInfo,
      };
    }

    if (phaseInfo.phase === 'heating') {
      const dominantType = getDominantGlassType(existingWorks);
      const currentProfile = ANNEALING_PROFILES[dominantType];
      const newProfile = ANNEALING_PROFILES[newWork.type];

      if (newProfile.targetTemp > currentProfile.targetTemp + 20) {
        const nextStart = estimateNextFurnaceStart(session);
        return {
          canInsert: false,
          reason: `升温中，${GLASS_TYPE_LABELS[newWork.type]} 需要升温到 ${newProfile.targetTemp}°C，高于当前目标 ${currentProfile.targetTemp}°C，插入会打乱升温节奏，建议下一炉`,
          riskLevel: 'high',
          nextFurnaceTime: nextStart,
          currentPhase: phaseInfo,
        };
      }

      if (phaseInfo.progress >= 0.7) {
        const nextStart = estimateNextFurnaceStart(session);
        return {
          canInsert: false,
          reason: `升温已到 ${Math.round(phaseInfo.progress * 100)}%，即将进入保温，此时插入冷作品可能导致炉温骤降，其他作品易产生热裂`,
          riskLevel: 'high',
          nextFurnaceTime: nextStart,
          currentPhase: phaseInfo,
        };
      }
    }
  }

  const dominantType = getDominantGlassType(existingWorks);
  const currentProfile = ANNEALING_PROFILES[dominantType];
  const newProfile = ANNEALING_PROFILES[newWork.type];

  if (newWork.type !== dominantType) {
    const wouldBeDominant = existingWorks.filter((w) => w.type === newWork.type).length + 1;
    const currentDominantCount = existingWorks.filter((w) => w.type === dominantType).length;

    if (wouldBeDominant > currentDominantCount) {
      const nextStart = session.status === 'running'
        ? estimateNextFurnaceStart(session)
        : estimateEndTimeBySession(session);
      return {
        canInsert: false,
        reason: `加入后玻璃类型将变为${GLASS_TYPE_LABELS[newWork.type]}，会导致整炉退火参数大幅改变，现有作品可能因温度曲线不匹配而开裂`,
        riskLevel: 'high',
        nextFurnaceTime: nextStart,
      };
    }

    if (newProfile.soakTemp > currentProfile.soakTemp + 30) {
      const nextStart = session.status === 'running'
        ? estimateNextFurnaceStart(session)
        : estimateEndTimeBySession(session);
      return {
        canInsert: false,
        reason: `${GLASS_TYPE_LABELS[newWork.type]}保温温度(${newProfile.soakTemp}°C)远高于当前${GLASS_TYPE_LABELS[dominantType]}保温温度(${currentProfile.soakTemp}°C)，加入会提高整炉温度，可能导致其他作品过热变形`,
        riskLevel: 'high',
        nextFurnaceTime: nextStart,
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
