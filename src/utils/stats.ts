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

export interface DeepCleanItem {
  boxId: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  reasons: string[];
  metrics: {
    daysSinceFullChange: number;
    fullChangeRatio: number;
    highSmellStreak: number;
    totalCleans: number;
    averageSmell: number;
    hoursSinceLastClean: number;
  };
}

export const getDeepCleanList = (
  records: CleanRecord[],
  boxes: LitterBox[],
  nowISO: string = new Date().toISOString()
): DeepCleanItem[] => {
  const results: DeepCleanItem[] = [];

  boxes.forEach((box) => {
    const boxRecords = records
      .filter((r) => r.litterBoxId === box.id)
      .sort((a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime());

    const totalCleans = boxRecords.length;
    const avgSmell = totalCleans > 0
      ? boxRecords.reduce((s, r) => s + r.smellLevel, 0) / totalCleans
      : 0;

    const daysSinceFullChange = Math.floor(
      (new Date(nowISO).getTime() - new Date(box.lastFullChange).getTime()) / 86400000
    );

    const fullChangeRatio = daysSinceFullChange / box.fullChangeIntervalDays;

    let highSmellStreak = 0;
    for (const record of boxRecords) {
      if (record.smellLevel >= 4 && !record.isFullChange) {
        highSmellStreak++;
      } else {
        break;
      }
    }

    const lastCleanTime = boxRecords[0]?.cleanTime || box.lastFullChange;
    const hoursSinceLastClean = (new Date(nowISO).getTime() - new Date(lastCleanTime).getTime()) / 3600000;

    let score = 0;
    const reasons: string[] = [];

    if (fullChangeRatio >= 1.5) {
      score += 5;
      reasons.push(`距上次整换已 ${daysSinceFullChange} 天，超过设定间隔 ${(fullChangeRatio - 1).toFixed(1)} 倍`);
    } else if (fullChangeRatio >= 1.2) {
      score += 3;
      reasons.push(`距上次整换已 ${daysSinceFullChange} 天，超过设定间隔 ${Math.round((fullChangeRatio - 1) * 100)}%`);
    } else if (fullChangeRatio >= 1) {
      score += 2;
      reasons.push(`距上次整换已 ${daysSinceFullChange} 天，已达设定间隔`);
    } else if (fullChangeRatio >= 0.8) {
      score += 1;
      reasons.push(`距上次整换 ${daysSinceFullChange}/${box.fullChangeIntervalDays} 天（${Math.round(fullChangeRatio * 100)}%）`);
    }

    if (highSmellStreak >= 5) {
      score += 4;
      reasons.push(`连续 ${highSmellStreak} 次异味≥4 级`);
    } else if (highSmellStreak >= 3) {
      score += 3;
      reasons.push(`连续 ${highSmellStreak} 次异味≥4 级`);
    } else if (highSmellStreak >= 2) {
      score += 1;
      reasons.push(`连续 ${highSmellStreak} 次异味≥4 级`);
    }

    if (totalCleans > 200) {
      score += 3;
      reasons.push(`累计清洁 ${totalCleans} 次`);
    } else if (totalCleans > 120) {
      score += 2;
      reasons.push(`累计清洁 ${totalCleans} 次`);
    } else if (totalCleans > 60) {
      score += 1;
      reasons.push(`累计清洁 ${totalCleans} 次`);
    }

    if (avgSmell >= 4) {
      score += 3;
      reasons.push(`平均异味等级 ${avgSmell.toFixed(1)} / 5`);
    } else if (avgSmell >= 3.2) {
      score += 2;
      reasons.push(`平均异味等级 ${avgSmell.toFixed(1)} / 5`);
    } else if (avgSmell >= 2.8) {
      score += 1;
      reasons.push(`平均异味等级 ${avgSmell.toFixed(1)} / 5`);
    }

    if (hoursSinceLastClean > box.cleanIntervalHours * 3 && score > 0) {
      score += 1;
      reasons.push(`已 ${Math.floor(hoursSinceLastClean)} 小时未清理`);
    }

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (score >= 6) priority = 'high';
    else if (score >= 3) priority = 'medium';

    if (score >= 2) {
      results.push({
        boxId: box.id,
        score,
        priority,
        reasons,
        metrics: {
          daysSinceFullChange,
          fullChangeRatio,
          highSmellStreak,
          totalCleans,
          averageSmell: Number(avgSmell.toFixed(2)),
          hoursSinceLastClean: Number(hoursSinceLastClean.toFixed(1)),
        },
      });
    }
  });

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.metrics.daysSinceFullChange - a.metrics.daysSinceFullChange;
  });
};

export const getBoxDeepCleanStatus = (
  boxId: string,
  records: CleanRecord[],
  boxes: LitterBox[],
  nowISO?: string
): DeepCleanItem | null => {
  const list = getDeepCleanList(records, boxes, nowISO);
  return list.find((item) => item.boxId === boxId) || null;
};
