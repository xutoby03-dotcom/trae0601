import { Inspection, EvaluationReport, RiskLevel, CheckStatus, RiskTag, CheckItem } from '@/types';
import { CONDITIONS, getCheckItemRiskConfig } from '@/data/checklistItems';

export interface AggregatedRisk {
  name: string;
  level: RiskLevel;
  description: string;
  priceImpact: number;
  source: 'checkitem' | 'manual';
  status?: CheckStatus;
}

export function collectAggregatedRisks(inspection: Inspection): AggregatedRisk[] {
  const risks: AggregatedRisk[] = [];

  inspection.checkItems.forEach((item: CheckItem) => {
    if (item.status !== 'fail' && item.status !== 'warning') return;

    const cfg = getCheckItemRiskConfig(item.itemName, item.category);
    if (!cfg) return;

    const isFail = item.status === 'fail';
    const level = isFail ? cfg.failLevel : cfg.warningLevel;
    const priceImpact = isFail ? cfg.failPriceImpact : cfg.warningPriceImpact;

    risks.push({
      name: item.itemName,
      level,
      description: item.notes || item.description,
      priceImpact,
      source: 'checkitem',
      status: item.status,
    });
  });

  inspection.riskTags.forEach((tag: RiskTag) => {
    risks.push({
      name: tag.name,
      level: tag.level,
      description: tag.description,
      priceImpact: tag.priceImpact,
      source: 'manual',
    });
  });

  const order = { high: 0, medium: 1, low: 2 };
  risks.sort((a, b) => order[a.level] - order[b.level] || b.priceImpact - a.priceImpact);

  return risks;
}

export function countRisksByLevel(risks: AggregatedRisk[]) {
  return {
    high: risks.filter(r => r.level === 'high').length,
    medium: risks.filter(r => r.level === 'medium').length,
    low: risks.filter(r => r.level === 'low').length,
  };
}

export function calculateEvaluation(inspection: Inspection): EvaluationReport {
  const { lensInfo, checkItems } = inspection;

  const conditionDiscount = CONDITIONS.find(c => c.value === lensInfo.condition)?.discount ?? 0.8;

  const aggregatedRisks = collectAggregatedRisks(inspection);
  const { high: highCount, medium: mediumCount, low: lowCount } = countRisksByLevel(aggregatedRisks);

  const totalPriceImpact = aggregatedRisks.reduce((sum, r) => sum + r.priceImpact, 0);

  const bargainReasons: string[] = aggregatedRisks.map((r) => {
    const src = r.source === 'manual' ? '手动标记' : '检测项';
    const suffix = r.status && r.status !== 'fail' ? `（状态：${statusLabel(r.status)}）` : '';
    return `【${riskLevelLabel(r.level)}】${r.name}：${r.description}${suffix}（建议砍价约 ¥${r.priceImpact}，来源：${src}）`;
  });

  const failCount = checkItems.filter(i => i.status === 'fail').length;
  const warningCount = checkItems.filter(i => i.status === 'warning').length;
  const passCount = checkItems.filter(i => i.status === 'pass').length;
  const total = checkItems.length;

  const baseScore = (passCount / total) * 100;
  const penalty = failCount * 5 + warningCount * 2;
  const overallScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));

  let recommendation: EvaluationReport['recommendation'] = 'buy';
  if (overallScore < 50 || failCount >= 3 || highCount >= 1) {
    recommendation = 'avoid';
  } else if (overallScore < 75 || failCount >= 1 || warningCount >= 3 || mediumCount >= 2) {
    recommendation = 'caution';
  }

  if (bargainReasons.length === 0) {
    bargainReasons.push('镜头整体状态良好，可参考市场价成交');
  }

  const sellerPrice = lensInfo.sellerPrice || 0;
  const basePrice = Math.round(sellerPrice * conditionDiscount);
  const fairPrice = Math.max(0, basePrice - totalPriceImpact);
  const minPrice = Math.max(0, Math.round(fairPrice * 0.92));
  const maxPrice = Math.max(0, Math.round(fairPrice * 1.08));

  const summary = generateSummary(recommendation, overallScore, highCount, mediumCount, failCount);

  return {
    recommendation,
    minPrice,
    maxPrice,
    fairPrice,
    bargainReasons,
    overallScore,
    summary,
  };
}

export function riskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case 'high': return '高风险';
    case 'medium': return '中风险';
    case 'low': return '低风险';
  }
}

export function statusLabel(status: CheckStatus): string {
  switch (status) {
    case 'pass': return '正常';
    case 'warning': return '注意';
    case 'fail': return '异常';
    case 'untested': return '未检测';
  }
}

export function recommendationLabel(rec: EvaluationReport['recommendation']): string {
  switch (rec) {
    case 'buy': return '建议购买';
    case 'caution': return '谨慎购买';
    case 'avoid': return '不建议购买';
  }
}

function generateSummary(
  recommendation: EvaluationReport['recommendation'],
  score: number,
  highRisks: number,
  mediumRisks: number,
  fails: number
): string {
  if (recommendation === 'avoid') {
    return `该镜头存在 ${highRisks} 项高风险问题和 ${fails} 项检测异常，综合得分仅 ${score}/100，建议放弃寻找更优选择。`;
  }
  if (recommendation === 'caution') {
    return `该镜头综合得分 ${score}/100，存在 ${highRisks} 项高风险和 ${mediumRisks} 项中风险问题。可以考虑购买，但需根据问题清单进行充分砍价。`;
  }
  return `该镜头综合得分 ${score}/100，整体状态良好，未发现严重问题。可以在合理价格范围内放心购买。`;
}

export function formatPrice(value: number): string {
  if (!value) return '¥0';
  return '¥' + String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
