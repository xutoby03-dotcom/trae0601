import { CleanRecord, LitterBox, MemberStats, BoxStats, FamilyMember } from '../types';
import { hoursBetween } from './date';

export const calculateMemberStats = (
  records: CleanRecord[],
  members: FamilyMember[]
): MemberStats[] => {
  return members.map((member) => {
    const memberRecords = records.filter((r) => r.memberId === member.id);
    const totalCleans = memberRecords.filter((r) => !r.isFullChange).length;
    const totalFullChanges = memberRecords.filter((r) => r.isFullChange).length;
    const smellLevels = memberRecords.map((r) => r.smellLevel);
    const averageSmellLevel =
      smellLevels.length > 0
        ? smellLevels.reduce((a, b) => a + b, 0) / smellLevels.length
        : 0;

    return {
      memberId: member.id,
      totalCleans,
      totalFullChanges,
      averageSmellLevel: Number(averageSmellLevel.toFixed(2)),
    };
  });
};

export const calculateBoxStats = (
  records: CleanRecord[],
  boxes: LitterBox[]
): BoxStats[] => {
  return boxes.map((box) => {
    const boxRecords = records
      .filter((r) => r.litterBoxId === box.id)
      .sort((a, b) => new Date(a.cleanTime).getTime() - new Date(b.cleanTime).getTime());

    const totalCleans = boxRecords.length;
    const totalLitterAdded = boxRecords.reduce((sum, r) => sum + (r.addedLitter ? r.addedAmount : 0), 0);
    const smellLevels = boxRecords.map((r) => r.smellLevel);
    const averageSmellLevel =
      smellLevels.length > 0
        ? smellLevels.reduce((a, b) => a + b, 0) / smellLevels.length
        : 0;

    let averageIntervalHours = 0;
    if (boxRecords.length > 1) {
      const intervals: number[] = [];
      for (let i = 1; i < boxRecords.length; i++) {
        intervals.push(hoursBetween(boxRecords[i - 1].cleanTime, boxRecords[i].cleanTime));
      }
      averageIntervalHours = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    return {
      boxId: box.id,
      totalCleans,
      averageIntervalHours: Number(averageIntervalHours.toFixed(1)),
      averageSmellLevel: Number(averageSmellLevel.toFixed(2)),
      totalLitterAdded,
    };
  });
};

export const calculateTotalLitterConsumption = (
  records: CleanRecord[],
  boxes: LitterBox[]
): { totalGrams: number; fromRefills: number; fromFullChanges: number; perDay: number } => {
  const fromRefills = records.reduce((sum, r) => sum + (r.addedLitter && !r.isFullChange ? r.addedAmount : 0), 0);

  const fullChangeRecords = records.filter((r) => r.isFullChange);
  const fromFullChanges = fullChangeRecords.reduce((sum, r) => {
    const box = boxes.find((b) => b.id === r.litterBoxId);
    return sum + (box ? box.capacity * 600 : 0);
  }, 0);

  const totalGrams = fromRefills + fromFullChanges;

  const allTimes = records.map((r) => new Date(r.cleanTime).getTime());
  const daysSpan = allTimes.length > 1 ? Math.max(1, (Math.max(...allTimes) - Math.min(...allTimes)) / 86400000) : 1;
  const perDay = totalGrams / daysSpan;

  return {
    totalGrams,
    fromRefills,
    fromFullChanges,
    perDay: Number(perDay.toFixed(0)),
  };
};

export const getDeepCleanList = (
  records: CleanRecord[],
  boxes: LitterBox[]
): { boxId: string; reason: string; score: number }[] => {
  const results: { boxId: string; reason: string; score: number }[] = [];
  const now = new Date().toISOString();

  boxes.forEach((box) => {
    const boxRecords = records.filter((r) => r.litterBoxId === box.id);
    const totalCleans = boxRecords.length;
    const avgSmell = boxRecords.length > 0
      ? boxRecords.reduce((s, r) => s + r.smellLevel, 0) / boxRecords.length
      : 0;
    const lastFullChangeDays = Math.floor(
      (new Date(now).getTime() - new Date(box.lastFullChange).getTime()) / 86400000
    );

    let score = 0;
    const reasons: string[] = [];

    if (lastFullChangeDays > 60) {
      score += 3;
      reasons.push(`距上次整换已 ${lastFullChangeDays} 天`);
    }
    if (totalCleans > 150) {
      score += 2;
      reasons.push(`累计清洁 ${totalCleans} 次`);
    }
    if (avgSmell > 3.2) {
      score += 2;
      reasons.push(`平均异味等级 ${avgSmell.toFixed(1)}`);
    }

    if (score >= 3) {
      results.push({
        boxId: box.id,
        reason: reasons.join('；'),
        score,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
};
