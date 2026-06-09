import { useNavigate } from 'react-router-dom';
import { useCampStore, getRiskLevelLabel } from '@/store/campStore';
import { RISK_ITEM_KEYS, RISK_ITEM_LABELS } from '@/types';
import { ArrowLeft, Trophy, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { useRef, useEffect } from 'react';

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 500;
    const barH = 28;
    const gap = 12;
    const h = data.length * (barH + gap) + 40;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const labelW = 80;
    const barAreaW = w - labelW - 40;

    data.forEach((item, i) => {
      const y = 20 + i * (barH + gap);

      ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.label, labelW - 8, y + barH / 2 + 4);

      const barW = (item.value / maxVal) * barAreaW;

      ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.beginPath();
      ctx.roundRect(labelW, y, barAreaW, barH, 4);
      ctx.fill();

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(labelW, y, Math.max(barW, 4), barH, 4);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.value}`, labelW + barW + 8, y + barH / 2 + 4);
    });
  }, [data]);

  return <canvas ref={canvasRef} />;
}

export default function Stats() {
  const navigate = useNavigate();
  const { camps, riskAssessments, experiences, getExperiencesByCampId } = useCampStore();

  const riskFreq = RISK_ITEM_KEYS.map((key) => {
    const count = riskAssessments.filter((a) => a[key] === 'high').length;
    return { key, label: RISK_ITEM_LABELS[key], count };
  }).sort((a, b) => b.count - a.count);

  const mediumRiskFreq = RISK_ITEM_KEYS.map((key) => {
    const count = riskAssessments.filter((a) => a[key] === 'medium' || a[key] === 'high').length;
    return { key, label: RISK_ITEM_LABELS[key], count };
  }).sort((a, b) => b.count - a.count);

  const campStability = camps
    .map((camp) => {
      const exps = getExperiencesByCampId(camp.id);
      if (exps.length === 0) return { camp, score: -1, count: 0 };
      const avgRating = exps.reduce((s, e) => s + e.rating, 0) / exps.length;
      const coldPenalty = exps.filter((e) => e.coldLevel === 'severe').length * 0.5;
      const waterPenalty = exps.filter((e) => e.hasWaterPooling).length * 0.3;
      const noisePenalty = exps.filter((e) => e.noisyNeighbors).length * 0.2;
      const score = Math.max(0, avgRating - coldPenalty - waterPenalty - noisePenalty);
      return { camp, score, count: exps.length };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.score - a.score);

  const expIssues = [
    { label: '夜间很冷', value: experiences.filter((e) => e.coldLevel === 'severe').length, color: 'rgba(59, 130, 246, 0.7)' },
    { label: '有点冷', value: experiences.filter((e) => e.coldLevel === 'mild').length, color: 'rgba(34, 211, 238, 0.7)' },
    { label: '有积水', value: experiences.filter((e) => e.hasWaterPooling).length, color: 'rgba(6, 182, 212, 0.7)' },
    { label: '邻居吵', value: experiences.filter((e) => e.noisyNeighbors).length, color: 'rgba(245, 158, 11, 0.7)' },
  ].filter((d) => d.value > 0);

  const highRiskBarData = riskFreq
    .filter((r) => r.count > 0)
    .map((r) => ({ label: r.label, value: r.count, color: 'rgba(239, 68, 68, 0.7)' }));

  const allRiskBarData = mediumRiskFreq
    .filter((r) => r.count > 0)
    .map((r) => ({ label: r.label, value: r.count, color: 'rgba(245, 158, 11, 0.7)' }));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
      <header className="border-b border-emerald-800/30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-emerald-800/40 transition-colors text-emerald-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base font-semibold text-emerald-100">统计分析</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {camps.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-emerald-500">添加营地后即可查看统计数据</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '营地总数', value: camps.length, icon: <Trophy className="w-4 h-4 text-emerald-400" /> },
                { label: '高风险营地', value: camps.filter((c) => getRiskLevelLabel(c.overallRiskLevel) === 'high').length, icon: <AlertTriangle className="w-4 h-4 text-red-400" /> },
                { label: '体验记录', value: experiences.length, icon: <TrendingUp className="w-4 h-4 text-amber-400" /> },
                { label: '平均风险分', value: camps.length > 0 ? (camps.reduce((s, c) => s + c.overallRiskLevel, 0) / camps.length).toFixed(1) : '0', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
                  <div className="flex items-center gap-1.5 mb-2">
                    {s.icon}
                    <span className="text-xs text-emerald-500">{s.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-200">{s.value}</div>
                </div>
              ))}
            </div>

            {campStability.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> 营地稳定性排行
                </h2>
                <div className="space-y-2">
                  {campStability.map((item, i) => {
                    const level = getRiskLevelLabel(item.camp.overallRiskLevel);
                    return (
                      <div
                        key={item.camp.id}
                        onClick={() => navigate(`/camp/${item.camp.id}`)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30 cursor-pointer hover:border-emerald-700/40 transition-all"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                          i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                          i === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30' :
                          'bg-emerald-800/30 text-emerald-500'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-emerald-200 truncate">{item.camp.name}</div>
                          <div className="text-xs text-emerald-600">{item.count}次体验</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-200">{item.score.toFixed(1)}</div>
                          <div className={`text-[10px] ${
                            level === 'high' ? 'text-red-400' : level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {highRiskBarData.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> 高风险频率统计
                </h2>
                <div className="p-4 rounded-xl bg-emerald-900/15 border border-emerald-800/20 overflow-x-auto">
                  <BarChart data={highRiskBarData} />
                </div>
              </div>
            )}

            {allRiskBarData.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> 风险出现频率（中+高）
                </h2>
                <div className="p-4 rounded-xl bg-emerald-900/15 border border-emerald-800/20 overflow-x-auto">
                  <BarChart data={allRiskBarData} />
                </div>
              </div>
            )}

            {expIssues.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> 实际体验问题
                </h2>
                <div className="p-4 rounded-xl bg-emerald-900/15 border border-emerald-800/20 overflow-x-auto">
                  <BarChart data={expIssues} />
                </div>
              </div>
            )}

            {riskFreq.every((r) => r.count === 0) && experiences.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-emerald-500">暂无足够数据生成统计图表</p>
                <p className="text-xs text-emerald-700 mt-1">添加更多营地和体验记录后，这里会展示分析结果</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
