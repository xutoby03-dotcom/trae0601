import { KnotRecord, KnotStat, StudentSummary, READINESS_RULES } from "@/types/knot";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateKnotStats(
  records: KnotRecord[],
  knotType: string
): KnotStat {
  const knotRecords = records
    .filter((r) => r.knotType === knotType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalTests = knotRecords.length;

  if (totalTests === 0) {
    return {
      knotType,
      totalTests: 0,
      passCount: 0,
      failCount: 0,
      slipCount: 0,
      capsizeCount: 0,
      sheathWearCount: 0,
      avgRetryCount: 0,
      avgTieTime: 0,
      maxTestWeight: 0,
      readyForField: false,
      reasons: ["暂无测试记录"],
    };
  }

  const slipCount = knotRecords.filter((r) => r.slipped).length;
  const capsizeCount = knotRecords.filter((r) => r.capsized).length;
  const sheathWearCount = knotRecords.filter((r) => r.sheathWear).length;
  const passCount = knotRecords.filter(
    (r) => !r.slipped && !r.capsized && !r.sheathWear
  ).length;
  const failCount = totalTests - passCount;

  const avgRetryCount =
    knotRecords.reduce((sum, r) => sum + r.retryCount, 0) / totalTests;
  const avgTieTime =
    knotRecords.reduce((sum, r) => sum + r.tieTimeSeconds, 0) / totalTests;
  const maxTestWeight = Math.max(...knotRecords.map((r) => r.testWeight));

  const recentRecords = knotRecords.slice(0, READINESS_RULES.recentTestsCount);
  const recentSlipCount = recentRecords.filter((r) => r.slipped).length;

  const capsizeRate = capsizeCount / totalTests;
  const sheathWearRate = sheathWearCount / totalTests;

  const reasons: string[] = [];

  if (totalTests < READINESS_RULES.minTests) {
    reasons.push(`测试次数不足（需${READINESS_RULES.minTests}次，当前${totalTests}次）`);
  }

  if (recentSlipCount > READINESS_RULES.maxSlipInRecent) {
    reasons.push(`最近${READINESS_RULES.recentTestsCount}次有滑脱记录`);
  }

  if (capsizeRate >= READINESS_RULES.maxCapsizeRate) {
    reasons.push(`翻结率过高（${(capsizeRate * 100).toFixed(0)}%）`);
  }

  if (sheathWearRate >= READINESS_RULES.maxSheathWearRate) {
    reasons.push(`绳皮磨损率过高（${(sheathWearRate * 100).toFixed(0)}%）`);
  }

  if (avgRetryCount > READINESS_RULES.maxAvgRetryCount) {
    reasons.push(`平均复打次数过多（${avgRetryCount.toFixed(1)}次）`);
  }

  const readyForField = reasons.length === 0;

  return {
    knotType,
    totalTests,
    passCount,
    failCount,
    slipCount,
    capsizeCount,
    sheathWearCount,
    avgRetryCount,
    avgTieTime,
    maxTestWeight,
    readyForField,
    reasons,
  };
}

export function calculateStudentSummary(
  records: KnotRecord[],
  studentName: string,
  allKnotTypes: string[]
): StudentSummary {
  const studentRecords = records.filter((r) => r.studentName === studentName);
  const testedKnots = [...new Set(studentRecords.map((r) => r.knotType))];
  const allKnots = [...new Set([...allKnotTypes, ...testedKnots])];

  const knotStats = allKnots.map((knotType) =>
    calculateKnotStats(studentRecords, knotType)
  );

  const totalReadyKnots = knotStats.filter((k) => k.readyForField).length;
  const totalUnreadyKnots = knotStats.filter((k) => !k.readyForField).length;

  return {
    studentName,
    totalRecords: studentRecords.length,
    knotStats,
    totalReadyKnots,
    totalUnreadyKnots,
  };
}

export function getAllStudentNames(records: KnotRecord[]): string[] {
  return [...new Set(records.map((r) => r.studentName))].sort();
}

export function getAllKnotTypes(records: KnotRecord[]): string[] {
  return [...new Set(records.map((r) => r.knotType))].sort();
}
