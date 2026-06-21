import type { Member, ScoreResult, StagePosition, VoicePart } from '@/types';
import { SCORE_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { clamp, create2DArray, standardDeviation } from '@/utils/helpers';
import { computeAcoustics } from './acousticEngine';

export function computeScore(
  members: Member[],
  positions: StagePosition[],
  rows: number,
  cols: number
): ScoreResult {
  const acoustic = computeAcoustics(members, positions, rows, cols);

  const balance = computeBalance(acoustic.voiceVolumes);
  const clarity = computeClarity(members, positions, rows, cols);
  const blend = computeBlend(members, positions, rows, cols, acoustic.voiceVolumes);

  const overall = clamp(
    balance * SCORE_CONFIG.BALANCE_WEIGHT +
      clarity * SCORE_CONFIG.CLARITY_WEIGHT +
      blend * SCORE_CONFIG.BLEND_WEIGHT,
    0,
    100
  );

  return {
    balance: Math.round(balance),
    clarity: Math.round(clarity),
    blend: Math.round(blend),
    overall: Math.round(overall),
  };
}

function computeBalance(voiceVolumes: Record<VoicePart, number>): number {
  const volumes = VOICE_PARTS.map(p => voiceVolumes[p] || 0.01);
  const std = standardDeviation(volumes);
  const mean = volumes.reduce((s, v) => s + v, 0) / volumes.length;
  const cv = mean > 0 ? std / mean : 1;
  const score = 100 - cv * SCORE_CONFIG.BALANCE_K * 100 * 0.5;
  return clamp(score, 0, 100);
}

function computeClarity(
  members: Member[],
  positions: StagePosition[],
  rows: number,
  cols: number
): number {
  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  const grid: (Member | null)[][] = create2DArray<Member | null>(rows, cols, null);
  positions.forEach(pos => {
    if (pos.memberId) {
      const m = memberMap.get(pos.memberId);
      if (m) grid[pos.row][pos.col] = m;
    }
  });

  const voicePartCells: Record<VoicePart, Array<{ r: number; c: number }>> = {
    soprano: [],
    alto: [],
    tenor: [],
    bass: [],
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m = grid[r][c];
      if (m) voicePartCells[m.voicePart].push({ r, c });
    }
  }

  let clusterScore = 0;
  for (const part of VOICE_PARTS) {
    const cells = voicePartCells[part];
    if (cells.length <= 1) {
      clusterScore += SCORE_CONFIG.CLUSTER_BONUS_BASE;
      continue;
    }

    let totalDist = 0;
    let pairCount = 0;
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const d = Math.abs(cells[i].r - cells[j].r) + Math.abs(cells[i].c - cells[j].c);
        totalDist += d;
        pairCount++;
      }
    }
    const avgDist = pairCount > 0 ? totalDist / pairCount : 0;
    const maxPossibleDist = rows + cols;
    const compactness = 1 - Math.min(avgDist / maxPossibleDist, 1);
    clusterScore += compactness * SCORE_CONFIG.CLUSTER_BONUS_BASE;
  }

  let positionScore = 0;
  const centerCol = (cols - 1) / 2;
  const maxCenterDist = Math.max(centerCol, cols - 1 - centerCol);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m = grid[r][c];
      if (!m || m.experience < 7) continue;
      const frontFactor = rows > 1 ? 1 - r / (rows - 1) : 0.5;
      const centerFactor = maxCenterDist > 0 ? 1 - Math.abs(c - centerCol) / maxCenterDist : 1;
      const positionValue = (frontFactor * 0.6 + centerFactor * 0.4);
      positionScore += positionValue;
    }
  }
  const leadCount = members.filter(m => m.experience >= 7).length || 1;
  positionScore = (positionScore / leadCount) * SCORE_CONFIG.POSITION_BONUS_MAX;

  let separationScore = 0;
  const checks = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ];
  let validPairs = 0;
  let samePartPairs = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m1 = grid[r][c];
      if (!m1) continue;
      for (const [dr, dc] of checks) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const m2 = grid[nr][nc];
        if (!m2) continue;
        if (dr + dc < 0) continue;
        validPairs++;
        if (m1.voicePart === m2.voicePart) samePartPairs++;
      }
    }
  }
  if (validPairs > 0) {
    const sameRatio = samePartPairs / validPairs;
    separationScore = sameRatio * 30;
  }

  const total = clamp(clusterScore + positionScore + separationScore, 0, 100);
  return total;
}

