import type { BlindTest, Suggestion, TastingScore, WaterSample, BrewingParam } from '../types';
import { getScoreBySampleId, calculateAverageScore } from './helpers';

export function generateSampleSuggestion(
  sample: WaterSample,
  score: TastingScore,
  brewingParam?: BrewingParam
): string {
  const tips: string[] = [];

  if (score.acidity <= 5) {
    if (sample.tds > 120) {
      tips.push('TDS 偏高可能压制了酸质，可换用低 TDS 水质或提高水温 1-2°C 增强萃取');
    } else {
      tips.push('酸质偏弱，可尝试提高水温 1-2°C、细研磨 0.2 格来增强萃取');
    }
  } else if (score.acidity >= 8) {
    tips.push('酸质突出，若想平衡可适当降低水温 1°C 或略粗研磨');
  }

  if (score.sweetness <= 5) {
    if (sample.hardness < 60) {
      tips.push('硬度偏低可能影响甜感，下次可试硬度 70-100 mg/L 的水');
    } else {
      tips.push('甜感不足，可尝试延长萃取 10-15 秒或提高水温 1°C');
    }
  }

  if (score.bitterness >= 7) {
    tips.push('苦感偏重，建议降低水温 1-2°C、粗研磨 0.2 格，或缩短萃取 10 秒');
  }

  if (score.aftertaste <= 5) {
    tips.push('余韵偏短，可尝试细研磨 0.1-0.2 格或提高水温 1°C 增加溶出');
  }

  if (score.cleanliness <= 5) {
    if (sample.tds > 130) {
      tips.push('干净度不足可能因矿物质过多，建议 TDS 控制在 80-120 mg/L');
    } else {
      tips.push('干净度偏低，可适当降低水温、缩短萃取时间减少杂味');
    }
  }

  if (tips.length === 0) {
    return '整体表现均衡，维持当前冲煮方案即可；微调可尝试水温 ±1°C 或研磨度 ±0.1 格';
  }

  return tips.join('；');
}

export function generateSuggestions(blindTest: BlindTest): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const samplesWithScores = blindTest.waterSamples
    .map((sample) => ({
      sample,
      score: getScoreBySampleId(blindTest, sample.id),
    }))
    .filter((s): s is { sample: WaterSample; score: TastingScore } => !!s.score);

  if (samplesWithScores.length === 0) {
    return suggestions;
  }

  const sortedByOverall = [...samplesWithScores].sort(
    (a, b) => calculateAverageScore(b.score) - calculateAverageScore(a.score)
  );

  const topSample = sortedByOverall[0];
  const bottomSample = sortedByOverall[sortedByOverall.length - 1];

  suggestions.push({
    title: '推荐水质',
    description: `建议优先使用「${topSample.sample.realName}」，综合评分最高（${calculateAverageScore(topSample.score).toFixed(1)}分）。TDS ${topSample.sample.tds}，pH ${topSample.sample.ph}，在酸质、甜感、余韵等方面表现均衡。`,
    icon: 'droplet',
    priority: 'high',
  });

  const highTDS = samplesWithScores.filter((s) => s.sample.tds >= 120);
  const lowTDS = samplesWithScores.filter((s) => s.sample.tds < 100);

  if (highTDS.length > 0 && lowTDS.length > 0) {
    const highTDSAvg = averageScores(highTDS.map((s) => s.score));
    const lowTDSAvg = averageScores(lowTDS.map((s) => s.score));

    if (highTDSAvg > lowTDSAvg + 0.5) {
      suggestions.push({
        title: 'TDS 建议',
        description: `较高的 TDS（${highTDS[0].sample.tds}+）更能提升这支豆子的甜感和body。建议下次尝试 TDS 在 120-150 之间的水质。`,
        icon: 'trending-up',
        priority: 'high',
      });
    } else if (lowTDSAvg > highTDSAvg + 0.5) {
      suggestions.push({
        title: 'TDS 建议',
        description: `较低的 TDS（${lowTDS[0].sample.tds}-）更能展现这支豆子的酸质和干净度。建议下次尝试 TDS 在 60-100 之间的水质。`,
        icon: 'sparkles',
        priority: 'high',
      });
    }
  }

  const maxAcidity = Math.max(...samplesWithScores.map((s) => s.score.acidity));
  const acidSample = samplesWithScores.find((s) => s.score.acidity === maxAcidity);

  if (acidSample && acidSample.score.acidity >= 7) {
    suggestions.push({
      title: '酸质表现',
      description: `「${acidSample.sample.realName}」的酸质最出色（${acidSample.score.acidity}分）。pH ${acidSample.sample.ph}，说明偏中性或微酸性的水质更能展现这支豆子的果酸特征。`,
      icon: 'citrus',
      priority: 'medium',
    });
  }

  const maxSweetness = Math.max(...samplesWithScores.map((s) => s.score.sweetness));
  const sweetSample = samplesWithScores.find((s) => s.score.sweetness === maxSweetness);

  if (sweetSample && sweetSample.score.sweetness >= 7) {
    suggestions.push({
      title: '甜感表现',
      description: `「${sweetSample.sample.realName}」的甜感最佳（${sweetSample.score.sweetness}分）。硬度 ${sweetSample.sample.hardness}mg/L，适当的钙镁离子有助于提升甜感和醇厚感。`,
      icon: 'cookie',
      priority: 'medium',
    });
  }

  if (blindTest.waterSamples.length >= 3) {
    const tdsValues = samplesWithScores.map((s) => ({
      tds: s.sample.tds,
      score: calculateAverageScore(s.score),
    }));

    const correlation = calculateCorrelation(
      tdsValues.map((t) => t.tds),
      tdsValues.map((t) => t.score)
    );

    if (Math.abs(correlation) > 0.5) {
      const trend = correlation > 0 ? '正相关' : '负相关';
      suggestions.push({
        title: '数据洞察',
        description: `TDS 与整体评分呈${trend}（相关系数 ${correlation.toFixed(2)}）。${correlation > 0 ? '适当增加矿物质含量可能会进一步提升风味表现。' : '降低矿物质含量可能会让风味更加清晰。'}`,
        icon: 'bar-chart-2',
        priority: 'medium',
      });
    }
  }

  if (bottomSample && calculateAverageScore(topSample.score) - calculateAverageScore(bottomSample.score) > 1) {
    suggestions.push({
      title: '提升建议',
      description: `「${bottomSample.sample.realName}」表现相对较弱。如果想改善，可以尝试：降低研磨度 0.2-0.3 格、提高水温 1-2°C、或延长萃取时间 10-15 秒。`,
      icon: 'settings',
      priority: 'low',
    });
  }

  const allTags = samplesWithScores.flatMap((s) => s.score.flavorTags);
  const tagCounts: Record<string, number> = {};
  allTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  const commonTags = Object.entries(tagCounts)
    .filter(([, count]) => count >= Math.ceil(samplesWithScores.length / 2))
    .map(([tag]) => tag);

  if (commonTags.length > 0) {
    suggestions.push({
      title: '风味特征',
      description: `这支豆子的共同风味特征包括：${commonTags.join('、')}。这些风味在不同水质下都能稳定呈现，是这支豆子的核心特质。`,
      icon: 'star',
      priority: 'low',
    });
  }

  return suggestions;
}

function averageScores(scores: TastingScore[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + calculateAverageScore(s), 0) / scores.length;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}
