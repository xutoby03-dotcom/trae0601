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