function computeBlend(
  members: Member[],
  positions: StagePosition[],
  rows: number,
  cols: number,
  voiceVolumes: Record<VoicePart, number>
): number {
  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  const grid: (Member | null)[][] = create2DArray<Member | null>(rows, cols, null);
  positions.forEach(pos => {
    if (pos.memberId) {
      const m = memberMap.get(pos.memberId);
      if (m) grid[pos.row][pos.col] = m;
    }
  });

  const partOrder: Record<VoicePart, number> = {
    soprano: 0,
    alto: 1,
    tenor: 2,
    bass: 3,
  };

  let transitionPenalty = 0;
  let transitionCount = 0;
  const checks: Array<[number, number]> = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m1 = grid[r][c];
      if (!m1) continue;
      for (const [dr, dc] of checks) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const m2 = grid[nr][nc];
        if (!m2) continue;
        const diff = Math.abs(partOrder[m1.voicePart] - partOrder[m2.voicePart]);
        if (diff > 1) {
          transitionPenalty += diff - 1;
        }
        transitionCount++;
      }
    }
  }
  const avgPenalty = transitionCount > 0 ? transitionPenalty / transitionCount : 0;
  const transitionScore = clamp(
    100 - avgPenalty * SCORE_CONFIG.TRANSITION_PENALTY_BASE,
    0,
    100
  );

  const voicePartCells: Record<VoicePart, Array<{ r: number; c: number }>> = {
    soprano: [],
    alto: [],
    tenor: [],
    bass: [],
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m = grid[r][c];
      if (m) voicePartCells[m.voicePart].push({ r, c });
    }
  }

  const centers: Array<{ r: number; c: number }> = [];
  for (const part of VOICE_PARTS) {
    const cells = voicePartCells[part];
    if (cells.length === 0) continue;
    const rAvg = cells.reduce((s, x) => s + x.r, 0) / cells.length;
    const cAvg = cells.reduce((s, x) => s + x.c, 0) / cells.length;
    centers.push({ r: rAvg, c: cAvg });
  }

  let uniformityScore = SCORE_CONFIG.UNIFORMITY_BONUS_BASE;
  if (centers.length >= 2) {
    const dists: number[] = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const d = Math.sqrt(
          Math.pow(centers[i].r - centers[j].r, 2) + Math.pow(centers[i].c - centers[j].c, 2)
        );
        dists.push(d);
      }
    }
    if (dists.length > 0) {
      const meanD = dists.reduce((s, d) => s + d, 0) / dists.length;
      const stdD = standardDeviation(dists);
      const cv = meanD > 0 ? stdD / meanD : 1;
      uniformityScore = clamp((1 - cv) * SCORE_CONFIG.UNIFORMITY_BONUS_BASE * 4, 0, 100);
    }
  }

  const volumeGradients: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const m1 = grid[r][c];
      const m2 = grid[r][c + 1];
      if (m1 && m2) {
        volumeGradients.push(Math.abs((m1.vocalPower + m1.vocalRange) - (m2.vocalPower + m2.vocalRange)));
      }
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const m1 = grid[r][c];
      const m2 = grid[r + 1][c];
      if (m1 && m2) {
        volumeGradients.push(Math.abs((m1.vocalPower + m1.vocalRange) - (m2.vocalPower + m2.vocalRange)));
      }
    }
  }
  let gradientScore = SCORE_CONFIG.GRADIENT_SMOOTH_BASE;
  if (volumeGradients.length > 0) {
    const avgGrad = volumeGradients.reduce((s, g) => s + g, 0) / volumeGradients.length;
    gradientScore = clamp(100 - avgGrad * SCORE_CONFIG.GRADIENT_SMOOTH_BASE * 0.5, 0, 100);
  }

  const vols = VOICE_PARTS.map(p => voiceVolumes[p] || 0);
  const maxV = Math.max(...vols, 0.01);
  const normalized = vols.map(v => v / maxV);
  const mean = normalized.reduce((s, v) => s + v, 0) / normalized.length;
  const absDevSum = normalized.reduce((s, v) => s + Math.abs(v - mean), 0);
  const balancePartScore = clamp(100 - (absDevSum / normalized.length) * 100, 0, 100);

  return clamp(
    transitionScore * 0.3 +
      uniformityScore * 0.25 +
      gradientScore * 0.2 +
      balancePartScore * 0.25,
    0,
    100
  );
}
