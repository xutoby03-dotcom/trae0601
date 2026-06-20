import type { IssueMarker, Severity, IssueType } from '../types';

const severityScores: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const typeWeights: Record<IssueType, number> = {
  groove: 1.5,
  water: 1.2,
  ice_debris: 0.8,
  closed_area: 1.3,
};

export function calculatePriority(issue: IssueMarker, isPreRace: boolean = false): number {
  const ageHours = (Date.now() - issue.createdAt) / 3600000;
  const ageMultiplier = Math.min(1 + ageHours * 0.1, 2.5);
  const baseScore = severityScores[issue.severity] * typeWeights[issue.type] * ageMultiplier;
  return isPreRace ? baseScore * 2 : baseScore;
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
  }
}

export function getIssueTypeLabel(type: IssueType): string {
  switch (type) {
    case 'groove': return '起槽';
    case 'water': return '积水';
    case 'ice_debris': return '碎冰';
    case 'closed_area': return '封区';
  }
}

export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
  }
}

export function sortIssuesByPriority(issues: IssueMarker[], isPreRace: boolean = false): IssueMarker[] {
  return [...issues].sort((a, b) => calculatePriority(b, isPreRace) - calculatePriority(a, isPreRace));
}

export function calculateIceScore(issues: IssueMarker[]): number {
  const unresolved = issues.filter((i) => !i.resolved);
  if (unresolved.length === 0) return 100;

  const totalPenalty = unresolved.reduce((sum, issue) => {
    const penalty = severityScores[issue.severity] * 5 * typeWeights[issue.type];
    return sum + penalty;
  }, 0);

  return Math.max(0, Math.round(100 - totalPenalty));
}
