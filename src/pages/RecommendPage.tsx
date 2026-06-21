import { useState, useMemo } from 'react';
import { Lightbulb, Thermometer, Droplets, Target, TrendingUp, Info, Snowflake, Zap } from 'lucide-react';
import { useTuneStore } from '@/store/useTuneStore';
import Card from '@/components/Card';
import { SNOW_CONDITION_LABELS, WAX_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import type { SnowCondition } from '@/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

export default function RecommendPage() {
  const { boards, tuneRecords, feedbacks, getRecommendation } = useTuneStore();
  const [selectedCondition, setSelectedCondition] = useState<SnowCondition>('groomed');
  const [snowTemp, setSnowTemp] = useState(-5);
  const [selectedBoard, setSelectedBoard] = useState<string>('');

  const recommendation = useMemo(() => {
    return getRecommendation(selectedCondition, snowTemp, selectedBoard || undefined);
  }, [selectedCondition, snowTemp, selectedBoard, getRecommendation]);

  const conditionStatsData = useMemo(() => {
    const stats: Record<string, { count: number; avgScore: number }> = {};

    (Object.keys(SNOW_CONDITION_LABELS) as SnowCondition[]).forEach((cond) => {
      const records = tuneRecords.filter(
        (r) => r.snowCondition === cond && (!selectedBoard || r.boardId === selectedBoard)
      );
      const condFeedbacks = feedbacks.filter((f) => {
        const record = tuneRecords.find((r) => r.id === f.tuneRecordId);
        return record && record.snowCondition === cond && (!selectedBoard || record.boardId === selectedBoard);
      });
      const avgScore = condFeedbacks.length > 0
        ? condFeedbacks.reduce((s, f) => s + f.overallScore, 0) / condFeedbacks.length
        : 0;

      stats[cond] = {
        count: records.length,
        avgScore,
      };
    });

    return stats;
  }, [tuneRecords, feedbacks, selectedBoard]);

  const radarData = useMemo(() => {
    if (!recommendation) return [];
    const cond = recommendation.snowCondition;
    const gripScore = cond === 'ice' ? 9 : cond === 'hardpack' ? 8 : cond === 'groomed' ? 7 : 6;
    const edgeScore = cond === 'powder' ? 9 : cond === 'groomed' ? 8 : 7;
    const stableScore = cond === 'ice' ? 6 : cond === 'hardpack' ? 8 : 7;
    const speedScore = cond === 'powder' ? 8 : cond === 'hardpack' ? 7 : 6;

    return [
      { subject: '抓雪', value: gripScore, fullMark: 10 },
      { subject: '换刃', value: edgeScore, fullMark: 10 },
      { subject: '稳定', value: stableScore, fullMark: 10 },
      { subject: '速度', value: speedScore, fullMark: 10 },
    ];
  }, [recommendation]);

  const angleAnalysis = useMemo(() => {
    const allData = tuneRecords
      .filter((r) => !selectedBoard || r.boardId === selectedBoard)
      .map((record) => {
        const recordFeedbacks = feedbacks.filter((f) => f.tuneRecordId === record.id);
        const avgScore = recordFeedbacks.length > 0
          ? recordFeedbacks.reduce((s, f) => s + f.overallScore, 0) / recordFeedbacks.length
          : 0;
        return {
          ...record,
          avgScore,
          feedbackCount: recordFeedbacks.length,
        };
      })
      .filter((r) => r.feedbackCount > 0);

    const bySideEdge: Record<string, { count: number; avgScore: number }> = {};

    allData.forEach((r) => {
      const key = r.sideEdgeAngle.toFixed(1);
      if (!bySideEdge[key]) {
        bySideEdge[key] = { count: 0, avgScore: 0 };
      }
      bySideEdge[key].count += r.feedbackCount;
      bySideEdge[key].avgScore += r.avgScore * r.feedbackCount;
    });

    return Object.entries(bySideEdge)
      .map(([angle, data]) => ({
        angle,
        avgScore: data.count > 0 ? data.avgScore / data.count : 0,
        count: data.count,
      }))
      .sort((a, b) => Number(a.angle) - Number(b.angle));
  }, [tuneRecords, feedbacks, selectedBoard]);

  const confidenceLabel = (conf: number) => {
    if (conf >= 0.7) return { text: '高', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (conf >= 0.4) return { text: '中', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { text: '低', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">调校推荐</h1>
        <p className="text-sm text-slate-400 mt-1">
          根据雪况和雪温，推荐最合适的刃角和打蜡方案
        </p>
      </div>

      <Card className="bg-gradient-to-br from-cyan-glow/5 to-purple-glow/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              选择雪板
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-glow/50 transition-colors"
            >
              <option value="" className="bg-deep-navy">全部雪板</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id} className="bg-deep-navy">
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              预计雪况
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ice', 'hardpack', 'groomed'] as SnowCondition[]).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedCondition === cond
                      ? 'bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/30'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  {SNOW_CONDITION_LABELS[cond]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(['powder', 'slush', 'crud'] as SnowCondition[]).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedCondition === cond
                      ? 'bg-purple-glow/20 text-purple-light border border-purple-glow/30'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  {SNOW_CONDITION_LABELS[cond]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              预计雪温
              <span className="ml-2 text-cyan-glow font-bold text-lg">
                {snowTemp}°C
              </span>
            </label>
            <input
              type="range"
              min="-25"
              max="5"
              step="1"
              value={snowTemp}
              onChange={(e) => setSnowTemp(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>-25°</span>
              <span>5°</span>
            </div>
          </div>
        </div>
      </Card>

      {recommendation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            className={cn(
              'lg:col-span-2 border transition-colors',
              recommendation.hasHistoricalData
                ? 'bg-gradient-to-br from-cyan-glow/10 to-purple-glow/10 border-cyan-glow/20'
                : 'bg-white/5 border-white/10'
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    recommendation.hasHistoricalData
                      ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30'
                      : 'bg-white/10'
                  )}
                >
                  <Lightbulb
                    className={cn(
                      'w-6 h-6',
                      recommendation.hasHistoricalData ? 'text-yellow-400' : 'text-slate-400'
                    )}
                  />
                </div>
                <div>
                  <h3
                    className={cn(
                      'text-lg font-semibold',
                      recommendation.hasHistoricalData ? 'text-white' : 'text-slate-300'
                    )}
                  >
                    {recommendation.hasHistoricalData ? '推荐调校方案' : '经验推荐方案'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    针对 {SNOW_CONDITION_LABELS[recommendation.snowCondition]} · {snowTemp}°C
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium',
                  confidenceLabel(recommendation.confidence).bg,
                  confidenceLabel(recommendation.confidence).color
                )}
              >
                置信度: {confidenceLabel(recommendation.confidence).text}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-cyan-glow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {recommendation.sideEdgeAngle}°
                </div>
                <div className="text-xs text-slate-400">侧刃角度</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-purple-light mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {recommendation.baseEdgeAngle}°
                </div>
                <div className="text-xs text-slate-400">底刃角度</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {WAX_TYPE_LABELS[recommendation.waxType]}
                </div>
                <div className="text-xs text-slate-400">蜡的类型</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <Thermometer className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {recommendation.waxTemp}°C
                </div>
                <div className="text-xs text-slate-400">打蜡温度</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-glow mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>

            {recommendation.evidence && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-glow" />
                  历史依据明细
                </h4>

                <div className="bg-white/5 rounded-xl p-4 space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-glow/20 text-cyan-glow font-medium">
                      命中调校: {recommendation.evidence.matchedTune.date}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-purple-glow/20 text-purple-light font-medium">
                      雪温差: ±{recommendation.evidence.tempDiff}°C
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                      {recommendation.evidence.feedbackCount} 次试滑
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                      综合分: {recommendation.evidence.avgEffectiveScore.toFixed(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">抓雪</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-cyan-glow">
                          {recommendation.evidence.avgGrip.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">/10</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-glow rounded-full"
                          style={{ width: `${recommendation.evidence.avgGrip * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">换刃</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-purple-light">
                          {recommendation.evidence.avgEdgeChange.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">/10</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-light rounded-full"
                          style={{ width: `${recommendation.evidence.avgEdgeChange * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">抖动</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-blue-400">
                          {recommendation.evidence.avgChatter.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">/10</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${recommendation.evidence.avgChatter * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">速度损失 ↓</div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={cn(
                            'text-xl font-bold',
                            recommendation.evidence.avgSpeedLoss <= 3
                              ? 'text-green-400'
                              : recommendation.evidence.avgSpeedLoss <= 6
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          )}
                        >
                          {recommendation.evidence.avgSpeedLoss.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">/10</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            recommendation.evidence.avgSpeedLoss <= 3
                              ? 'bg-green-400'
                              : recommendation.evidence.avgSpeedLoss <= 6
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          )}
                          style={{ width: `${recommendation.evidence.avgSpeedLoss * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-white mb-4">
              {recommendation.hasHistoricalData ? '预期表现预估' : '预期表现（估算）'}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar
                    name="预期表现"
                    dataKey="value"
                    stroke={recommendation.hasHistoricalData ? '#00e5c7' : '#64748b'}
                    fill={recommendation.hasHistoricalData ? '#00e5c7' : '#64748b'}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {!recommendation.hasHistoricalData && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                无历史数据，表现为经验估算
              </p>
            )}
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-cyan-glow" />
            各雪况数据统计
          </h3>
          <div className="space-y-3">
            {(Object.keys(SNOW_CONDITION_LABELS) as SnowCondition[]).map((cond) => {
              const stats = conditionStatsData[cond];
              return (
                <div key={cond} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-glow/10 flex items-center justify-center">
                      <Snowflake className="w-4 h-4 text-cyan-glow" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {SNOW_CONDITION_LABELS[cond]}
                      </div>
                      <div className="text-xs text-slate-500">
                        {stats?.count || 0} 次调校
                      </div>
                    </div>
                  </div>
                  {stats && stats.avgScore > 0 ? (
                    <div className="text-right">
                      <div className="text-lg font-bold text-cyan-glow">
                        {stats.avgScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500">平均评分</div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">暂无数据</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-light" />
            侧刃角度 vs 评分
          </h3>
          {angleAnalysis.length > 0 ? (
            <div className="space-y-3">
              {angleAnalysis.map((item) => (
                <div key={item.angle} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-medium text-white">
                    {item.angle}°
                  </div>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-glow to-purple-glow rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${item.avgScore * 10}%` }}
                    >
                      <span className="text-xs font-medium text-white">
                        {item.avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 text-xs text-slate-500 text-right">
                    {item.count}次
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无足够的试滑数据进行分析
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          调校小知识
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-medium text-white mb-2">侧刃角度</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              角度越小（如87-88°），刃越锋利，抓雪越好，但容易卡刃。角度越大（如89-90°），
              刃越钝，换刃越顺畅，容错率越高。
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-medium text-white mb-2">底刃角度</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              底刃角度影响板底接触雪的方式。大底刃在粉雪中浮力更好，
              小平底刃在硬雪上更稳定。一般1°左右是通用选择。
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-medium text-white mb-2">打蜡选择</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              冷天用冷蜡，暖天用温蜡。雪温越低，蜡越硬；雪温越高，
              蜡越软。选错蜡会严重影响滑行速度。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
