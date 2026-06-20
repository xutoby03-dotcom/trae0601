import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Clock, TrendingUp, AlertTriangle, CheckCircle, AlertCircle, Trash2, ChevronRight } from 'lucide-react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { LENS_BRANDS, LENS_MOUNTS, CONDITIONS, PURCHASE_CHANNELS } from '@/data/checklistItems';
import { formatPrice, formatDate, recommendationLabel, collectAggregatedRisks, countRisksByLevel } from '@/utils/evaluation';

export default function Home() {
  const navigate = useNavigate();
  const { inspections, createInspection, deleteInspection } = useInspectionStore();

  const [form, setForm] = useState({
    brand: 'Sony',
    model: '',
    mount: 'Sony E',
    sellerPrice: 0,
    condition: 'good',
    purchaseChannel: '闲鱼',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model.trim() || form.sellerPrice <= 0) return;
    const inspection = createInspection(form);
    navigate(`/inspection/${inspection.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除这条检测记录吗？')) {
      deleteInspection(id);
    }
  };

  const getRiskBadge = (count: { high: number; medium: number; low: number }) => {
    if (count.high > 0) return <span className="badge-high">高风险 {count.high}</span>;
    if (count.medium > 0) return <span className="badge-medium">中风险 {count.medium}</span>;
    if (count.low > 0) return <span className="badge-low">低风险 {count.low}</span>;
    return <span className="badge-pass">暂无风险</span>;
  };

  return (
    <div className="min-h-screen pb-20">
      <section className="relative overflow-hidden border-b border-ink-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-copper-500/5 via-transparent to-ink-950" />
        <div className="container relative py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-500/10 border border-copper-500/20 text-copper-400 text-xs mb-5">
              <Camera className="w-3.5 h-3.5" />
              LensCheck 专业工具
            </div>
            <h1 className="font-display text-5xl font-semibold text-white leading-tight mb-4">
              二手镜头检测<br/>
              <span className="text-copper-400">与价格评估</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              系统化检测外观、镜片霉斑、光圈叶片、自动对焦与样张画质，
              智能评估风险，生成砍价建议，告别边角糊和对焦漂的坑。
            </p>
          </div>
        </div>
      </section>

      <div className="container py-10 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-copper-500/15 text-copper-400 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white">开始新检测</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">品牌</label>
                  <select
                    className="input"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  >
                    {LENS_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">卡口</label>
                  <select
                    className="input"
                    value={form.mount}
                    onChange={(e) => setForm({ ...form, mount: e.target.value })}
                  >
                    {LENS_MOUNTS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">镜头型号</label>
                <input
                  type="text"
                  className="input"
                  placeholder="如 FE 24-70mm f/2.8 GM II"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">卖家报价（元）</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="5000"
                    min={0}
                    value={form.sellerPrice || ''}
                    onChange={(e) => setForm({ ...form, sellerPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="label">成色</label>
                  <select
                    className="input"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  >
                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">购买渠道</label>
                <select
                  className="input"
                  value={form.purchaseChannel}
                  onChange={(e) => setForm({ ...form, purchaseChannel: e.target.value })}
                >
                  {PURCHASE_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">备注</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="卖家描述、使用年限等..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={!form.model.trim() || form.sellerPrice <= 0}
              >
                <Plus className="w-4 h-4" />
                创建检测流程
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-copper-400" />
              检测历史
            </h2>
            <span className="text-sm text-gray-500">{inspections.length} 条记录</span>
          </div>

          {inspections.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-800 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400">还没有检测记录</p>
              <p className="text-sm text-gray-600 mt-1">在左侧创建新检测开始使用</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections.map((ins) => {
                const aggregated = collectAggregatedRisks(ins);
                const riskCount = countRisksByLevel(aggregated);
                return (
                  <div
                    key={ins.id}
                    onClick={() => navigate(`/inspection/${ins.id}`)}
                    className="card card-hover p-5 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display text-lg font-semibold text-white truncate">
                            {ins.lensInfo.brand} {ins.lensInfo.model}
                          </h3>
                          {ins.report && (
                            ins.report.recommendation === 'buy' ? (
                              <CheckCircle className="w-4 h-4 text-jade-400 flex-shrink-0" />
                            ) : ins.report.recommendation === 'caution' ? (
                              <AlertCircle className="w-4 h-4 text-amber-soft flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rust-400 flex-shrink-0" />
                            )
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>{ins.lensInfo.mount}</span>
                          <span>·</span>
                          <span>{formatDate(ins.lensInfo.createdAt)}</span>
                          <span>·</span>
                          <span className="text-gray-400">报价 {formatPrice(ins.lensInfo.sellerPrice)}</span>
                          {ins.report && (
                            <>
                              <span>·</span>
                              <span className="text-copper-400">
                                合理价 {formatPrice(ins.report.fairPrice)}
                              </span>
                              <span>·</span>
                              <span className="font-semibold" style={{
                                color: ins.report.recommendation === 'buy' ? '#4ecca3' :
                                       ins.report.recommendation === 'caution' ? '#f5c16c' : '#e8505b'
                              }}>
                                {recommendationLabel(ins.report.recommendation)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          {getRiskBadge(riskCount)}
                          <div className="flex-1 h-1.5 rounded-full bg-ink-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-copper-500 to-copper-400 transition-all"
                              style={{ width: `${(ins.checkItems.filter(i => i.status !== 'untested').length / ins.checkItems.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {ins.checkItems.filter(i => i.status !== 'untested').length}/{ins.checkItems.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDelete(e, ins.id)}
                          className="p-2 rounded-lg text-gray-600 hover:text-rust-400 hover:bg-rust-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-copper-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="card p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-jade-500/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-jade-400" />
              </div>
              <p className="text-2xl font-display font-semibold text-white">
                {inspections.filter(i => i.report?.recommendation === 'buy').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">建议购买</p>
            </div>
            <div className="card p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-soft/15 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-soft" />
              </div>
              <p className="text-2xl font-display font-semibold text-white">
                {inspections.filter(i => i.report?.recommendation === 'caution').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">谨慎购买</p>
            </div>
            <div className="card p-5 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-rust-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-rust-400" />
              </div>
              <p className="text-2xl font-display font-semibold text-white">
                {inspections.reduce((sum, i) => sum + (i.report ? i.lensInfo.sellerPrice - i.report.fairPrice : 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">累计砍价（元）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
