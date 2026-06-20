import type { DryingRecord, FamilyMember, MemberStats } from "@/types";

export const getMemberStats = (
  records: DryingRecord[],
  members: FamilyMember[]
): MemberStats[] => {
  return members.map((m) => {
    const dryCount = records.filter((r) => r.ownerId === m.id).length;
    const collectCount = records.filter(
      (r) => r.status !== "drying" && r.collectedAt
    ).length;
    const totalCollects = records.filter((r) => r.status !== "drying").length;
    const shareCollects = totalCollects > 0 ? Math.round((collectCount / totalCollects) * dryCount) : 0;
    return {
      memberId: m.id,
      memberName: m.name,
      avatar: m.avatar,
      color: m.color,
      dryCount,
      collectCount: shareCollects || dryCount,
    };
  });
};

export const getActiveDryingCount = (records: DryingRecord[]): number => {
  return records.filter((r) => r.status === "drying").length;
};

export const getOverdueCount = (records: DryingRecord[]): number => {
  return records.filter(
    (r) => r.status === "drying" && new Date().getTime() - new Date(r.startTime).getTime() > 24 * 3600000
  ).length;
};

export const getUrgentCount = (
  records: DryingRecord[],
  riskLevel: number
): number => {
  return getNeedCollectRecords(records, riskLevel).length;
};

export const isNeedCollect = (record: DryingRecord, riskLevel: number): boolean => {
  if (record.status !== "drying") return false;

  const isOverdue24h = new Date().getTime() - new Date(record.startTime).getTime() > 24 * 3600000;
  const isPastExpected = new Date().getTime() > new Date(record.expectedTime).getTime();
  const isHighWeatherRisk = riskLevel >= 2;

  return isOverdue24h || isPastExpected || isHighWeatherRisk;
};

export const getNeedCollectRecords = (
  records: DryingRecord[],
  riskLevel: number
): DryingRecord[] => {
  return records.filter((r) => isNeedCollect(r, riskLevel));
};

export const getNeedCollectCount = (
  records: DryingRecord[],
  riskLevel: number
): number => {
  return getNeedCollectRecords(records, riskLevel).length;
};

export const sortByUrgency = (records: DryingRecord[]): DryingRecord[] => {
  return [...records]
    .filter((r) => r.status === "drying")
    .sort((a, b) => {
      const aOverdue = new Date().getTime() - new Date(a.startTime).getTime() > 24 * 3600000 ? 1 : 0;
      const bOverdue = new Date().getTime() - new Date(b.startTime).getTime() > 24 * 3600000 ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      return new Date(a.expectedTime).getTime() - new Date(b.expectedTime).getTime();
    });
};

export const sortNeedCollectByUrgency = (
  records: DryingRecord[],
  riskLevel: number
): DryingRecord[] => {
  return getNeedCollectRecords(records, riskLevel).sort((a, b) => {
    const aOverdue = new Date().getTime() - new Date(a.startTime).getTime() > 24 * 3600000 ? 1 : 0;
    const bOverdue = new Date().getTime() - new Date(b.startTime).getTime() > 24 * 3600000 ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    const aPastExpected = new Date().getTime() > new Date(a.expectedTime).getTime() ? 1 : 0;
    const bPastExpected = new Date().getTime() > new Date(b.expectedTime).getTime() ? 1 : 0;
    if (aPastExpected !== bPastExpected) return bPastExpected - aPastExpected;

    return new Date(a.expectedTime).getTime() - new Date(b.expectedTime).getTime();
  });
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    drying: "晾晒中",
    collected: "已收衣",
    rewash: "需重洗",
  };
  return map[status] || status;
};

export const getStatusChipClass = (status: string): string => {
  const map: Record<string, string> = {
    drying: "bg-sky-100 text-sky-700",
    collected: "bg-emerald-100 text-emerald-700",
    rewash: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};
