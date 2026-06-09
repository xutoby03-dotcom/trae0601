import { useParams, useNavigate } from 'react-router-dom';
import { useCampStore, getRiskLevelLabel } from '@/store/campStore';
import { RISK_ITEM_KEYS, RISK_ITEM_LABELS, WATER_SOURCE_LABELS, TOILET_LABELS, PHONE_SIGNAL_LABELS, COLD_LEVEL_LABELS } from '@/types';
import type { RiskLevel, RiskItemKey } from '@/types';
import { ArrowLeft, Edit3, Trash2, Plus, Star, Droplets, Thermometer, Volume2, AlertTriangle, Shield, CheckCircle2, Package } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const riskColors: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const riskBgs: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  high: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
};

function RadarChart({ assessment }: { assessment: Record<RiskItemKey, RiskLevel> | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = 100;
    const labels = RISK_ITEM_KEYS.map((k) => RISK_ITEM_LABELS[k]);
    const n = labels.length;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    for (let ring = 1; ring <= 3; ring++) {
      const r = (ring / 3) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (assessment) {
      const values = RISK_ITEM_KEYS.map((k) => {
        const v = assessment[k];
        return v === 'low' ? 1 : v === 'medium' ? 2 : 3;
      });

      ctx.beginPath();
      values.forEach((v, i) => {
        const r = (v / 3) * maxR;
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      values.forEach((v, i) => {
        const r = (v / 3) * maxR;
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = riskColors[assessment[RISK_ITEM_KEYS[i]]];
        ctx.fill();
      });
    }

    ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const angle = startAngle + i * angleStep;
      const x = cx + (maxR + 24) * Math.cos(angle);
      const y = cy + (maxR + 24) * Math.sin(angle);
      ctx.fillText(label, x, y + 3);
    });
  }, [assessment]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

export default function CampDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampById, getAssessmentByCampId, getExperiencesByCampId, getHighRiskReasons, getPrepItems, deleteCamp } = useCampStore();
  const [tab, setTab] = useState<'risks' | 'prep' | 'experience'>('risks');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const camp = id ? getCampById(id) : undefined;
  const assessment = id ? getAssessmentByCampId(id) : undefined;
  const experiences = id ? getExperiencesByCampId(id) : [];
  const reasons = id ? getHighRiskReasons(id) : [];
  const prepItems = id ? getPrepItems(id) : [];

  if (!camp || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
        <div className="text-center">
          <p className="text-emerald-500 mb-4">营地不存在</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const level = getRiskLevelLabel(camp.overallRiskLevel);
  const levelLabel = level === 'high' ? '高风险' : level === 'medium' ? '中风险' : '低风险';

  const handleDelete = () => {
    if (confirm('确定要删除这个营地吗？所有相关数据将一并删除。')) {
      deleteCamp(id);
      navigate('/');
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1a12 0%, #0f2318 40%, #162e20 100%)' }}>
      <header className="border-b border-emerald-800/30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-emerald-800/40 transition-colors text-emerald-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-emerald-100">{camp.name}</h1>
              <p className="text-xs text-emerald-500">{camp.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/camp/${id}/edit`)} className="p-2 rounded-lg hover:bg-emerald-800/40 transition-colors text-emerald-400 border border-emerald-700/30">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-900/40 transition-colors text-red-400 border border-red-700/30">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
            level === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            level === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {levelLabel}
          </div>
          <div className="text-2xl font-bold text-emerald-200">{camp.overallRiskLevel.toFixed(1)}</div>
          <div className="text-xs text-emerald-600">综合风险评分</div>
          <div className="flex-1" />
          {reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              {reasons.slice(0, 3).map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-300 border border-red-500/20">
                  <AlertTriangle className="w-3 h-3" />{r}
                </span>
              ))}
              {reasons.length > 3 && <span className="text-xs text-red-400">+{reasons.length - 3}</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: '海拔', value: `${camp.altitude}m` },
            { label: '水源', value: WATER_SOURCE_LABELS[camp.waterSource] },
            { label: '厕所', value: TOILET_LABELS[camp.toilet] },
            { label: '停车', value: `${camp.parkingDistance}m` },
            { label: '生火', value: camp.fireAllowed ? '可以' : '禁止' },
            { label: '信号', value: PHONE_SIGNAL_LABELS[camp.phoneSignal] },
            { label: '体验次数', value: `${experiences.length}次` },
            { label: '平均评分', value: experiences.length > 0 ? (experiences.reduce((s, e) => s + e.rating, 0) / experiences.length).toFixed(1) : '-' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-emerald-900/15 border border-emerald-800/20">
              <div className="text-xs text-emerald-600 mb-0.5">{item.label}</div>
              <div className="text-sm font-medium text-emerald-200">{item.value}</div>
            </div>
          ))}
        </div>

        {camp.photos.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {camp.photos.map((photo, i) => (
                <div key={i} className="shrink-0 w-40 h-28 rounded-lg overflow-hidden border border-emerald-700/30">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-emerald-900/20 p-1 rounded-lg border border-emerald-800/20">
          {([
            { key: 'risks', label: '风险清单' },
            { key: 'prep', label: '准备清单' },
            { key: 'experience', label: '露营体验' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/30'
                  : 'text-emerald-600 hover:text-emerald-400 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'risks' && assessment && (
          <div>
            <div className="mb-6">
              <RadarChart assessment={assessment} />
            </div>
            <div className="space-y-2">
              {RISK_ITEM_KEYS.map((key) => {
                const risk = assessment[key];
                const c = riskBgs[risk];
                return (
                  <div key={key} className={`p-3 rounded-lg ${c.bg} border ${c.border}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-200 font-medium">{RISK_ITEM_LABELS[key]}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${c.bg} ${c.text} border ${c.border}`}>
                        {risk === 'low' ? '低' : risk === 'medium' ? '中' : '高'}
                      </span>
                    </div>
                    {risk === 'high' && (
                      <p className="text-xs text-red-300/70 mt-1.5">
                        {key === 'weatherRisk' && '天气变化大，需准备雨具并持续关注天气预报'}
                        {key === 'windRisk' && '强风可能导致帐篷倒塌，需加固地钉和防风绳'}
                        {key === 'rockfallRisk' && '落石区域危险，远离崖壁和陡坡扎营'}
                        {key === 'floodRisk' && '涨水风险高，远离河道和低洼地带'}
                        {key === 'insectRisk' && '蚊虫密集，需要全面防护措施'}
                        {key === 'wildDogRisk' && '野狗可能攻击，妥善保管食物，不要单独行动'}
                        {key === 'lightingRisk' && '夜间无照明，需自备充足光源'}
                        {key === 'escapeRisk' && '逃生路线不清晰，需提前规划撤离路径'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'prep' && (
          <div>
            {prepItems.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-emerald-500">该营地风险较低，无特殊准备建议</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prepItems.map((item, i) => {
                  const checked = checkedItems.has(i);
                  const catIcon = item.category === 'essential' ? <Package className="w-3.5 h-3.5" /> : item.category === 'safety' ? <Shield className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />;
                  const catLabel = item.category === 'essential' ? '必备' : item.category === 'safety' ? '安全' : '舒适';
                  const catColor = item.category === 'essential' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : item.category === 'safety' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                  return (
                    <div
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        checked
                          ? 'bg-emerald-900/10 border-emerald-700/20 opacity-60'
                          : 'bg-emerald-900/20 border-emerald-800/30 hover:border-emerald-700/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          checked ? 'bg-emerald-600 border-emerald-600' : 'border-emerald-600/40'
                        }`}>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-medium ${checked ? 'line-through text-emerald-600' : 'text-emerald-200'}`}>{item.title}</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${catColor}`}>
                              {catIcon}{catLabel}
                            </span>
                          </div>
                          <p className={`text-xs ${checked ? 'text-emerald-700' : 'text-emerald-500'}`}>{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'experience' && (
          <div>
            <button
              onClick={() => navigate(`/camp/${id}/experience`)}
              className="w-full p-3 rounded-lg border-2 border-dashed border-emerald-700/40 text-emerald-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm mb-4"
            >
              <Plus className="w-4 h-4" /> 记录露营体验
            </button>

            {experiences.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm text-emerald-500">还没有体验记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < exp.rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-700'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-emerald-600">{new Date(exp.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                        exp.coldLevel === 'severe' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        exp.coldLevel === 'mild' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <Thermometer className="w-3 h-3" />{COLD_LEVEL_LABELS[exp.coldLevel]}
                      </span>
                      {exp.hasWaterPooling && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                          <Droplets className="w-3 h-3" />有积水
                        </span>
                      )}
                      {exp.noisyNeighbors && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          <Volume2 className="w-3 h-3" />邻居吵
                        </span>
                      )}
                    </div>

                    {exp.notes && (
                      <p className="text-xs text-emerald-400 leading-relaxed">{exp.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
