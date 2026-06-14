import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Package, AlertTriangle, TrendingDown, ShoppingBag, ArrowRight, ArrowLeftRight, Filter } from 'lucide-react';
import { useBatchStore } from '@/store/batchStore';
import { useJarStore } from '@/store/jarStore';
import { getDamageLabel } from '@/utils/alert';
import { formatDateTime, addDays, nowISO } from '@/utils/date';

const PIE_COLORS = ['#E67E22', '#C0392B', '#7A6B3C'];
const SAFE_STOCK_WEIGHT = 500;

export default function Statistics() {
  const navigate = useNavigate();
  const { batches } = useBatchStore();
  const { jars, operations } = useJarStore();
  const [onlyRefill, setOnlyRefill] = useState(false);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'jar' | 'batch'>('all');
  const [refillKeyword, setRefillKeyword] = useState('');

  const refillFlows = useMemo(() => {
    function parseRefillReason(reason: string): {
      sourceType: 'jar' | 'batch' | null;
      sourceLabel: string;
      sourceJarNo: string;
      sourceBatchName: string;
      remark: string;
    } {
      const result = {
        sourceType: null as 'jar' | 'batch' | null,
        sourceLabel: '',
        sourceJarNo: '',
        sourceBatchName: '',
        remark: '',
      };
      if (!reason) return result;

      const mainPart = reason.includes(' · ') ? reason.split(' · ')[0] : reason;
      result.remark = reason.includes(' · ') ? reason.split(' · ')[1] : '';

      let match: RegExpMatchArray | null;

      match = mainPart.match(/^从罐\s*(.+)$/);
      if (match) {
        result.sourceType = 'jar';
        result.sourceJarNo = match[1].trim();
        result.sourceLabel = result.sourceJarNo;
        return result;
      }

      match = mainPart.match(/^从批次\s*(.+)$/);
      if (match) {
        result.sourceType = 'batch';
        result.sourceBatchName = match[1].trim();
        result.sourceLabel = result.sourceBatchName;
        return result;
      }

      match = mainPart.match(/^从\s*(LJ-[^\s]+)\s*补入$/);
      if (match) {
        result.sourceType = 'jar';
        result.sourceJarNo = match[1].trim();
        result.sourceLabel = result.sourceJarNo;
        return result;
      }

      match = mainPart.match(/^从\s*([^LJ][^\s]*|[^\s][^\s]*)\s*补入$/);
      if (match && !match[1].startsWith('LJ-')) {
        result.sourceType = 'batch';
        result.sourceBatchName = match[1].trim();
        result.sourceLabel = result.sourceBatchName;
        return result;
      }

      if (mainPart) {
        result.sourceLabel = mainPart;
      }

      return result;
    }

    return operations
      .filter((o) => o.type === 'refill' && !o.reason.startsWith('转出到'))
      .map((op) => {
        const targetJar = jars.find((j) => j.id === op.jarId);
        const targetBatch = batches.find((b) => b.id === targetJar?.batchId);

        let sourceType: 'jar' | 'batch' | null = op.sourceType || null;
        let sourceLabel = '';
        let sourceJarNo = '';
        let sourceBatchName = '';
        let remark = '';

        if (op.sourceType && op.sourceId) {
          if (op.sourceType === 'jar') {
            const sJar = jars.find((j) => j.id === op.sourceId);
            const sBatch = batches.find((b) => b.id === sJar?.batchId);
            sourceJarNo = sJar?.jarNo || '';
            sourceBatchName = sBatch?.name || '';
            sourceLabel = sourceJarNo || '未知罐';
          } else {
            const sBatch = batches.find((b) => b.id === op.sourceId);
            sourceBatchName = sBatch?.name || '';
            sourceLabel = sourceBatchName || '未知批次';
          }
          remark = op.reason.includes(' · ') ? op.reason.split(' · ')[1] : '';
        } else {
          const parsed = parseRefillReason(op.reason);
          sourceType = parsed.sourceType;
          sourceLabel = parsed.sourceLabel;
          if (parsed.sourceType === 'jar') {
            sourceJarNo = parsed.sourceJarNo;
            const matchedJar = jars.find((j) => j.jarNo === parsed.sourceJarNo);
            if (matchedJar) {
              const matchedBatch = batches.find((b) => b.id === matchedJar.batchId);
              sourceBatchName = matchedBatch?.name || '';
            }
          } else if (parsed.sourceType === 'batch') {
            sourceBatchName = parsed.sourceBatchName;
          }
          remark = parsed.remark;
        }

        return {
          id: op.id,
          teaName: targetBatch?.name || '未知茶品',
          sourceType,
          sourceLabel,
          sourceJarNo,
          sourceBatchName,
          targetJarNo: targetJar?.jarNo || '未知罐',
          targetJarId: targetJar?.id,
          weight: op.weight,
          operator: op.operator,
          operatedAt: op.operatedAt,
          remark,
        };
      })
      .sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime());
  }, [operations, jars, batches]);

  const filteredRefillFlows = useMemo(() => {
    return refillFlows.filter((f) => {
      if (sourceTypeFilter !== 'all' && f.sourceType !== sourceTypeFilter) {
        return false;
      }
      if (refillKeyword.trim()) {
        const kw = refillKeyword.trim().toLowerCase();
        const haystack = [
          f.teaName,
          f.sourceJarNo,
          f.sourceBatchName,
          f.targetJarNo,
          f.sourceLabel,
          f.remark,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [refillFlows, sourceTypeFilter, refillKeyword]);

  const remainingByTea = useMemo(() => {
    const map = new Map<string, number>();
    batches.forEach((b) => {
      const current = map.get(b.name) || 0;
      map.set(b.name, current + b.remainingWeight);
    });
    jars
      .filter((j) => j.status !== 'sold' && j.status !== 'damaged')
      .forEach((j) => {
        const batch = batches.find((b) => b.id === j.batchId);
        if (batch) {
          const current = map.get(batch.name) || 0;
          map.set(batch.name, current + j.currentWeight);
        }
      });
    return Array.from(map.entries())
      .map(([name, weight]) => ({ name, weight: Math.round(weight) }))
      .sort((a, b) => b.weight - a.weight);
  }, [batches, jars]);

  const damageAnalysis = useMemo(() => {
    const map = new Map<string, number>();
    operations
      .filter((o) => o.type === 'damage')
      .forEach((o) => {
        const reason = o.reason.split(' - ')[0];
        const current = map.get(reason) || 0;
        map.set(reason, current + o.weight);
      });
    return Array.from(map.entries()).map(([reason, weight]) => ({
      name: getDamageLabel(reason),
      value: weight,
    }));
  }, [operations]);

  const fastestSelling = useMemo(() => {
    return batches
      .map((batch) => {
        const soldWeight = operations
          .filter((o) => {
            const jar = jars.find((j) => j.id === o.jarId);
            return o.type === 'sale' && jar?.batchId === batch.id;
          })
          .reduce((sum, o) => sum + o.weight, 0);

        const totalRemaining =
          batch.remainingWeight +
          jars
            .filter((j) => j.batchId === batch.id && j.status !== 'sold' && j.status !== 'damaged')
            .reduce((sum, j) => sum + j.currentWeight, 0);

        const sevenDaysAgo = addDays(nowISO(), -7);
        const recentSales = operations
          .filter((o) => {
            const jar = jars.find((j) => j.id === o.jarId);
            return (
              o.type === 'sale' &&
              jar?.batchId === batch.id &&
              new Date(o.operatedAt) >= new Date(sevenDaysAgo)
            );
          })
          .reduce((sum, o) => sum + o.weight, 0);

        const dailyAvg = recentSales / 7;
        const daysLeft = dailyAvg > 0 ? Math.round(totalRemaining / dailyAvg) : 999;

        return {
          batch,
          soldWeight,
          totalRemaining,
          dailyAvg: Math.round(dailyAvg),
          daysLeft,
        };
      })
      .filter((b) => b.totalRemaining > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [batches, jars, operations]);

  const replenishSuggestions = useMemo(() => {
    return remainingByTea
      .filter((item) => item.weight < SAFE_STOCK_WEIGHT)
      .map((item) => ({
        ...item,
        suggestAmount: SAFE_STOCK_WEIGHT * 4 - item.weight,
        urgency: item.weight < SAFE_STOCK_WEIGHT / 2 ? '紧急' : '建议',
      }))
      .sort((a, b) => a.weight - b.weight);
  }, [remainingByTea]);

  const summaryStats = useMemo(() => {
    const totalTeaTypes = new Set(batches.map((b) => b.name)).size;
    const totalJars = jars.filter((j) => j.status !== 'sold' && j.status !== 'damaged').length;
    const totalDamage = operations
      .filter((o) => o.type === 'damage')
      .reduce((sum, o) => sum + o.weight, 0);
    const totalSold = operations.filter((o) => o.type === 'sale').reduce((sum, o) => sum + o.weight, 0);
    return { totalTeaTypes, totalJars, totalDamage, totalSold };
  }, [batches, jars, operations]);

  const statCards = [
    { label: '茶品数量', value: `${summaryStats.totalTeaTypes} 种`, icon: Package, color: 'text-teaGreen-600', bg: 'bg-teaGreen-50' },
    { label: '在库罐数', value: `${summaryStats.totalJars} 罐`, icon: ShoppingBag, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: '累计售卖', value: `${summaryStats.totalSold} g`, icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '累计报损', value: `${summaryStats.totalDamage} g`, icon: AlertTriangle, color: 'text-dangerRed', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <button
          onClick={() => setOnlyRefill(!onlyRefill)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
            onlyRefill
              ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-500 hover:border-purple-200 hover:text-purple-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          只看补罐记录
        </button>
      </div>

      <div className={`grid grid-cols-4 gap-5 ${onlyRefill ? 'hidden' : ''}`}>
        {statCards.map((card) => (
          <div key={card.label} className="card !p-0 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 font-serif">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-2 gap-6 ${onlyRefill ? 'hidden' : ''}`}>
        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">各茶品剩余重量</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={remainingByTea} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDC4" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#5A4F2B', fontSize: 12 }} axisLine={{ stroke: '#D4C59E' }} tickLine={false} />
              <YAxis tick={{ fill: '#5A4F2B', fontSize: 12 }} axisLine={{ stroke: '#D4C59E' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #D4C59E',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: number) => [`${value} g`, '剩余重量']}
              />
              <Bar dataKey="weight" fill="#2D5A27" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">报损原因分析</h3>
          {damageAnalysis.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-gray-400">暂无报损数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={damageAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {damageAnalysis.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D4C59E',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [`${value} g`, '报损重量']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-6 ${onlyRefill ? 'hidden' : ''}`}>
        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-warnOrange" />
            最快售完批次 TOP5
          </h3>
          <div className="space-y-3">
            {fastestSelling.map((item, idx) => (
              <div
                key={item.batch.id}
                className="p-4 rounded-xl bg-gradient-to-r from-tea-50 to-transparent hover:shadow-sm transition-shadow flex items-center gap-4"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-dangerRed text-white' : idx < 3 ? 'bg-warnOrange text-white' : 'bg-tea-200 text-tea-700'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">{item.batch.name}</p>
                    <span
                      className={`text-sm font-bold ${
                        item.daysLeft <= 7 ? 'text-dangerRed' : item.daysLeft <= 15 ? 'text-warnOrange' : 'text-teaGreen-600'
                      }`}
                    >
                      约 {item.daysLeft} 天售完
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>剩余 {item.totalRemaining}g</span>
                    <span>日均销 {item.dailyAvg}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-tea-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.daysLeft <= 7 ? 'bg-dangerRed' : item.daysLeft <= 15 ? 'bg-warnOrange' : 'bg-teaGreen-500'
                      }`}
                      style={{ width: `${Math.min(100, (1 - item.totalRemaining / item.batch.totalWeight) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-teaGreen-600" />
            补货建议
          </h3>
          {replenishSuggestions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>所有茶品库存充足</p>
            </div>
          ) : (
            <div className="space-y-3">
              {replenishSuggestions.map((item) => (
                <div
                  key={item.name}
                  className={`p-4 rounded-xl border-2 transition-shadow hover:shadow-sm flex items-center justify-between ${
                    item.urgency === '紧急' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.urgency === '紧急' ? 'bg-dangerRed animate-pulse' : 'bg-warnOrange'
                      }`}
                    ></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            item.urgency === '紧急' ? 'bg-red-100 text-dangerRed' : 'bg-amber-100 text-warnOrange'
                          }`}
                        >
                          {item.urgency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">当前库存 {item.weight}g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">建议补货</p>
                    <p className="font-bold text-teaGreen-600">{item.suggestAmount}g</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate('/batches/new')}
                className="w-full mt-2 p-3 rounded-xl border-2 border-dashed border-tea-200 text-teaGreen-600 hover:border-teaGreen-400 hover:bg-teaGreen-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                去新增批次
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-purple-600" />
              补罐流向记录
              <span className="text-xs font-sans font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredRefillFlows.length} / {refillFlows.length} 条
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 p-1 bg-gray-50/50">
              {(['all', 'jar', 'batch'] as const).map((t) => {
                const labels: Record<typeof t, string> = {
                  all: '全部',
                  jar: '🫙 罐→罐',
                  batch: '📦 批次→罐',
                };
                const isActive = sourceTypeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSourceTypeFilter(t)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
                      isActive
                        ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 max-w-xs">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={refillKeyword}
                  onChange={(e) => setRefillKeyword(e.target.value)}
                  placeholder="搜索茶品名、罐号..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {refillFlows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 flex items-center justify-center">
              <ArrowLeftRight className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-gray-400">暂无补罐记录</p>
            <p className="text-xs text-gray-300 mt-1">罐详情页 → 补罐操作 后，记录会展示在这里</p>
          </div>
        ) : filteredRefillFlows.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">没有匹配的补罐记录</p>
            <button
              onClick={() => {
                setSourceTypeFilter('all');
                setRefillKeyword('');
              }}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 underline underline-offset-2"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-tea-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3 pl-3">
                    茶品
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    流向
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    来源罐/批次
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    转出重量
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    操作人
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3">
                    转入时间
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-3 pr-3">
                    备注
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tea-50">
                {filteredRefillFlows.map((flow) => (
                  <tr
                    key={flow.id}
                    onClick={() => flow.targetJarId && navigate(`/jars/${flow.targetJarId}`)}
                    className={`group transition-colors ${
                      flow.targetJarId ? 'cursor-pointer hover:bg-purple-50/40' : ''
                    }`}
                  >
                    <td className="py-4 pl-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-tea-50 text-teaGreen-700 text-sm font-medium">
                        {flow.teaName}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            flow.sourceType === 'jar'
                              ? 'bg-blue-50 text-blue-600'
                              : flow.sourceType === 'batch'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {flow.sourceType === 'jar'
                            ? '🫙 罐→罐'
                            : flow.sourceType === 'batch'
                            ? '📦 批次→罐'
                            : '❓ 来源未标注'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">{flow.sourceLabel}</p>
                        {flow.sourceJarNo && flow.sourceBatchName && (
                          <p className="text-xs text-gray-400 mt-0.5">{flow.sourceBatchName}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <ArrowLeftRight className="w-3 h-3" />
                          <span className="font-mono">{flow.targetJarNo}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center text-teaGreen-600 font-bold font-serif text-lg">
                        +{flow.weight}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">g</span>
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-600">{flow.operator}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-500 font-mono text-xs">
                        {formatDateTime(flow.operatedAt)}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <span className="text-sm text-gray-400">
                        {flow.remark || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
