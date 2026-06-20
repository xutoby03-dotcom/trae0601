import type { GuideSession, RoutePoint } from '@/types';

export interface RhythmScore {
  total: number;
  accuracy: number;
  keyCoverage: number;
  uniformity: number;
  suggestions: string[];
}

export function calculateRhythmScore(
  session: GuideSession,
  routePoints: RoutePoint[]
): RhythmScore {
  const suggestions: string[] = [];
  const keyPointIds = new Set(
    routePoints.filter((rp) => rp.isKeyPoint).map((rp) => rp.id)
  );

  const completedSessions = session.pointSessions.filter((ps) => ps.isCompleted);

  const accuracy = calculateAccuracy(session, suggestions);
  const keyCoverage = calculateKeyCoverage(
    completedSessions,
    keyPointIds,
    suggestions
  );
  const uniformity = calculateUniformity(completedSessions, suggestions);

  const total = Math.round(accuracy + keyCoverage + uniformity);

  if (total >= 85) {
    suggestions.unshift('讲解节奏把控优秀！');
  } else if (total >= 70) {
    suggestions.unshift('讲解节奏整体良好，仍有优化空间。');
  } else if (total >= 50) {
    suggestions.unshift('讲解节奏需要改进，请注意时间分配。');
  } else {
    suggestions.unshift('讲解节奏存在较大问题，建议重新规划。');
  }

  return {
    total,
    accuracy: Math.round(accuracy * 10) / 10,
    keyCoverage: Math.round(keyCoverage * 10) / 10,
    uniformity: Math.round(uniformity * 10) / 10,
    suggestions,
  };
}

function calculateAccuracy(
  session: GuideSession,
  suggestions: string[]
): number {
  if (session.totalPlannedDuration <= 0) return 0;

  const deviation = Math.abs(
    session.totalActualDuration - session.totalPlannedDuration
  );
  const deviationRate = deviation / session.totalPlannedDuration;

  let score: number;
  if (deviationRate <= 0.05) {
    score = 40;
  } else if (deviationRate <= 0.1) {
    score = 40 - (deviationRate - 0.05) * 100;
  } else if (deviationRate <= 0.2) {
    score = 35 - (deviationRate - 0.1) * 150;
  } else if (deviationRate <= 0.4) {
    score = 20 - (deviationRate - 0.2) * 75;
  } else {
    score = Math.max(0, 5 - (deviationRate - 0.4) * 25);
  }

  if (deviationRate > 0.1) {
    const diff = session.totalActualDuration - session.totalPlannedDuration;
    if (diff > 0) {
      suggestions.push(
        `整体超时 ${formatMinutes(diff)}，建议精简讲解内容或加快语速。`
      );
    } else {
      suggestions.push(
        `整体用时不足 ${formatMinutes(-diff)}，建议扩展重点内容讲解。`
      );
    }
  }

  return Math.max(0, Math.min(40, score));
}

function calculateKeyCoverage(
  completedSessions: { pointId: string; plannedDuration: number; actualDuration: number }[],
  keyPointIds: Set<string>,
  suggestions: string[]
): number {
  const keySessions = completedSessions.filter((ps) =>
    keyPointIds.has(ps.pointId)
  );

  if (keySessions.length === 0) {
    suggestions.push('未检测到已完成的重点点位讲解。');
    return 0;
  }

  let coveredCount = 0;
  const insufficientPoints: string[] = [];

  for (const ps of keySessions) {
    const ratio = ps.actualDuration / ps.plannedDuration;
    if (ratio >= 0.8) {
      coveredCount++;
    } else {
      insufficientPoints.push(ps.pointId);
    }
  }

  const coverageRate = coveredCount / keySessions.length;
  const score = coverageRate * 30;

  if (insufficientPoints.length > 0) {
    suggestions.push(
      `有 ${insufficientPoints.length} 个重点点位讲解时间不足计划的80%，请确保重点内容讲解充分。`
    );
  }

  if (coverageRate >= 1) {
    suggestions.push('所有重点点位均获得充足讲解时间，表现出色！');
  }

  return score;
}

function calculateUniformity(
  completedSessions: { plannedDuration: number; actualDuration: number }[],
  suggestions: string[]
): number {
  if (completedSessions.length < 2) {
    return 30;
  }

  const deviations = completedSessions.map((ps) => {
    if (ps.plannedDuration <= 0) return 0;
    return (ps.actualDuration - ps.plannedDuration) / ps.plannedDuration;
  });

  const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const variance =
    deviations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    deviations.length;
  const stdDev = Math.sqrt(variance);

  let score: number;
  if (stdDev <= 0.1) {
    score = 30;
  } else if (stdDev <= 0.2) {
    score = 30 - (stdDev - 0.1) * 100;
  } else if (stdDev <= 0.4) {
    score = 20 - (stdDev - 0.2) * 75;
  } else {
    score = Math.max(0, 5 - (stdDev - 0.4) * 25);
  }

  if (stdDev > 0.2) {
    suggestions.push(
      '各点位时间分配波动较大，建议保持更均匀的讲解节奏。'
    );
  } else if (stdDev <= 0.1) {
    suggestions.push('各点位时间分配非常均匀，节奏稳定！');
  }

  return Math.max(0, Math.min(30, score));
}

function formatMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) {
    return s > 0 ? `${m}分${s}秒` : `${m}分钟`;
  }
  return `${s}秒`;
}
