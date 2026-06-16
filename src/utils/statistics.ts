import type { Sample, Feedback, ProblemType, SizeCode, FeelLevel } from '@/types';
import { getSamples, getFeedbacks } from '@/utils/storage';

const SIZE_CODES: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PROBLEM_TYPES: ProblemType[] = ['pattern', 'fabric', 'workmanship', 'comfort'];
const FEEL_LEVELS: FeelLevel[] = [1, 2, 3];

function initSizeCount(): Record<SizeCode, number> {
  return SIZE_CODES.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {} as Record<SizeCode, number>);
}

function initProblemCount(): Record<ProblemType, number> {
  return PROBLEM_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<ProblemType, number>);
}

function initFeelCount(): Record<FeelLevel, number> {
  return FEEL_LEVELS.reduce((acc, level) => {
    acc[level] = 0;
    return acc;
  }, {} as Record<FeelLevel, number>);
}

export function getFeedbacksBySampleId(sampleId: string): Feedback[] {
  return getFeedbacks().filter(f => f.sampleId === sampleId);
}

export function getFeedbackCountBySize(sampleId: string): Record<SizeCode, number> {
  const feedbacks = getFeedbacksBySampleId(sampleId);
  const count = initSizeCount();
  feedbacks.forEach(f => {
    count[f.trySize]++;
  });
  return count;
}

export function getProblemCountBySize(sampleId: string): Record<SizeCode, number> {
  const feedbacks = getFeedbacksBySampleId(sampleId);
  const count = initSizeCount();
  feedbacks.forEach(f => {
    if (f.problemTypes.length > 0) {
      count[f.trySize]++;
    }
  });
  return count;
}

export function getProblemTypeDistribution(sampleId?: string): Record<ProblemType, number> {
  const feedbacks = sampleId ? getFeedbacksBySampleId(sampleId) : getFeedbacks();
  const dist = initProblemCount();
  feedbacks.forEach(f => {
    f.problemTypes.forEach(type => {
      dist[type]++;
    });
  });
  return dist;
}

export function getHeatmapData(sampleId?: string): { size: SizeCode; problemType: ProblemType; count: number }[] {
  const feedbacks = sampleId ? getFeedbacksBySampleId(sampleId) : getFeedbacks();
  const result: { size: SizeCode; problemType: ProblemType; count: number }[] = [];
  SIZE_CODES.forEach(size => {
    PROBLEM_TYPES.forEach(problemType => {
      const count = feedbacks.filter(f => f.trySize === size && f.problemTypes.includes(problemType)).length;
      result.push({ size, problemType, count });
    });
  });
  return result;
}

