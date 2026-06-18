import { useState } from 'react';
import { useAquaStore } from '@/store/aquaStore';
import type { WaterColor, MaintenanceLog } from '@/types';
import { Plus, AlertTriangle, TrendingUp, X, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Link } from 'react-router-dom';

interface FormState {
  date: string;
  ammonia: string;
  nitrite: string;
  pH: string;
  waterColor: WaterColor;
  note: string;
}

const emptyForm: FormState = {
  date: new Date().toISOString().split('T')[0],
  ammonia: '',
  nitrite: '',
  pH: '',
  waterColor: '清澈',
  note: '',
};

const WATER_COLOR_OPTIONS: WaterColor[] = ['清澈', '微黄', '发绿', '浑浊'];

function getAmmoniaColor(val: number): string {
  return val > 0.5 ? 'text-coral' : 'text-seaweed';
}

function getNitriteColor(val: number): string {
  return val > 0.1 ? 'text-coral' : 'text-seaweed';
}

function getPhColor(val: number): string {
  if (val >= 6.5 && val <= 7.5) return 'text-seaweed';
  if ((val >= 6.0 && val < 6.5) || (val > 7.5 && val <= 8.0)) return 'text-sand';
  return 'text-coral';
}

function getWaterColorColor(wc: WaterColor): string {
  if (wc === '清澈') return 'text-seaweed';
  if (wc === '微黄') return 'text-sand';
  return 'text-coral';
}

