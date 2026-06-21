import type { Member, Scheme, StagePosition, SubstituteCandidate } from '@/types';
import { generateId, clamp } from '@/utils/helpers';
import { computeScore } from './scoreEngine';

interface FindSubstitutesParams {
  scheme: Scheme;
  members: Member[];
  absentMemberId: string;
  candidateIds?: string[];
  topN?: number;
}

export function findBestSubstitutes(params: FindSubstitutesParams): SubstituteCandidate[] {
  const { scheme, members, absentMemberId, candidateIds, topN = 3 } = params;

  const originalScore = computeScore(
    members,
    scheme.positions,
    scheme.gridRows,
    scheme.gridCols
  );

  const absentPosition = scheme.positions.find(p => p.memberId === absentMemberId);
  if (!absentPosition) return [];

  const absentMember = members.find(m => m.id === absentMemberId);
  if (!absentMember) return [];

  let candidates: Member[];
  if (candidateIds && candidateIds.length > 0) {
    candidates = members.filter(
      m => candidateIds.includes(m.id) && m.id !== absentMemberId
    );
  } else {
    candidates = members.filter(m => m.id !== absentMemberId);
  }

  const usedIds = new Set(scheme.positions.map(p => p.memberId).filter(Boolean));
  candidates = candidates.filter(m => !usedIds.has(m.id));

  const results: SubstituteCandidate[] = [];

  for (const candidate of candidates) {
    const sameVoiceBonus = candidate.voicePart === absentMember.voicePart ? 1.5 : 1.0;

    const originalWithoutAbsent = scheme.positions.map(p =>
      p.memberId === absentMemberId ? { ...p, memberId: candidate.id } : p
    );
    const scoreOriginalPos = computeScore(
      members,
      originalWithoutAbsent,
      scheme.gridRows,
      scheme.gridCols
    );

    let bestPosScore = scoreOriginalPos;
    let bestRow = absentPosition.row;
    let bestCol = absentPosition.col;

    const emptyPositions = scheme.positions.filter(p => !p.memberId);
    for (const empty of emptyPositions) {
      const trialPositions: StagePosition[] = scheme.positions
        .filter(p => p.memberId !== absentMemberId)
        .map(p => ({ ...p }));
      trialPositions.push({
        id: generateId('pos'),
        schemeId: scheme.id,
        memberId: candidate.id,
        row: empty.row,
        col: empty.col,
      });

      const scoreTrial = computeScore(
        members,
        trialPositions,
        scheme.gridRows,
        scheme.gridCols
      );

      if (scoreTrial.overall > bestPosScore.overall) {
        bestPosScore = scoreTrial;
        bestRow = empty.row;
        bestCol = empty.col;
      }
    }

    const balanceDelta = bestPosScore.balance - originalScore.balance;
    const clarityDelta = bestPosScore.clarity - originalScore.clarity;
    const blendDelta = bestPosScore.blend - originalScore.blend;
    const overallDelta = bestPosScore.overall - originalScore.overall;

    const voicePartMatch = candidate.voicePart === absentMember.voicePart ? 25 : 0;
    const powerDiff = Math.abs(candidate.vocalPower - absentMember.vocalPower);
    const rangeDiff = Math.abs(candidate.vocalRange - absentMember.vocalRange);
    const expDiff = Math.abs(candidate.experience - absentMember.experience);
    const attrSimilarity = clamp(100 - (powerDiff + rangeDiff + expDiff) * 4, 0, 100);

    const rawImpact = clamp(100 - Math.abs(overallDelta) - voicePartMatch - attrSimilarity * 0.3, 0, 100);
    const impactScore = clamp(rawImpact / sameVoiceBonus, 0, 100);

    results.push({
      substituteMemberId: candidate.id,
      impactScore: Math.round(impactScore),
      recommendedRow: bestRow,
      recommendedCol: bestCol,
      balanceDelta: Math.round(balanceDelta),
      clarityDelta: Math.round(clarityDelta),
      blendDelta: Math.round(blendDelta),
      newScore: bestPosScore,
    });
  }

  results.sort((a, b) => a.impactScore - b.impactScore);

  return results.slice(0, topN);
}

export function formatDelta(value: number): string {
  if (value === 0) return '±0';
  return value > 0 ? `+${value}` : `${value}`;
}

export function getDeltaColorClass(value: number): string {
  if (value > 5) return 'text-emerald-400';
  if (value > 0) return 'text-emerald-300';
  if (value === 0) return 'text-zinc-400';
  if (value > -5) return 'text-amber-400';
  return 'text-rose-400';
}
