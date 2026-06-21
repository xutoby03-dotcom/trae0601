import { PoleStats, HourlyWindData, FlagPole, RiskMark } from '../types';
import { calculateTanglingIndex } from './windCalculator';

export const calculatePoleStats = (
  pole: FlagPole,
  windData24h: HourlyWindData[]
): PoleStats => {
  let totalWindSpeed = 0;
  let maxGust = 0;
  let tanglingHours = 0;
  let totalTanglingIndex = 0;

  windData24h.forEach((hourData, index) => {
    const prevDir = index > 0 ? windData24h[index - 1].windDirection : undefined;
    const tanglingIndex = calculateTanglingIndex(hourData, pole, prevDir);
    
    totalWindSpeed += hourData.windSpeed;
    maxGust = Math.max(maxGust, hourData.gustSpeed);
    totalTanglingIndex += tanglingIndex;
    
    if (tanglingIndex >= 40) {
      tanglingHours++;
    }
  });

  const avgWindSpeed = totalWindSpeed / windData24h.length;
  const avgTanglingIndex = totalTanglingIndex / windData24h.length;
  
  const riskScore = Math.min(100,
    avgWindSpeed * 3 +
    (maxGust - avgWindSpeed) * 2 +
    tanglingHours * 2.5 +
    avgTanglingIndex * 0.4
  );

  return {
    poleId: pole.id,
    avgWindSpeed: Number(avgWindSpeed.toFixed(1)),
    maxGustSpeed: Number(maxGust.toFixed(1)),
    tanglingHours,
    avgTanglingIndex: Number(avgTanglingIndex.toFixed(1)),
    riskScore: Number(riskScore.toFixed(0)),
  };
};

export const getRiskLevel = (score: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  bgColor: string;
} => {
  if (score <= 30) {
    return { level: 'low', label: '低风险', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
  }
  if (score <= 60) {
    return { level: 'medium', label: '中风险', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
  }
  return { level: 'high', label: '高风险', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
};

export const getRecommendations = (
  stats: PoleStats,
  pole: FlagPole
): string[] => {
  const recommendations: string[] = [];

  if (stats.riskScore > 60) {
    if (pole.height > 8) {
      recommendations.push('建议降低旗杆高度至6-7米');
    }
    if (pole.flagMaterial === 'cotton') {
      recommendations.push('建议更换为聚酯纤维旗面');
    }
    if (pole.poleMaterial === 'fiberglass') {
      recommendations.push('建议更换为铝合金或钢材旗杆');
    }
    if (stats.tanglingHours > 8) {
      recommendations.push('此位置缠绕风险极高，考虑移位');
    }
  } else if (stats.riskScore > 30) {
    recommendations.push('建议定期检查旗面状态');
    if (pole.flagMaterial === 'cotton') {
      recommendations.push('可考虑更换为尼龙旗面');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('当前配置合理，可正常安装');
  }

  return recommendations;
};

export const countRiskByType = (marks: RiskMark[]): Record<string, number> => {
  return marks.reduce((acc, mark) => {
    acc[mark.type] = (acc[mark.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const generateRiskSummary = (
  poles: FlagPole[],
  stats: PoleStats[],
  marks: RiskMark[]
) => {
  const highRiskCount = stats.filter(s => s.riskScore > 60).length;
  const mediumRiskCount = stats.filter(s => s.riskScore > 30 && s.riskScore <= 60).length;
  const lowRiskCount = stats.filter(s => s.riskScore <= 30).length;

  return {
    totalPoles: poles.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    markedPoles: marks.length,
    averageRiskScore: Number((stats.reduce((acc, s) => acc + s.riskScore, 0) / stats.length).toFixed(1)),
  };
};
