import { Inspection, EvaluationReport, RiskLevel, CheckStatus, RiskTag } from '@/types';
import { CONDITIONS } from '@/data/checklistItems';

export function calculateEvaluation(inspection: Inspection): EvaluationReport {
  const { lensInfo, checkItems, riskTags } = inspection;

  const conditionDiscount = CONDITIONS.find(c => c.value === lensInfo.condition)?.discount ?? 0.8;

  let totalRiskDeduction = 0;
  const bargainReasons: string[] = [];

  riskTags.forEach((tag) => {
    const impact = getRiskImpact(tag.level);
    totalRiskDeduction += impact;
    bargainReasons.push(
      `【${riskLevelLabel(tag.level)}】${tag.name}：${tag.description}（建议砍价约 ${Math.round(tag.priceImpact)} 元）`
    );
  });

  checkItems
    .filter(item => item.status === 'fail')
    .forEach((item) => {
      bargainReasons.push(`检测未通过：${item.itemName}${item.notes ? ` - ${item.notes}` : ''}`);
    });

  checkItems
    .filter(item => item.status === 'warning')
    .forEach((item) => {
      totalRiskDeduction += 0.03;
    });

  const failCount = checkItems.filter(i => i.status === 'fail').length;
  const warningCount = checkItems.filter(i => i.status === 'warning').length;
  const passCount = checkItems.filter(i => i.status === 'pass').length;
  const total = checkItems.length;

  const baseScore = (passCount / total) * 100;
  const penalty = failCount * 5 + warningCount * 2;
  const overallScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));

  let recommendation: EvaluationReport['recommendation'] = 'buy';
  if (overallScore < 50 || failCount >= 3 || riskTags.some(t => t.level === 'high')) {
    recommendation = 'avoid';
  } else if (overallScore < 75 || failCount >= 1 || warningCount >= 3) {
    recommendation = 'caution';
  }

  if (bargainReasons.length === 0) {
    bargainReasons.push('镜头整体状态良好，可参考市场价成交');
  }

  const sellerPrice = lensInfo.sellerPrice || 0;
  const fairMultiplier = Math.max(0.3, conditionDiscount - totalRiskDeduction);
  const fairPrice = Math.round(sellerPrice * fairMultiplier);
  const minPrice = Math.round(fairPrice * 0.92);
  const maxPrice = Math.round(fairPrice * 1.08);

  const summary = generateSummary(recommendation, overallScore, riskTags, failCount);

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

function getRiskImpact(level: RiskLevel): number {
  switch (level) {
    case 'high': return 0.18;
    case 'medium': return 0.08;
    case 'low': return 0.03;
  }
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
  risks: RiskTag[],
  fails: number
): string {
  const highRisks = risks.filter(r => r.level === 'high').length;
  const mediumRisks = risks.filter(r => r.level === 'medium').length;

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
  return `¥${value.toLocaleString('zh-CN')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}
