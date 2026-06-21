import type { Member, StagePosition, VoicePart, AcousticResult } from '@/types';
import { STAGE_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { create2DArray, clamp } from '@/utils/helpers';

interface PositionedMember {
  member: Member;
  row: number;
  col: number;
  rawVolume: number;
  adjacencyBonus: number;
  centerBonus: number;
  finalVolume: number;
}

export function computeAcoustics(
  members: Member[],
  positions: StagePosition[],
  rows: number,
  cols: number
): AcousticResult {
  const memberMap = new Map<string, Member>();
  members.forEach(m => memberMap.set(m.id, m));

  const grid: (Member | null)[][] = create2DArray<Member | null>(rows, cols, null);
  positions.forEach(pos => {
    if (pos.memberId) {
      const m = memberMap.get(pos.memberId);
      if (m) grid[pos.row][pos.col] = m;
    }
  });

  const positioned: PositionedMember[] = [];
  const centerCol = (cols - 1) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const member = grid[r][c];
      if (!member) continue;

      const distAttenuation = 1 - r * STAGE_CONFIG.DISTANCE_ATTENUATION;
      const heightComp = 1 + r * STAGE_CONFIG.HEIGHT_COMPENSATION;
      const distFactor = distAttenuation * heightComp;

      const colDist = Math.abs(c - centerCol);
      const maxColDist = Math.max(centerCol, cols - 1 - centerCol);
      const centerFactor = 1 + (1 - colDist / (maxColDist || 1)) * STAGE_CONFIG.CENTER_BONUS;

      let adjCount = 0;
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
        [r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const nm = grid[nr][nc];
          if (nm && nm.voicePart === member.voicePart && nm.id !== member.id) {
            adjCount++;
          }
        }
      }
      const adjacencyFactor = 1 + Math.min(adjCount, 4) * STAGE_CONFIG.ADJACENCY_BONUS;

      let blockingFactor = 1;
      if (r > 0) {
        const frontMember = grid[r - 1][c];
        if (frontMember && frontMember.vocalPower >= member.vocalPower) {
          blockingFactor = 1 - STAGE_CONFIG.BLOCKING_FACTOR;
        }
      }

      const powerNorm = member.vocalPower / 10;
      const rangeNorm = member.vocalRange / 10;
      const rawVolume = (0.7 * powerNorm + 0.3 * rangeNorm) * 10;

      const finalVolume = clamp(
        rawVolume * distFactor * centerFactor * adjacencyFactor * blockingFactor,
        0.5,
        15
      );

      positioned.push({
        member,
        row: r,
        col: c,
        rawVolume,
        adjacencyBonus: adjacencyFactor,
        centerBonus: centerFactor,
        finalVolume,
      });
    }
  }

  const voiceVolumes: Record<VoicePart, number> = {
    soprano: 0,
    alto: 0,
    tenor: 0,
    bass: 0,
  };

  const memberContribution = new Map<string, number>();
  positioned.forEach(p => {
    voiceVolumes[p.member.voicePart] += p.finalVolume;
    memberContribution.set(p.member.id, p.finalVolume);
  });

  const heatMatrix: number[][] = create2DArray<number>(rows, cols, 0);
  positioned.forEach(p => {
    heatMatrix[p.row][p.col] = p.finalVolume;
  });

  const maxVol = Math.max(...Object.values(voiceVolumes), 0.01);
  const normalizedVols: Record<VoicePart, number> = {
    soprano: voiceVolumes.soprano / maxVol,
    alto: voiceVolumes.alto / maxVol,
    tenor: voiceVolumes.tenor / maxVol,
    bass: voiceVolumes.bass / maxVol,
  };

  const mean =
    (normalizedVols.soprano + normalizedVols.alto + normalizedVols.tenor + normalizedVols.bass) / 4;
  const overlap =
    1 -
    (Math.abs(normalizedVols.soprano - mean) +
      Math.abs(normalizedVols.alto - mean) +
      Math.abs(normalizedVols.tenor - mean) +
      Math.abs(normalizedVols.bass - mean)) /
      4;

  return {
    voiceVolumes,
    heatMatrix,
    overlapScore: clamp(overlap * 100, 0, 100),
    memberContribution,
  };
}

export function getVoicePartVolumes(acoustic: AcousticResult): { part: VoicePart; volume: number; label: string }[] {
  return VOICE_PARTS.map(part => ({
    part,
    volume: acoustic.voiceVolumes[part],
    label: part,
  }));
}
