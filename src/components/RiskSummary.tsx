import { useTrialStore } from '@/store/trialStore';
import {
  LIGHT_SCENE_META,
  RISK_META,
  RISK_LEVELS,
  type LightSceneKey,
  type RiskType,
} from '@/types';
import { BarChart3, TrendingUp, AlertCircle, Shield } from 'lucide-react';

export default function RiskSummary() {
  const { record } = useTrialStore();
  const scenes = Object.keys(LIGHT_SCENE_META) as LightSceneKey[];
  const riskTypes = Object.keys(RISK_META) as RiskType[];

  const sceneScores = scenes.map((s) => ({
    scene: s,
    score: record[s].risks.reduce(
      (sum, r) => sum + RISK_LEVELS.find((l) => l.id === r.level)!.weight,
      0
    ),
    count: record[s].risks.length,
  }));

  const maxScore = Math.max(...sceneScores.map((s) => s.score), 6);

  const riskCounts = riskTypes.map((t) => ({
    type: t,
    count: scenes.reduce(
      (sum, s) => sum + (record[s].risks.some((r) => r.type === t) ? 1 : 0),
      0
    ),
    totalWeight: scenes.reduce(
      (sum, s) =>
        sum +
        record[s].risks
          .filter((r) => r.type === t)
          .reduce((w, r) => w + RISK_LEVELS.find((l) => l.id === r.level)!.weight, 0),
      0
    ),
  }));

  const totalScore = sceneScores.reduce((s, x) => s + x.score, 0);
  const overallLevel =
    totalScore >= 12 ? '高风险' : totalScore >= 6 ? '中等风险' : totalScore > 0 ? '低风险' : '暂无风险';
  const overallColor =
    totalScore >= 12
      ? 'text-red-600 bg-red-50 border-red-200'
      : totalScore >= 6
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : totalScore > 0
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : 'text-espresso/60 bg-cream-50 border-cream-200';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title flex items-center gap-2 text-xl mb-0">
            <BarChart3 className="w-5 h-5 text-rose-gold" />
            风险汇总分析
          </h3>
          <p className="text-xs text-espresso/55 mt-0.5">四场景综合评估</p>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${overallColor}`}
        >
          {totalScore > 0 ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          <div className="text-sm font-bold">{overallLevel}</div>
          <div className="text-xs opacity-70 font-semibold">{totalScore} 分</div>
        </div>
      </div>

      {/* Per-scene bar chart */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-espresso/60 mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          各场景风险指数
        </div>
        {sceneScores.map(({ scene, score }) => {
          const meta = LIGHT_SCENE_META[scene];
          const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
          return (
            <div key={scene} className="flex items-center gap-3">
              <div className="w-16 flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-sm font-medium text-espresso w-10">
                  {meta.name}
                </span>
              </div>
              <div className="flex-1 h-5 bg-cream-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.max(pct, score > 0 ? 10 : 0)}%`,
                    background: `linear-gradient(90deg, ${meta.color}aa, ${meta.color})`,
                  }}
                >
                  {score > 0 && (
                    <span className="text-[10px] font-bold text-espresso/80">
                      {score}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-10 text-right text-xs text-espresso/50 font-semibold">
                {score > 0 ? `${score}项` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk type summary */}
      <div>
        <div className="text-xs font-semibold text-espresso/60 mb-2">
          风险类型分布（出现场景数）
        </div>
        <div className="grid grid-cols-4 gap-2">
          {riskCounts.map(({ type, count, totalWeight }) => {
            const meta = RISK_META[type];
            return (
              <div
                key={type}
                className="p-3 rounded-xl border transition-all"
                style={{
                  backgroundColor: meta.bgColor,
                  borderColor: count > 0 ? meta.color + '55' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {count > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {count}/4
                    </span>
                  )}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: meta.color }}
                >
                  {meta.name}
                </div>
                <div className="text-[10px] text-espresso/50 mt-0.5 leading-tight">
                  {count > 0 ? `累计 ${totalWeight} 分` : meta.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
