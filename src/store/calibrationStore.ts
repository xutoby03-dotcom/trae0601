import { create } from 'zustand';
import type {
  CalibrationSession,
  CalibrationRecord,
  AnomalyMark,
  StabilityReport,
  RecordSummary,
  AnomalyBreakdown,
  AnomalyType,
} from '@/types/calibration';
import { ANOMALY_SEVERITY_WEIGHT } from '@/types/calibration';
import { generateTickIntervals, detectAnomalies } from '@/utils/tickSimulation';

interface CalibrationState {
  session: CalibrationSession | null;
  report: StabilityReport | null;
  activeRecordId: string | null;

  createSession: (clockName: string, clockModel: string) => void;
  addRecord: (params: {
    pendulumLength: number;
    escapementPosition: number;
    windingDegree: number;
    testDuration: number;
    hourlyError: number;
    note?: string;
  }) => CalibrationRecord;
  setActiveRecord: (recordId: string) => void;
  generateReport: () => StabilityReport;
  resetSession: () => void;
}

const STORAGE_KEY = 'clock-calibration-session';

function loadSession(): CalibrationSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: CalibrationSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useCalibrationStore = create<CalibrationState>((set, get) => ({
  session: loadSession(),
  report: null,
  activeRecordId: null,

  createSession: (clockName, clockModel) => {
    const session: CalibrationSession = {
      id: uid(),
      clockName,
      clockModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      records: [],
      anomalies: [],
    };
    saveSession(session);
    set({ session, report: null, activeRecordId: null });
  },

  addRecord: (params) => {
    const { session } = get();
    if (!session) throw new Error('No active session');

    const tickIntervals = generateTickIntervals(
      params.pendulumLength,
      params.escapementPosition,
      params.windingDegree,
      params.testDuration,
      params.hourlyError
    );

    const record: CalibrationRecord = {
      id: uid(),
      sessionId: session.id,
      pendulumLength: params.pendulumLength,
      escapementPosition: params.escapementPosition,
      windingDegree: params.windingDegree,
      testDuration: params.testDuration,
      hourlyError: params.hourlyError,
      tickIntervals,
      recordTime: Date.now(),
      note: params.note || '',
    };

    const newAnomalies = detectAnomalies(tickIntervals, session.id, record.id);

    const updatedSession: CalibrationSession = {
      ...session,
      records: [...session.records, record],
      anomalies: [...session.anomalies, ...newAnomalies],
      updatedAt: Date.now(),
    };

    saveSession(updatedSession);
    set({ session: updatedSession, activeRecordId: record.id });
    return record;
  },

  setActiveRecord: (recordId) => {
    set({ activeRecordId: recordId });
  },

  generateReport: () => {
    const { session } = get();
    if (!session || session.records.length === 0) throw new Error('No records');

    const records = session.records;
    const errors = records.map((r) => r.hourlyError);
    const avgError = errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length;
    const maxError = Math.max(...errors.map((e) => Math.abs(e)));
    const minError = Math.min(...errors.map((e) => Math.abs(e)));

    const firstHalf = errors.slice(0, Math.floor(errors.length / 2));
    const secondHalf = errors.slice(Math.floor(errors.length / 2));
    const avgFirst = firstHalf.reduce((s, e) => s + Math.abs(e), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, e) => s + Math.abs(e), 0) / secondHalf.length;

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (avgSecond < avgFirst * 0.8) trend = 'improving';
    else if (avgSecond > avgFirst * 1.2) trend = 'worsening';

    const anomalyBreakdown: AnomalyBreakdown = {
      OFF_BEAT: 0,
      STOPPED: 0,
      WEAK_RETURN: 0,
      GEAR_JAM: 0,
    };
    for (const a of session.anomalies) {
      anomalyBreakdown[a.type]++;
    }
    const totalAnomalies = session.anomalies.length;

    let weightedPenalty = 0;
    for (const [type, count] of Object.entries(anomalyBreakdown) as [AnomalyType, number][]) {
      const weight = ANOMALY_SEVERITY_WEIGHT[type];
      if (type === 'STOPPED' && count > 0) {
        weightedPenalty += weight * Math.min(count, 5);
      } else if (type === 'GEAR_JAM' && count > 0) {
        weightedPenalty += weight * Math.min(count, 4);
      } else {
        weightedPenalty += weight * Math.min(count, 3);
      }
    }

    let stabilityScore = 100;
    stabilityScore -= Math.min(40, avgError * 10);
    stabilityScore -= Math.min(50, weightedPenalty);
    if (trend === 'worsening') stabilityScore -= 15;
    if (trend === 'improving') stabilityScore += 5;
    stabilityScore = Math.max(0, Math.min(100, Math.round(stabilityScore)));

    const recordSummaries: RecordSummary[] = records.map((r) => ({
      recordId: r.id,
      recordTime: r.recordTime,
      hourlyError: r.hourlyError,
      anomalyCount: session.anomalies.filter((a) => a.recordId === r.id).length,
      pendulumLength: r.pendulumLength,
      escapementPosition: r.escapementPosition,
    }));

    const riskItems: string[] = [];
    if (anomalyBreakdown.STOPPED > 0) {
      riskItems.push(`检测到${anomalyBreakdown.STOPPED}次停摆`);
    }
    if (anomalyBreakdown.GEAR_JAM > 0) {
      riskItems.push(`${anomalyBreakdown.GEAR_JAM}处疑似齿轮卡滞`);
    }
    if (anomalyBreakdown.WEAK_RETURN > 0) {
      riskItems.push(`${anomalyBreakdown.WEAK_RETURN}次回摆无力`);
    }
    if (anomalyBreakdown.OFF_BEAT > 0) {
      riskItems.push(`擒纵偏摆${anomalyBreakdown.OFF_BEAT}次`);
    }

    const riskText = riskItems.length > 0 ? `风险项：${riskItems.join('、')}。` : '未检测到显著异常。';

    let conclusion = '';
    if (stabilityScore >= 80) {
      conclusion = `走时稳定，${riskText}各项指标正常，可交付客户。`;
    } else if (stabilityScore >= 60) {
      conclusion = `走时基本稳定，${riskText}存在轻微偏差，建议继续观察。`;
    } else if (stabilityScore >= 40) {
      conclusion = `走时不够稳定，${riskText}需要进一步调校后重新测试。`;
    } else {
      conclusion = `走时严重不稳定，${riskText}建议全面检修擒纵机构和齿轮系统。`;
    }

    const report: StabilityReport = {
      id: uid(),
      sessionId: session.id,
      stabilityScore,
      averageError: Math.round(avgError * 100) / 100,
      maxError: Math.round(maxError * 100) / 100,
      minError: Math.round(minError * 100) / 100,
      errorTrend: trend,
      conclusion,
      generatedAt: Date.now(),
      recordSummaries,
      anomalyBreakdown,
      totalAnomalies,
    };

    set({ report });
    return report;
  },

  resetSession: () => {
    saveSession(null);
    set({ session: null, report: null, activeRecordId: null });
  },
}));