export function aggregateSuggestions(sampleId?: string): { text: string; count: number }[] {
  const feedbacks = sampleId ? getFeedbacksBySampleId(sampleId) : getFeedbacks();
  const map = new Map<string, number>();
  feedbacks.forEach(f => {
    f.suggestions.forEach(s => {
      const text = s.trim();
      if (text) {
        map.set(text, (map.get(text) || 0) + 1);
      }
    });
  });
  return Array.from(map.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSizeFeelStats(
  sampleId: string,
  size: SizeCode
): { shoulder: Record<FeelLevel, number>; chest: Record<FeelLevel, number>; waist: Record<FeelLevel, number> } {
  const feedbacks = getFeedbacksBySampleId(sampleId).filter(f => f.trySize === size);
  const shoulder = initFeelCount();
  const chest = initFeelCount();
  const waist = initFeelCount();
  feedbacks.forEach(f => {
    shoulder[f.shoulderFeel]++;
    chest[f.chestFeel]++;
    waist[f.waistFeel]++;
  });
  return { shoulder, chest, waist };
}

export function getProductionReadiness(sampleId: string): { ready: boolean; score: number; issues: string[] } {
  const feedbacks = getFeedbacksBySampleId(sampleId);
  const issues: string[] = [];
  let score = 100;

  if (feedbacks.length === 0) {
    return { ready: false, score: 0, issues: ['暂无试穿反馈数据'] };
  }

  const totalFeedbacks = feedbacks.length;
  const feedbacksWithProblems = feedbacks.filter(f => f.problemTypes.length > 0).length;
  const problemRate = feedbacksWithProblems / totalFeedbacks;

  if (problemRate > 0.5) {
    score -= 40;
    issues.push('超过半数反馈存在问题');
  } else if (problemRate > 0.3) {
    score -= 20;
    issues.push('部分反馈存在问题');
  }

  const tightFeedbacks = feedbacks.filter(f => f.shoulderFeel === 1 || f.chestFeel === 1 || f.waistFeel === 1);
  if (tightFeedbacks.length > totalFeedbacks * 0.3) {
    score -= 15;
    issues.push('较多反馈反映尺寸过紧');
  }

  const looseFeedbacks = feedbacks.filter(f => f.shoulderFeel === 3 || f.chestFeel === 3 || f.waistFeel === 3);
  if (looseFeedbacks.length > totalFeedbacks * 0.3) {
    score -= 15;
    issues.push('较多反馈反映尺寸过松');
  }

  const patternIssues = feedbacks.filter(f => f.problemTypes.includes('pattern')).length;
  if (patternIssues > totalFeedbacks * 0.3) {
    score -= 10;
    issues.push('版型问题较为突出');
  }

  const workmanshipIssues = feedbacks.filter(f => f.problemTypes.includes('workmanship')).length;
  if (workmanshipIssues > totalFeedbacks * 0.2) {
    score -= 10;
    issues.push('工艺问题需要关注');
  }

  score = Math.max(0, Math.min(100, score));

  return {
    ready: score >= 70,
    score,
    issues
  };
}

export function getVersionChain(sampleId: string): Sample[] {
  const samples = getSamples();
  const chain: Sample[] = [];
  const visited = new Set<string>();

  let current = samples.find(s => s.id === sampleId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    if (current.previousVersionId) {
      current = samples.find(s => s.id === current.previousVersionId);
    } else {
      break;
    }
  }

  return chain;
}

export interface SizeProblemHotspot {
  size: SizeCode;
  currentCount: number;
  previousCount: number;
  delta: number;
}

export interface ProblemTypeDelta {
  type: ProblemType;
  currentCount: number;
  previousCount: number;
  delta: number;
}

export interface SuggestionDelta {
  text: string;
  currentCount: number;
  previousCount: number;
  status: 'new' | 'resolved' | 'reduced' | 'persisted' | 'increased';
}

export type OldProblemCategory = 'fit' | 'action' | 'description';

export interface OldSpecificProblem {
  id: string;
  category: OldProblemCategory;
  size: SizeCode;
  bodyPart?: 'shoulder' | 'chest' | 'waist';
  feelLevel?: FeelLevel;
  actionName?: string;
  descriptionText?: string;
  problemTypes?: ProblemType[];
  originalText: string;
  wearerName: string;
  status: 'resolved' | 'improved' | 'persisted' | 'worsened';
  evidence: string;
}

export interface OldProblemStatus {
  problem: string;
  type: ProblemType;
  status: 'resolved' | 'persisted';
}

export interface VersionComparisonData {
  currentSample: Sample;
  previousSample: Sample;
  sizeHotspots: SizeProblemHotspot[];
  problemTypeDeltas: ProblemTypeDelta[];
  suggestionDeltas: SuggestionDelta[];
  oldProblemStatuses: OldProblemStatus[];
  oldSpecificProblems: OldSpecificProblem[];
  overallImproved: boolean;
}

export function getVersionComparison(currentSampleId: string): VersionComparisonData | null {
  const currentSample = getSamples().find(s => s.id === currentSampleId);
  if (!currentSample || !currentSample.previousVersionId) return null;

  const previousSample = getSamples().find(s => s.id === currentSample.previousVersionId);
  if (!previousSample) return null;

  const currentFeedbacks = getFeedbacksBySampleId(currentSampleId);
  const previousFeedbacks = getFeedbacksBySampleId(previousSample.id);

  const currentProblemBySize = initSizeCount();
  const previousProblemBySize = initSizeCount();
  currentFeedbacks.forEach(f => { if (f.problemTypes.length > 0) currentProblemBySize[f.trySize]++; });
  previousFeedbacks.forEach(f => { if (f.problemTypes.length > 0) previousProblemBySize[f.trySize]++; });

  const sizeHotspots: SizeProblemHotspot[] = SIZE_CODES
    .filter(size => currentSample.sizes.includes(size) || previousSample.sizes.includes(size))
    .map(size => ({
      size,
      currentCount: currentProblemBySize[size],
      previousCount: previousProblemBySize[size],
      delta: currentProblemBySize[size] - previousProblemBySize[size],
    }));

  const currentProblemDist = initProblemCount();
  const previousProblemDist = initProblemCount();
  currentFeedbacks.forEach(f => f.problemTypes.forEach(t => currentProblemDist[t]++));
  previousFeedbacks.forEach(f => f.problemTypes.forEach(t => previousProblemDist[t]++));

  const problemTypeDeltas: ProblemTypeDelta[] = PROBLEM_TYPES.map(type => ({
    type,
    currentCount: currentProblemDist[type],
    previousCount: previousProblemDist[type],
    delta: currentProblemDist[type] - previousProblemDist[type],
  }));

  const currentSuggestions = aggregateSuggestions(currentSampleId);
  const previousSuggestions = aggregateSuggestions(previousSample.id);
  const allSuggestionTexts = new Set([
    ...currentSuggestions.map(s => s.text),
    ...previousSuggestions.map(s => s.text),
  ]);

  const suggestionDeltas: SuggestionDelta[] = Array.from(allSuggestionTexts).map(text => {
    const curr = currentSuggestions.find(s => s.text === text)?.count || 0;
    const prev = previousSuggestions.find(s => s.text === text)?.count || 0;
    let status: SuggestionDelta['status'];
    if (prev === 0 && curr > 0) status = 'new';
    else if (curr === 0 && prev > 0) status = 'resolved';
    else if (curr < prev) status = 'reduced';
    else if (curr > prev) status = 'increased';
    else status = 'persisted';
    return { text, currentCount: curr, previousCount: prev, status };
  }).sort((a, b) => {
    const order: Record<SuggestionDelta['status'], number> = {
      persisted: 0, increased: 1, new: 2, reduced: 3, resolved: 4,
    };
    return order[a.status] - order[b.status];
  });

  const oldProblemStatuses: OldProblemStatus[] = [];
  PROBLEM_TYPES.forEach(type => {
    if (previousProblemDist[type] > 0) {
      const isResolved = currentProblemDist[type] === 0;
      oldProblemStatuses.push({
        problem: `「${type === 'pattern' ? '版型' : type === 'fabric' ? '面料' : type === 'workmanship' ? '工艺' : '舒适度'}」问题`,
        type,
        status: isResolved ? 'resolved' : 'persisted',
      });
    }
  });

  const oldSpecificProblems: OldSpecificProblem[] = [];
  const currentFeedbacksBySize: Record<SizeCode, Feedback[]> = {} as Record<SizeCode, Feedback[]>;
  SIZE_CODES.forEach(size => {
    currentFeedbacksBySize[size] = currentFeedbacks.filter(f => f.trySize === size);
  });

  const BODY_PART_LABEL: Record<string, string> = {
    shoulder: '肩宽',
    chest: '胸围',
    waist: '腰围',
  };

  const FEEL_LABEL_SHORT: Record<FeelLevel, string> = {
    1: '过紧',
    2: '合适',
    3: '过松',
  };

  previousFeedbacks.forEach(prevFb => {
    const size = prevFb.trySize;
    const currentSameSize = currentFeedbacksBySize[size] || [];

    (['shoulder', 'chest', 'waist'] as const).forEach(part => {
      const feelKey = `${part}Feel` as keyof Feedback;
      const noteKey = `${part}Note` as keyof Feedback;
      const feel = prevFb[feelKey] as FeelLevel;
      const note = prevFb[noteKey] as string | undefined;

      if (feel !== 2) {
        const currSameFeelCount = currentSameSize.filter(fb => {
          const currFeel = fb[feelKey] as FeelLevel;
          return currFeel === feel;
        }).length;
        const currBetterCount = currentSameSize.filter(fb => {
          const currFeel = fb[feelKey] as FeelLevel;
          return feel === 1 ? currFeel >= 2 : currFeel <= 2;
        }).length;
        const currWorseCount = currentSameSize.filter(fb => {
          const currFeel = fb[feelKey] as FeelLevel;
          return feel === 1 ? currFeel === 1 : currFeel === 3;
        }).length;

        let status: OldSpecificProblem['status'];
        let evidence: string;
        if (currentSameSize.length === 0) {
          status = 'persisted';
          evidence = '新版该尺码暂无反馈，待验证';
        } else if (currWorseCount === 0 && currBetterCount > 0) {
          status = 'resolved';
          evidence = `新版 ${size} 码 ${currentSameSize.length} 人反馈中 ${currBetterCount} 人感受已合适`;
        } else if (currBetterCount > currWorseCount) {
          status = 'improved';
          evidence = `新版 ${size} 码 ${currBetterCount} 人感受改善，${currWorseCount} 人仍有此问题`;
        } else if (currWorseCount > currBetterCount) {
          status = 'worsened';
          evidence = `新版 ${size} 码仍有 ${currWorseCount} 人反馈相同问题`;
        } else {
          status = 'persisted';
          evidence = `新版 ${size} 码仍有 ${currWorseCount} 人反馈相同问题`;
        }

        const originalText = note
          ? `${BODY_PART_LABEL[part]}${FEEL_LABEL_SHORT[feel]}：${note}`
          : `${BODY_PART_LABEL[part]}${FEEL_LABEL_SHORT[feel]}`;

        oldSpecificProblems.push({
          id: `fit-${prevFb.id}-${part}`,
          category: 'fit',
          size,
          bodyPart: part,
          feelLevel: feel,
          problemTypes: prevFb.problemTypes.filter(t => t === 'pattern' || t === 'comfort'),
          originalText,
          wearerName: prevFb.wearerName,
          status,
          evidence,
        });
      }
    });

    prevFb.limitedActions.forEach(action => {
      const stillLimited = currentSameSize.filter(fb =>
        fb.limitedActions.includes(action)
      ).length;

      let status: OldSpecificProblem['status'];
      let evidence: string;
      if (currentSameSize.length === 0) {
        status = 'persisted';
        evidence = '新版该尺码暂无反馈，待验证';
      } else if (stillLimited === 0) {
        status = 'resolved';
        evidence = `新版 ${size} 码 ${currentSameSize.length} 人均无此受限`;
      } else if (stillLimited < prevFb.limitedActions.length) {
        status = 'improved';
        evidence = `新版 ${size} 码仍有 ${stillLimited} 人反馈该动作受限`;
      } else {
        status = 'persisted';
        evidence = `新版 ${size} 码仍有 ${stillLimited} 人反馈该动作受限`;
      }

      oldSpecificProblems.push({
        id: `action-${prevFb.id}-${action}`,
        category: 'action',
        size,
        actionName: action,
        problemTypes: prevFb.problemTypes,
        originalText: `活动受限：${action}`,
        wearerName: prevFb.wearerName,
        status,
        evidence,
      });
    });

    if (prevFb.problemDescription && prevFb.problemTypes.length > 0) {
      const sameTypeProblems = currentSameSize.filter(fb =>
        fb.problemTypes.some(t => prevFb.problemTypes.includes(t))
      ).length;

      let status: OldSpecificProblem['status'];
      let evidence: string;
      if (currentSameSize.length === 0) {
        status = 'persisted';
        evidence = '新版该尺码暂无反馈，待验证';
      } else if (sameTypeProblems === 0) {
        status = 'resolved';
        evidence = `新版 ${size} 码暂无同类型问题反馈`;
      } else {
        status = 'persisted';
        evidence = `新版 ${size} 码仍有 ${sameTypeProblems} 人反馈同类型问题`;
      }

      oldSpecificProblems.push({
        id: `desc-${prevFb.id}`,
        category: 'description',
        size,
        problemTypes: prevFb.problemTypes,
        descriptionText: prevFb.problemDescription,
        originalText: prevFb.problemDescription,
        wearerName: prevFb.wearerName,
        status,
        evidence,
      });
    }
  });

  oldSpecificProblems.sort((a, b) => {
    const statusOrder: Record<OldSpecificProblem['status'], number> = {
      worsened: 0,
      persisted: 1,
      improved: 2,
      resolved: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const totalCurrentProblems = Object.values(currentProblemDist).reduce((a, b) => a + b, 0);
  const totalPreviousProblems = Object.values(previousProblemDist).reduce((a, b) => a + b, 0);
  const overallImproved = totalCurrentProblems <= totalPreviousProblems;

  return {
    currentSample,
    previousSample,
    sizeHotspots,
    problemTypeDeltas,
    suggestionDeltas,
    oldProblemStatuses,
    oldSpecificProblems,
    overallImproved,
  };
}
