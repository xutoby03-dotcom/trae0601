import { useMemo } from 'react';
import { useWindStore } from '../store/useWindStore';
import { calculatePoleStats, getRiskLevel, getRecommendations } from '../utils/riskAssessment';
import { calculateTanglingIndex } from '../utils/windCalculator';

export const useWindSimulation = () => {
  const {
    windData,
    poles,
    currentHour,
    getCurrentWindData,
    riskMarks,
  } = useWindStore();

  const currentWindData = useMemo(() => getCurrentWindData(), [getCurrentWindData]);

  const allPoleStats = useMemo(() => 
    poles.map(pole => calculatePoleStats(pole, windData.hours)),
    [poles, windData.hours]
  );

  const getPoleStats = (poleId: string) => 
    allPoleStats.find(s => s.poleId === poleId);

  const getPoleCurrentTangling = (poleId: string) => {
    const pole = poles.find(p => p.id === poleId);
    if (!pole) return 0;

    const prevHour = currentHour > 0 ? currentHour - 1 : 23;
    const prevDir = windData.hours[prevHour]?.windDirection;
    
    return calculateTanglingIndex(currentWindData, pole, prevDir);
  };

  const getPoleRiskLevel = (poleId: string) => {
    const stats = getPoleStats(poleId);
    if (!stats) return { level: 'low' as const, label: '低风险', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
    return getRiskLevel(stats.riskScore);
  };

  const getPoleRecommendations = (poleId: string) => {
    const pole = poles.find(p => p.id === poleId);
    const stats = getPoleStats(poleId);
    if (!pole || !stats) return [];
    return getRecommendations(stats, pole);
  };

  const hasHighRisk = useMemo(() => 
    allPoleStats.some(s => s.riskScore > 60),
    [allPoleStats]
  );

  const riskSummary = useMemo(() => {
    const highRisk = allPoleStats.filter(s => s.riskScore > 60).length;
    const mediumRisk = allPoleStats.filter(s => s.riskScore > 30 && s.riskScore <= 60).length;
    const lowRisk = allPoleStats.filter(s => s.riskScore <= 30).length;
    const avgScore = allPoleStats.reduce((acc, s) => acc + s.riskScore, 0) / allPoleStats.length;

    return {
      totalPoles: poles.length,
      highRisk,
      mediumRisk,
      lowRisk,
      markedPoles: riskMarks.length,
      averageRiskScore: Number(avgScore.toFixed(1)),
    };
  }, [allPoleStats, poles.length, riskMarks.length]);

  const getHourlyTanglingForPole = (poleId: string) => {
    const pole = poles.find(p => p.id === poleId);
    if (!pole) return [];

    return windData.hours.map((hourData, index) => {
      const prevDir = index > 0 ? windData.hours[index - 1].windDirection : undefined;
      return {
        hour: hourData.hour,
        tanglingIndex: calculateTanglingIndex(hourData, pole, prevDir),
        windSpeed: hourData.windSpeed,
      };
    });
  };

  return {
    currentWindData,
    allPoleStats,
    riskSummary,
    hasHighRisk,
    getPoleStats,
    getPoleCurrentTangling,
    getPoleRiskLevel,
    getPoleRecommendations,
    getHourlyTanglingForPole,
  };
};