function getMaintenanceColor(type: MaintenanceLog['type']): string {
  if (type === '换水') return 'border-surface/60 bg-surface/10 text-surface';
  if (type === '清洗过滤桶') return 'border-seaweed/60 bg-seaweed/10 text-seaweed-light';
  return 'border-purple-400/60 bg-purple-400/10 text-purple-300';
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-deep-sea/90 border border-white/10 rounded-lg px-3 py-2 text-sm backdrop-blur-sm">
      <p className="text-foam/60 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-foam font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function TrendCharts({ tankId }: { tankId: string }) {
  const waterQualities = useAquaStore((s) => s.waterQualities);
  const tankWQ = waterQualities
    .filter((w) => w.tankId === tankId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (tankWQ.length < 2) return null;

  const chartData = tankWQ.map((w) => ({
    date: w.date,
    ammonia: w.ammonia,
    nitrite: w.nitrite,
    pH: w.pH,
  }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-surface" />
        <h2 className="text-lg font-semibold text-foam">水质趋势</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm text-foam/60 mb-2 text-center">氨氮 (mg/L)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0.5} stroke="#FF6B35" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: '危险 0.5', fill: '#FF6B35', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceArea y1={0.5} y2={Infinity as unknown as number} fill="#FF6B35" fillOpacity={0.06} />
              <Line type="monotone" dataKey="ammonia" name="氨氮" stroke="#2C74B3" strokeWidth={2} dot={{ r: 4, fill: '#2C74B3', stroke: '#2C74B3' }} activeDot={{ r: 5, fill: '#FF6B35', stroke: '#FF6B35' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm text-foam/60 mb-2 text-center">亚硝酸盐 (mg/L)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0.1} stroke="#FF6B35" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: '危险 0.1', fill: '#FF6B35', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceArea y1={0.1} y2={Infinity as unknown as number} fill="#FF6B35" fillOpacity={0.06} />
              <Line type="monotone" dataKey="nitrite" name="亚硝酸盐" stroke="#2C74B3" strokeWidth={2} dot={{ r: 4, fill: '#2C74B3', stroke: '#2C74B3' }} activeDot={{ r: 5, fill: '#FF6B35', stroke: '#FF6B35' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-sm text-foam/60 mb-2 text-center">pH</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis domain={[0, 14]} tick={{ fill: '#C5DFF0', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceArea y1={6.5} y2={7.5} fill="#2D8F4E" fillOpacity={0.06} />
              <Line type="monotone" dataKey="pH" name="pH" stroke="#2C74B3" strokeWidth={2} dot={{ r: 4, fill: '#2C74B3', stroke: '#2C74B3' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function LatestCard({ tankId }: { tankId: string }) {
  const waterQualities = useAquaStore((s) => s.waterQualities);
  const tankWQ = waterQualities
    .filter((w) => w.tankId === tankId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = tankWQ[0];
  if (!latest) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-foam mb-4">最新水质</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-foam/50 mb-1">氨氮</p>
          <p className={`text-lg font-bold ${getAmmoniaColor(latest.ammonia)}`}>{latest.ammonia} <span className="text-xs font-normal text-foam/40">mg/L</span></p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-foam/50 mb-1">亚硝酸盐</p>
          <p className={`text-lg font-bold ${getNitriteColor(latest.nitrite)}`}>{latest.nitrite} <span className="text-xs font-normal text-foam/40">mg/L</span></p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-foam/50 mb-1">pH</p>
          <p className={`text-lg font-bold ${getPhColor(latest.pH)}`}>{latest.pH}</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-xs text-foam/50 mb-1">水色</p>
          <p className={`text-lg font-bold ${getWaterColorColor(latest.waterColor)}`}>{latest.waterColor}</p>
        </div>
      </div>
      <p className="text-xs text-foam/40 mt-3">记录日期：{latest.date}</p>
    </div>
  );
}

function AbnormalPanel({ tankId }: { tankId: string }) {
  const waterQualities = useAquaStore((s) => s.waterQualities);
  const maintenanceLogs = useAquaStore((s) => s.maintenanceLogs);

  const [expanded, setExpanded] = useState(true);

  const tankWQ = waterQualities
    .filter((w) => w.tankId === tankId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = tankWQ[0];
  if (!latest) return null;

  const isAbnormal =
    latest.ammonia > 0.5 ||
    latest.nitrite > 0.1 ||
    latest.waterColor === '发绿' ||
    latest.waterColor === '浑浊';

  if (!isAbnormal) return null;

  const recentMaintenance = maintenanceLogs
    .filter((m) => m.tankId === tankId && new Date(m.date) <= new Date(latest.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-coral/30 bg-coral/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-coral/10 transition-colors"
      >
        <AlertTriangle className="w-5 h-5 text-coral shrink-0" />
        <span className="text-foam font-semibold flex-1 text-left">⚠️ 水质异常 - 关联维护记录</span>
        <span className="text-foam/40 text-xs">{expanded ? '收起' : '展开'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {recentMaintenance.length === 0 ? (
            <p className="text-foam/40 text-sm py-2">在此次水质记录前暂无维护记录</p>
          ) : (
            recentMaintenance.map((log) => (
              <div key={log.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${getMaintenanceColor(log.type)}`}>
                <span className="text-sm font-medium flex-1">{log.type}</span>
                <span className="text-xs opacity-70">{log.date}</span>
                <span className="text-xs opacity-80 max-w-[200px] truncate">{log.description}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function HistoryTable({ tankId }: { tankId: string }) {
  const waterQualities = useAquaStore((s) => s.waterQualities);
  const deleteWaterQuality = useAquaStore((s) => s.deleteWaterQuality);

  const tankWQ = waterQualities
    .filter((w) => w.tankId === tankId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (tankWQ.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5 overflow-x-auto">
      <h2 className="text-lg font-semibold text-foam mb-4">历史记录</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-foam/50 text-left border-b border-white/10">
            <th className="pb-2 pr-3 font-medium">日期</th>
            <th className="pb-2 pr-3 font-medium">氨氮</th>
            <th className="pb-2 pr-3 font-medium">亚硝酸盐</th>
            <th className="pb-2 pr-3 font-medium">pH</th>
            <th className="pb-2 pr-3 font-medium">水色</th>
            <th className="pb-2 pr-3 font-medium">备注</th>
            <th className="pb-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {tankWQ.map((wq) => (
            <tr key={wq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-2.5 pr-3 text-foam/80">{wq.date}</td>
              <td className={`py-2.5 pr-3 font-medium ${wq.ammonia > 0.5 ? 'text-coral' : 'text-foam/80'}`}>{wq.ammonia}</td>
              <td className={`py-2.5 pr-3 font-medium ${wq.nitrite > 0.1 ? 'text-coral' : 'text-foam/80'}`}>{wq.nitrite}</td>
              <td className={`py-2.5 pr-3 font-medium ${wq.pH < 6.5 || wq.pH > 7.5 ? (wq.pH < 6.0 || wq.pH > 8.0 ? 'text-coral' : 'text-sand') : 'text-foam/80'}`}>{wq.pH}</td>
              <td className={`py-2.5 pr-3 font-medium ${getWaterColorColor(wq.waterColor)}`}>{wq.waterColor}</td>
              <td className="py-2.5 pr-3 text-foam/50 max-w-[200px] truncate">{wq.note || '-'}</td>
              <td className="py-2.5">
                <button
                  onClick={() => deleteWaterQuality(wq.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-foam/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WaterQuality() {
  const { waterQualities, activeTankId, addWaterQuality } = useAquaStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  if (!activeTankId) {
    return (
      <div className="min-h-screen bg-deep-sea flex items-center justify-center">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foam mb-2">请先选择鱼缸</h2>
          <p className="text-foam-dark text-sm mb-6">需要先创建或选择一个鱼缸，才能管理水质</p>
          <Link
            to="/tank"
            className="inline-flex items-center gap-2 bg-surface hover:bg-shallow text-deep-sea font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            前往鱼缸管理
          </Link>
        </div>
      </div>
    );
  }

  const tankWQ = waterQualities.filter((w) => w.tankId === activeTankId);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ammonia = Number(form.ammonia);
    const nitrite = Number(form.nitrite);
    const pH = Number(form.pH);

    if (ammonia < 0 || nitrite < 0) return;
    if (pH < 0 || pH > 14) return;

    addWaterQuality({
      tankId: activeTankId,
      date: form.date,
      ammonia,
      nitrite,
      pH,
      waterColor: form.waterColor,
      note: form.note,
    });

    setForm(emptyForm);
    setShowModal(false);
  };

  return (
    <div className="bubble-bg relative min-h-screen p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foam">
            💧 水质监测
          </h1>
          <button
            onClick={() => {
              setForm(emptyForm);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-all duration-200 shadow-lg shadow-coral/20"
          >
            <Plus size={18} />
            添加记录
          </button>
        </div>

        {tankWQ.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-foam/30" />
            <p className="text-foam/50 text-lg mb-2">暂无水质记录</p>
            <p className="text-foam/30 text-sm">点击"添加记录"开始追踪水质变化</p>
          </div>
        ) : (
          <div className="space-y-6">
            <LatestCard tankId={activeTankId} />
            <AbnormalPanel tankId={activeTankId} />
            <TrendCharts tankId={activeTankId} />
            <HistoryTable tankId={activeTankId} />
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-strong relative w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-foam">添加水质记录</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-foam transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foam/70 mb-1.5">日期</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">氨氮 (mg/L)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    value={form.ammonia}
                    onChange={(e) => updateField('ammonia', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                    placeholder="0.00"
                  />
                  {form.ammonia !== '' && Number(form.ammonia) < 0 && (
                    <p className="text-coral text-xs mt-1">氨氮不能为负数</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-foam/70 mb-1.5">亚硝酸盐 (mg/L)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    value={form.nitrite}
                    onChange={(e) => updateField('nitrite', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                    placeholder="0.00"
                  />
                  {form.nitrite !== '' && Number(form.nitrite) < 0 && (
                    <p className="text-coral text-xs mt-1">亚硝酸盐不能为负数</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">pH</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={14}
                  step={0.1}
                  value={form.pH}
                  onChange={(e) => updateField('pH', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                  placeholder="7.0"
                />
                {form.pH !== '' && (Number(form.pH) < 0 || Number(form.pH) > 14) && (
                  <p className="text-coral text-xs mt-1">pH 应在 0-14 之间</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">水色</label>
                <select
                  value={form.waterColor}
                  onChange={(e) => updateField('waterColor', e.target.value as WaterColor)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam focus:outline-none focus:border-coral/50 transition-colors"
                >
                  {WATER_COLOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-deep-sea text-foam">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">备注</label>
                <textarea
                  value={form.note}
                  onChange={(e) => updateField('note', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors resize-none"
                  placeholder="记录观察到的异常情况..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-foam/70 hover:bg-white/5 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-colors shadow-lg shadow-coral/20"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
