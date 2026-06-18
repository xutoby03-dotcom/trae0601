import { useState } from 'react';
import { useAquaStore } from '@/store/aquaStore';
import type { MaintenanceLog, MaintenanceType } from '@/types';
import { Plus, Droplets, Wrench, FlaskConical, Trash2, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_CONFIG: Record<MaintenanceType, { color: string; icon: typeof Droplets }> = {
  '换水': { color: '#2C74B3', icon: Droplets },
  '清洗过滤桶': { color: '#2D8F4E', icon: Wrench },
  '添加硝化细菌': { color: '#8B5CF6', icon: FlaskConical },
};

interface FormData {
  type: MaintenanceType;
  date: string;
  description: string;
  waterChangeAmount: number;
  waterChangePercent: number;
  nitrifyingBrand: string;
  nitrifyingDosage: string;
}

const emptyForm: FormData = {
  type: '换水',
  date: new Date().toISOString().split('T')[0],
  description: '',
  waterChangeAmount: 0,
  waterChangePercent: 0,
  nitrifyingBrand: '',
  nitrifyingDosage: '',
};

export default function Maintenance() {
  const activeTankId = useAquaStore((s) => s.activeTankId);
  const maintenanceLogs = useAquaStore((s) => s.maintenanceLogs);
  const addMaintenanceLog = useAquaStore((s) => s.addMaintenanceLog);
  const deleteMaintenanceLog = useAquaStore((s) => s.deleteMaintenanceLog);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  if (!activeTankId) {
    return (
      <div className="min-h-screen bg-deep-sea flex items-center justify-center">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md">
          <Droplets className="w-16 h-16 text-surface mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foam mb-2">还没有鱼缸</h2>
          <p className="text-foam-dark text-sm mb-6">请先创建一个鱼缸，开始记录维护活动</p>
          <Link
            to="/tank"
            className="inline-flex items-center gap-2 bg-surface hover:bg-shallow text-deep-sea font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            创建鱼缸
          </Link>
        </div>
      </div>
    );
  }

  const logs = maintenanceLogs
    .filter((m) => m.tankId === activeTankId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const logData: Omit<MaintenanceLog, 'id'> = {
      tankId: activeTankId,
      type: form.type,
      date: form.date,
      description: form.description,
    };
    if (form.type === '换水') {
      logData.waterChangeAmount = form.waterChangeAmount;
      logData.waterChangePercent = form.waterChangePercent;
    }
    if (form.type === '添加硝化细菌') {
      logData.nitrifyingBrand = form.nitrifyingBrand;
      logData.nitrifyingDosage = form.nitrifyingDosage;
    }
    addMaintenanceLog(logData);
    setForm(emptyForm);
    setShowModal(false);
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bubble-bg relative min-h-screen p-4 md:p-6 lg:p-8">
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foam">
            <Wrench className="inline-block mr-2 mb-1" size={28} />
            维护记录
          </h1>
          <button
            onClick={() => {
              setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-light text-white font-medium transition-all duration-200 shadow-lg shadow-coral/20"
          >
            <Plus size={18} />
            添加记录
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-foam/30" />
            <p className="text-foam/50 text-lg mb-2">暂无维护记录</p>
            <p className="text-foam/30 text-sm">点击右上角"添加记录"开始记录维护活动</p>
          </div>
        ) : (
          <div className="relative">
            <div className="space-y-0">
              {logs.map((log, index) => {
                const config = TYPE_CONFIG[log.type];
                const Icon = config.icon;
                const isLast = index === logs.length - 1;
                return (
                  <div key={log.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center shrink-0 w-20 pt-1">
                      <span className="text-xs text-foam/50 whitespace-nowrap">
                        {log.date.slice(5)}
                      </span>
                      <span className="text-[10px] text-foam/30">
                        {log.date.slice(0, 4)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: config.color }}
                      />
                      {!isLast && (
                        <div
                          className="w-0.5 flex-1 min-h-8"
                          style={{ backgroundColor: config.color, opacity: 0.3 }}
                        />
                      )}
                    </div>

                    <div className="glass-card flex-1 p-4 mb-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: config.color }}
                        >
                          <Icon size={12} />
                          {log.type}
                        </span>
                        <button
                          onClick={() => deleteMaintenanceLog(log.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-foam/40 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-foam/40 mb-2">{log.date}</p>

                      {log.description && (
                        <p className="text-sm text-foam/80 mb-2">{log.description}</p>
                      )}

                      {log.type === '换水' && (log.waterChangeAmount != null || log.waterChangePercent != null) && (
                        <div className="flex gap-3 mt-1">
                          {log.waterChangeAmount != null && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foam/60 border border-white/10">
                              换水量: {log.waterChangeAmount} L
                            </span>
                          )}
                          {log.waterChangePercent != null && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foam/60 border border-white/10">
                              换水比例: {log.waterChangePercent}%
                            </span>
                          )}
                        </div>
                      )}

                      {log.type === '添加硝化细菌' && (log.nitrifyingBrand || log.nitrifyingDosage) && (
                        <div className="flex gap-3 mt-1">
                          {log.nitrifyingBrand && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foam/60 border border-white/10">
                              品牌: {log.nitrifyingBrand}
                            </span>
                          )}
                          {log.nitrifyingDosage && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foam/60 border border-white/10">
                              用量: {log.nitrifyingDosage}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-strong relative w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-foam">添加维护记录</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-foam/60 hover:text-foam transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-foam/70 mb-1.5">维护类型</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value as MaintenanceType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam focus:outline-none focus:border-coral/50 transition-colors"
                >
                  <option value="换水" className="bg-[#144272] text-foam">换水</option>
                  <option value="清洗过滤桶" className="bg-[#144272] text-foam">清洗过滤桶</option>
                  <option value="添加硝化细菌" className="bg-[#144272] text-foam">添加硝化细菌</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">
                  <Calendar size={12} className="inline mr-1" />
                  日期
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam focus:outline-none focus:border-coral/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-foam/70 mb-1.5">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors resize-none"
                  placeholder="记录维护详情..."
                />
              </div>

              {form.type === '换水' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foam/70 mb-1.5">换水量 (L)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={form.waterChangeAmount || ''}
                      onChange={(e) => updateField('waterChangeAmount', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foam/70 mb-1.5">换水比例 (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.waterChangePercent || ''}
                      onChange={(e) => updateField('waterChangePercent', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {form.type === '添加硝化细菌' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foam/70 mb-1.5">品牌</label>
                    <input
                      type="text"
                      value={form.nitrifyingBrand}
                      onChange={(e) => updateField('nitrifyingBrand', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                      placeholder="例：科迪"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foam/70 mb-1.5">用量</label>
                    <input
                      type="text"
                      value={form.nitrifyingDosage}
                      onChange={(e) => updateField('nitrifyingDosage', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foam placeholder-foam/30 focus:outline-none focus:border-coral/50 transition-colors"
                      placeholder="例：10ml"
                    />
                  </div>
                </div>
              )}

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
