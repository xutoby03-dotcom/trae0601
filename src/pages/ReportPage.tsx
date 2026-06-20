import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertTriangle, XCircle, TrendingDown,
  Tag, FileText, ArrowLeftRight, RefreshCw, Download, Share2,
  Camera, Clock, AlertCircle, Copy, Check, MessageSquare
} from 'lucide-react';
import { useInspectionStore } from '@/store/useInspectionStore';
import {
  formatPrice, formatDate, recommendationLabel, riskLevelLabel,
  collectAggregatedRisks, countRisksByLevel, AggregatedRisk
} from '@/utils/evaluation';
import { CHECKLIST_GROUPS, CONDITIONS } from '@/data/checklistItems';
import { RiskLevel, PurchaseRecommendation } from '@/types';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspection, generateReport } = useInspectionStore();

  const inspection = getInspection(id || '');

  useEffect(() => {
    if (inspection) {
      generateReport(inspection.id);
    }
  }, [inspection?.id, generateReport]);

  const report = inspection?.report;

  const aggregatedRisks: AggregatedRisk[] = useMemo(() => {
    if (!inspection) return [];
    return collectAggregatedRisks(inspection);
  }, [inspection]);

  const stats = useMemo(() => {
    if (!inspection) return null;
    const pass = inspection.checkItems.filter(i => i.status === 'pass').length;
    const warning = inspection.checkItems.filter(i => i.status === 'warning').length;
    const fail = inspection.checkItems.filter(i => i.status === 'fail').length;
    const untested = inspection.checkItems.filter(i => i.status === 'untested').length;
    const riskCounts = countRisksByLevel(aggregatedRisks);
    const totalRiskImpact = aggregatedRisks.reduce((sum, r) => sum + r.priceImpact, 0);
    return {
      pass, warning, fail, untested,
      high: riskCounts.high,
      medium: riskCounts.medium,
      low: riskCounts.low,
      totalRiskImpact,
    };
  }, [inspection, aggregatedRisks]);

  if (!inspection || !report || !stats) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-400">正在生成报告...</p>
      </div>
    );
  }

  const recommendationStyles: Record<PurchaseRecommendation, { icon: typeof CheckCircle; color: string; bg: string; border: string }> = {
    buy: { icon: CheckCircle, color: 'text-jade-400', bg: 'bg-jade-500/10', border: 'border-jade-500/30' },
    caution: { icon: AlertCircle, color: 'text-amber-soft', bg: 'bg-amber-soft/10', border: 'border-amber-soft/30' },
    avoid: { icon: XCircle, color: 'text-rust-400', bg: 'bg-rust-500/10', border: 'border-rust-500/30' },
  };

  const recStyle = recommendationStyles[report.recommendation];
  const RecIcon = recStyle.icon;

  const riskBadgeClass = (level: RiskLevel) => {
    switch (level) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
    }
  };

  const handleExport = () => {
    const data = {
      lens: inspection.lensInfo,
      report,
      checkItems: inspection.checkItems,
      riskTags: inspection.riskTags,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lens-check-${inspection.lensInfo.brand}-${inspection.lensInfo.model}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const conditionDiscount = CONDITIONS.find(c => c.value === inspection.lensInfo.condition)?.discount ?? 0.8;
  const conditionDeduction = Math.round(inspection.lensInfo.sellerPrice * (1 - conditionDiscount));
  const totalPriceImpact = aggregatedRisks.reduce((sum, r) => sum + r.priceImpact, 0);
  const priceDiff = conditionDeduction + totalPriceImpact;
  const priceDiffPct = inspection.lensInfo.sellerPrice > 0 ? (priceDiff / inspection.lensInfo.sellerPrice) * 100 : 0;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bargainScripts = useMemo(() => {
    if (!inspection) return [];
    const { lensInfo, report } = inspection;
    if (!report) return [];

    const conditionLabel = CONDITIONS.find(c => c.value === lensInfo.condition)?.label || '当前成色';

    const topRisks = aggregatedRisks
      .filter(r => r.level === 'high' || r.level === 'medium')
      .slice(0, 3)
      .map(r => r.name);
    const riskDesc = topRisks.length > 0 ? `，特别是${topRisks.join('、')}这些问题` : '';

    return [
      `老板，这个${lensInfo.brand} ${lensInfo.model}我刚才仔细检查过了，${conditionLabel}${riskDesc}，考虑到这些情况，${formatPrice(report.fairPrice)}这个价格我觉得比较合理，您看能出吗？`,
      `您报的${formatPrice(lensInfo.sellerPrice)}确实符合市场价，但这镜头光成色方面就得折${formatPrice(conditionDeduction)}，再加上这些检测到的问题还得减${formatPrice(totalPriceImpact)}，我最多能给到${formatPrice(report.maxPrice)}，不行就算了哈。`,
      `诚心要，${formatPrice(report.minPrice)}直接拿，不用再聊了。我也是做过功课来的，这些问题拿回去我还得花钱处理，您再考虑下？`,
    ];
  }, [inspection, aggregatedRisks, conditionDeduction, totalPriceImpact]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">检测评估报告</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="text-copper-400">{inspection.lensInfo.brand} {inspection.lensInfo.model}</span>
              <span>·</span>
              <span>{formatDate(inspection.lensInfo.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/inspection/${inspection.id}`)} className="btn-secondary">
              <ArrowLeftRight className="w-4 h-4 rotate-180" />
              继续检查
            </button>
            <button onClick={() => navigate(`/inspection/${inspection.id}/samples`)} className="btn-secondary">
              <Camera className="w-4 h-4" />
              查看样张
            </button>
            <button onClick={() => generateReport(inspection.id)} className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
              重新计算
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4" />
              导出报告
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-8 border ${recStyle.bg} ${recStyle.border} mb-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: report.recommendation === 'buy' ? '#4ecca3' : report.recommendation === 'caution' ? '#f5c16c' : '#e8505b' }}
          />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl ${recStyle.bg} border ${recStyle.border} flex items-center justify-center flex-shrink-0`}>
                <RecIcon className={`w-8 h-8 ${recStyle.color}`} strokeWidth={2} />
              </div>
              <div>
                <p className={`text-sm font-medium ${recStyle.color} mb-1`}>
                  {report.recommendation === 'buy' ? '✓ 最终建议' : report.recommendation === 'caution' ? '⚠ 谨慎评估' : '✕ 不推荐购买'}
                </p>
                <h2 className={`font-display text-4xl font-semibold ${recStyle.color} mb-3`}>
                  {recommendationLabel(report.recommendation)}
                </h2>
                <p className="text-gray-300 max-w-xl leading-relaxed">{report.summary}</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-center lg:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">综合评分</p>
              <p className="font-display text-6xl font-semibold text-white leading-none">
                {report.overallScore}
                <span className="text-2xl text-gray-500">/100</span>
              </p>
              <div className="w-48 h-2 mt-3 rounded-full bg-ink-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${report.overallScore}%`,
                    background: report.overallScore >= 75
                      ? 'linear-gradient(90deg, #4ecca3, #6eebc4)'
                      : report.overallScore >= 50
                        ? 'linear-gradient(90deg, #f5c16c, #f0d090)'
                        : 'linear-gradient(90deg, #e8505b, #f07078)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown className="w-5 h-5 text-copper-400" />
              <h3 className="font-display text-xl font-semibold text-white">价格评估</h3>
            </div>

            <div className="mb-6">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">卖家报价</p>
                  <p className="font-display text-3xl font-semibold text-gray-400 line-through">
                    {formatPrice(inspection.lensInfo.sellerPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">建议总砍价</p>
                  <p className={`font-display text-3xl font-semibold ${priceDiff > 0 ? 'text-jade-400' : 'text-gray-500'}`}>
                    {priceDiff > 0 ? `-${formatPrice(priceDiff)}` : '无需砍价'}
                  </p>
                  {priceDiff > 0 && (
                    <p className="text-xs text-jade-400/70 mt-0.5">约 {priceDiffPct.toFixed(1)}%</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-ink-800/50 border border-ink-700/50">
                  <p className="text-xs text-gray-500 mb-1">成色折损</p>
                  <p className="font-display text-lg font-semibold text-copper-400">
                    -{formatPrice(conditionDeduction)}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    基于 {CONDITIONS.find(c => c.value === inspection.lensInfo.condition)?.label || '成色'} {Math.round(conditionDiscount * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-ink-800/50 border border-ink-700/50">
                  <p className="text-xs text-gray-500 mb-1">风险扣减</p>
                  <p className="font-display text-lg font-semibold text-rust-400">
                    -{formatPrice(totalPriceImpact)}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {aggregatedRisks.length} 项问题合计
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="h-12 rounded-xl bg-ink-800 relative overflow-hidden border border-ink-700">
                  <div
                    className="absolute inset-y-0 bg-gradient-to-r from-jade-500/30 via-copper-500/30 to-copper-500/20"
                    style={{
                      left: `${(report.minPrice / inspection.lensInfo.sellerPrice) * 100}%`,
                      right: `${100 - (report.maxPrice / inspection.lensInfo.sellerPrice) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-copper-500 shadow-glow ring-4 ring-copper-500/20"
                    style={{ left: `${(report.fairPrice / inspection.lensInfo.sellerPrice) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <div>
                    <p className="text-gray-500">最低可接受</p>
                    <p className="text-gray-300 font-medium">{formatPrice(report.minPrice)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-copper-400 font-medium">✦ 合理价位</p>
                    <p className="text-copper-400 font-display text-lg font-semibold">{formatPrice(report.fairPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">最高可接受</p>
                    <p className="text-gray-300 font-medium">{formatPrice(report.maxPrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-copper-500/10 via-ink-800/50 to-ink-800/50 border border-copper-500/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-copper-500/15 text-copper-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">现场砍价话术</h3>
                  <p className="text-xs text-gray-500">点复制直接发给卖家</p>
                </div>
              </div>
              <div className="space-y-3">
                {bargainScripts.map((script, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-ink-900/60 border border-ink-700/50 hover:border-copper-500/30 transition-colors group">
                    <p className="flex-1 text-sm text-gray-300 leading-relaxed select-all">{script}</p>
                    <button
                      onClick={() => handleCopy(script, idx)}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-copper-500/15 text-gray-500 hover:text-copper-400 transition-all"
                      title="复制话术"
                    >
                      {copiedIndex === idx ? (
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-jade-400" />
                          <span className="text-xs text-jade-400 font-medium">已复制</span>
                        </div>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-ink-800/50">
                <CheckCircle className="w-5 h-5 text-jade-400 mx-auto mb-1.5" />
                <p className="font-display text-xl font-semibold text-white">{stats.pass}</p>
                <p className="text-[10px] text-gray-500">正常项</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ink-800/50">
                <AlertCircle className="w-5 h-5 text-amber-soft mx-auto mb-1.5" />
                <p className="font-display text-xl font-semibold text-white">{stats.warning}</p>
                <p className="text-[10px] text-gray-500">注意项</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ink-800/50">
                <XCircle className="w-5 h-5 text-rust-400 mx-auto mb-1.5" />
                <p className="font-display text-xl font-semibold text-white">{stats.fail}</p>
                <p className="text-[10px] text-gray-500">异常项</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-ink-800/50">
                <Tag className="w-5 h-5 text-copper-400 mx-auto mb-1.5" />
                <p className="font-display text-xl font-semibold text-white">{stats.high + stats.medium + stats.low}</p>
                <p className="text-[10px] text-gray-500">风险标签</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-copper-400" />
                <h3 className="font-semibold text-white">风险分布</h3>
              </div>
              <div className="space-y-3">
                {(['high', 'medium', 'low'] as RiskLevel[]).map(level => {
                  const count = stats[level];
                  const total = stats.high + stats.medium + stats.low;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={riskBadgeClass(level)}>{riskLevelLabel(level)}</span>
                        <span className="text-gray-400">{count} 项</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            level === 'high' ? 'bg-rust-500' : level === 'medium' ? 'bg-amber-soft' : 'bg-jade-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-ink-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">预计砍价总额</span>
                  <span className="font-display text-xl font-semibold text-jade-400">
                    -{formatPrice(stats.totalRiskImpact)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-copper-400" />
                <h3 className="font-semibold text-white">镜头信息</h3>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">品牌</dt>
                  <dd className="text-gray-200">{inspection.lensInfo.brand}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">型号</dt>
                  <dd className="text-gray-200">{inspection.lensInfo.model}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">卡口</dt>
                  <dd className="text-gray-200">{inspection.lensInfo.mount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">渠道</dt>
                  <dd className="text-gray-200">{inspection.lensInfo.purchaseChannel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    检测时间
                  </dt>
                  <dd className="text-gray-200">{formatDate(inspection.lensInfo.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-copper-400" />
                <h3 className="font-display text-xl font-semibold text-white">风险详情</h3>
              </div>
              <span className="text-sm text-gray-500">
                共 {aggregatedRisks.length} 项
                {inspection.riskTags.length > 0 && `（含 ${inspection.riskTags.length} 项手动标记）`}
              </span>
            </div>
            {aggregatedRisks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-jade-400/50 mx-auto mb-3" />
                <p className="text-gray-500">未发现风险问题，镜头状态良好</p>
              </div>
            ) : (
              <div className="space-y-2">
                {aggregatedRisks.map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-ink-800/50 border border-ink-700/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={riskBadgeClass(risk.level)}>{riskLevelLabel(risk.level)}</span>
                          <h4 className="font-medium text-white">{risk.name}</h4>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${risk.source === 'manual' ? 'bg-copper-500/15 text-copper-400' : 'bg-ink-700 text-gray-400'}`}>
                            {risk.source === 'manual' ? '手动标记' : '检测项'}
                          </span>
                        </div>
                        {risk.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">{risk.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">影响价格</p>
                        <p className="font-display text-lg font-semibold text-jade-400">
                          -{formatPrice(risk.priceImpact)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-copper-400" />
                <h3 className="font-display text-xl font-semibold text-white">砍价理由清单</h3>
              </div>
              <span className="text-sm text-gray-500">{report.bargainReasons.length} 条</span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
              {report.bargainReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-ink-800/50 border border-ink-700/50">
                  <div className="w-6 h-6 rounded-full bg-copper-500/20 text-copper-400 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-display text-xl font-semibold text-white mb-5">各项检查详情</h3>
          <div className="space-y-5">
            {CHECKLIST_GROUPS.map(group => {
              const items = inspection.checkItems.filter(i => i.category === group.category);
              return (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium text-gray-300 text-sm">{group.title}</h4>
                    <div className="flex-1 h-px bg-ink-700/50" />
                    <span className="text-xs text-gray-500">
                      {items.filter(i => i.status === 'pass').length}/{items.length} 通过
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-ink-800/30">
                        {item.status === 'pass' && <CheckCircle className="w-4 h-4 text-jade-400 flex-shrink-0" />}
                        {item.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-soft flex-shrink-0" />}
                        {item.status === 'fail' && <XCircle className="w-4 h-4 text-rust-400 flex-shrink-0" />}
                        {item.status === 'untested' && <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0" />}
                        <span className={`text-sm flex-1 ${item.status === 'untested' ? 'text-gray-600' : 'text-gray-300'}`}>
                          {item.itemName}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-gray-500 truncate max-w-[150px]" title={item.notes}>
                            {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
