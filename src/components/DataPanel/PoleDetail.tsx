import { useWindStore } from '../../store/useWindStore';
import { useWindSimulation } from '../../hooks/useWindSimulation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { POLE_MATERIAL_LABELS, FLAG_MATERIAL_LABELS, RISK_TYPE_LABELS } from '../../types';
import { getRiskLevel } from '../../utils/riskAssessment';
import { X, Ruler, Package, MapPin, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export const PoleDetail = () => {
  const { selectedPoleId, poles, setSelectedPoleId, getPoleRiskMark } = useWindStore();
  const { getPoleStats, getPoleRecommendations, getHourlyTanglingForPole } = useWindSimulation();

  if (!selectedPoleId) return null;

  const pole = poles.find(p => p.id === selectedPoleId);
  const stats = getPoleStats(selectedPoleId);
  const riskMark = getPoleRiskMark(selectedPoleId);
  const recommendations = getPoleRecommendations(selectedPoleId);
  const hourlyData = getHourlyTanglingForPole(selectedPoleId);

  if (!pole || !stats) return null;

  const risk = getRiskLevel(stats.riskScore);
  const maxTangling = Math.max(...hourlyData.map(d => d.tanglingIndex));

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span className="text-cyan-400">旗杆详情</span>
          <span className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: risk.bgColor, color: risk.color }}>
            {risk.label}
          </span>
        </CardTitle>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSelectedPoleId(null)}
          className="h-7 w-7"
        >
          <X size={14} />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
          <div className="text-xl font-bold font-mono text-slate-100 mb-2">
            {pole.id.replace('pole-', '旗杆 #')}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={14} className="text-cyan-400" />
              <span>位置: ({pole.x}, {pole.y})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Ruler size={14} className="text-cyan-400" />
              <span>高度: {pole.height}m</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Package size={14} className="text-cyan-400" />
              <span>杆: {POLE_MATERIAL_LABELS[pole.poleMaterial]}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Package size={14} className="text-emerald-400" />
              <span>旗: {FLAG_MATERIAL_LABELS[pole.flagMaterial]}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border" style={{ backgroundColor: risk.bgColor, borderColor: `${risk.color}30` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} style={{ color: risk.color }} />
            <span className="text-sm font-medium" style={{ color: risk.color }}>风险评估</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-400">风险评分</div>
              <div className="text-2xl font-bold font-mono" style={{ color: risk.color }}>
                {stats.riskScore}
                <span className="text-xs text-slate-500 ml-1">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">平均风速</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {stats.avgWindSpeed}
                <span className="text-xs text-slate-500 ml-1">m/s</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">最大阵风</div>
              <div className="text-lg font-bold font-mono text-amber-400">
                {stats.maxGustSpeed} m/s
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">高缠绕小时</div>
              <div className="text-lg font-bold font-mono text-orange-400">
                {stats.tanglingHours} h
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
          <div className="text-xs text-slate-400 mb-2">24小时缠绕指数分布</div>
          <div className="flex items-end gap-0.5 h-16">
            {hourlyData.map((d, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${(d.tanglingIndex / 100) * 100}%`,
                  backgroundColor: d.tanglingIndex > 60 ? '#ef4444' : d.tanglingIndex > 40 ? '#f59e0b' : '#22c55e',
                  opacity: 0.7 + (d.tanglingIndex / 100) * 0.3,
                }}
                title={`${d.hour}:00 - ${d.tanglingIndex.toFixed(0)}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            峰值: <span className="text-red-400 font-mono">{maxTangling.toFixed(0)}</span>
          </div>
        </div>

        {riskMark && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-400">已标记风险</span>
            </div>
            <div className="text-sm text-slate-300">
              类型: <span className="text-amber-300">{RISK_TYPE_LABELS[riskMark.type]}</span>
            </div>
            {riskMark.note && (
              <div className="text-sm text-slate-400 mt-1">
                备注: {riskMark.note}
              </div>
            )}
          </div>
        )}

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">优化建议</span>
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
