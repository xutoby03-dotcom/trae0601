import type { BlindCode, BlindTest, TastingScore, WaterSample } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function assignBlindCodes(sampleCount: number): BlindCode[] {
  const codes: BlindCode[] = ['A', 'B', 'C'];
  const shuffled = [...codes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(sampleCount, 3));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getSampleById(
  blindTest: BlindTest,
  sampleId: string
): WaterSample | undefined {
  return blindTest.waterSamples.find((s) => s.id === sampleId);
}

export function getScoreBySampleId(
  blindTest: BlindTest,
  sampleId: string
): TastingScore | undefined {
  return blindTest.tastingScores.find((s) => s.waterSampleId === sampleId);
}

export function calculateAverageScore(score: TastingScore): number {
  const values = [score.acidity, score.sweetness, score.aftertaste, score.cleanliness];
  const adjustedBitterness = 10 - score.bitterness;
  values.push(adjustedBitterness);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getSortedSamplesByPreference(
  blindTest: BlindTest
): WaterSample[] {
  const sorted = [...blindTest.waterSamples].sort((a, b) => {
    const scoreA = getScoreBySampleId(blindTest, a.id);
    const scoreB = getScoreBySampleId(blindTest, b.id);
    if (!scoreA || !scoreB) return 0;
    return scoreA.preferenceRank - scoreB.preferenceRank;
  });
  return sorted;
}

export function getSortedSamplesByBlindCode(
  blindTest: BlindTest
): WaterSample[] {
  const order: Record<BlindCode, number> = { A: 0, B: 1, C: 2 };
  return [...blindTest.waterSamples].sort((a, b) => order[a.blindCode] - order[b.blindCode]);
}

export function isAllScoresCompleted(blindTest: BlindTest): boolean {
  return blindTest.waterSamples.every((sample) =>
    blindTest.tastingScores.some((s) => s.waterSampleId === sample.id)
  );
}

export function isAllBrewingCompleted(blindTest: BlindTest): boolean {
  return blindTest.waterSamples.every((sample) =>
    blindTest.brewingParams.some((p) => p.waterSampleId === sample.id)
  );
}

export const CHART_COLORS = [
  '#3E2723',
  '#FF8F00',
  '#2E7D32',
  '#6A1B9A',
  '#0277BD',
];

export function getBlindCodeColor(code: BlindCode): string {
  const colors: Record<BlindCode, string> = {
    A: '#3E2723',
    B: '#FF8F00',
    C: '#2E7D32',
  };
  return colors[code];
}
