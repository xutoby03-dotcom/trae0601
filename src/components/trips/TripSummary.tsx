import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  User as UserIcon,
  Package,
  BarChart3,
  Pill,
  Users,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS } from '@/types';
import { formatDate } from '@/utils/date';
import { isExpired, isExpiringSoon, calculateRestock } from '@/utils/medicine';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { clsx } from 'clsx';

export default function TripSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trips, tripItems, medicines, familyMembers, adjustStock } = useAppStore();

  const trip = trips.find((t) => t.id === id);
  const items = tripItems.filter((ti) => ti.tripId === id);
  const companions = familyMembers.filter((fm) => trip?.companionIds.includes(fm.id));

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter((i) => i.isPacked).length;
    const unpacked = total - packed;
    const percent = total > 0 ? Math.round((packed / total) * 100) : 0;

    const totalConsumed = items.reduce((s, i) => s + i.consumedQuantity, 0);
    const totalPacked = items.reduce((s, i) => s + i.packedQuantity, 0);

    const missing: typeof items = [];
    const insufficient: typeof items = [];
    const expiredItems: typeof items = [];

    items.forEach((ti) => {
      const m = medicines.find((x) => x.id === ti.medicineId);
      if (!m) return;
      if (isExpired(m)) expiredItems.push(ti);
      else if (!ti.isPacked) missing.push(ti);
      else if (ti.packedQuantity < ti.suggestedQuantity) insufficient.push(ti);
    });

    return {
      total,
      packed,
      unpacked,
      percent,
      totalConsumed,
      totalPacked,
      missing,
      insufficient,
      expiredItems,
    };
  }, [items, medicines]);

  const personalCheck = useMemo(() => {
    return companions.map((member) => {
      const dedicated = member.dedicatedMedicineIds
        .map((mid) => {
          const item = items.find((ti) => ti.medicineId === mid);
          const med = medicines.find((m) => m.id === mid);
          return { id: mid, item, med, isDedicated: true };
        })
        .filter((x) => x.med);

      const relatedItems = items.filter((ti) => {
        const m = medicines.find((x) => x.id === ti.medicineId);
        return m && (m.applicableTo === member.id || m.category === 'chronic');
      });

      const all = [...dedicated, ...relatedItems.map((ti) => ({
        id: ti.medicineId,
        item: ti,
        med: medicines.find((m) => m.id === ti.medicineId),
        isDedicated: false,
      }))];

      const missing = all.filter((x) => !x.item?.isPacked || isExpired(x.med!));

      return { member, all, missing };
    });
  }, [companions, items, medicines]);

  const restockList = useMemo(() => {
    const list: { medicine: any; qty: number; reason: string }[] = [];
    const MIN_STOCK = 5;

    const touchedMeds = new Set(items.map((ti) => ti.medicineId));
    medicines.forEach((med) => {
      const relevantItems = items.filter((ti) => ti.medicineId === med.id);
      const totalConsumed = relevantItems.reduce((s, ti) => s + ti.consumedQuantity, 0);
      const totalPacked = relevantItems.reduce((s, ti) => s + ti.packedQuantity, 0);
      const qty = calculateRestock(med, relevantItems);

      let reason = '';
      if (isExpired(med)) {
        reason = '已过期需更换';
        list.push({ medicine: med, qty: qty || totalPacked || MIN_STOCK, reason });
      } else if (qty > 0) {
        const reasons: string[] = [];
        if (totalConsumed > 0) reasons.push(`消耗 ${totalConsumed}`);
        if (med.stockQuantity < MIN_STOCK) reasons.push(`库存仅${med.stockQuantity}`);
        reason = reasons.join('，') || '需补货';
        list.push({ medicine: med, qty, reason });
      } else if (touchedMeds.has(med.id) && med.stockQuantity <= 2) {
        reason = `库存偏低（${med.stockQuantity}）`;
        list.push({ medicine: med, qty: MIN_STOCK - med.stockQuantity, reason });
      }
    });

    return list.sort((a, b) => b.qty - a.qty);
  }, [items, medicines]);

  if (!trip) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">旅行不存在</p>
        <Link to="/trips" className="text-brand-600 hover:underline mt-2 inline-block">
          返回旅行列表
        </Link>
      </div>
    );
  }

  const handleApplyRestock = () => {
    if (!confirm('是否按清单数量补充库存（模拟采购完成）？')) return;
    restockList.forEach((item) => {
      adjustStock(item.medicine.id, item.qty);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/trips/${trip.id}`)}
          className="p-2 rounded-xl text-slate-500 hover:bg-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-bold text-slate-900 truncate flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={24} />
            {trip.destination} · 汇总统计
          </h2>
          <p className="text-sm text-slate-500">
            {formatDate(trip.startDate)} · {trip.days} 天 ·{' '}
            {companions.map((c) => c.name).join('、')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card !p-5 !rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white border-0">
          <div className="flex items-center justify-between mb-2">
            <Package size={18} className="opacity-80" />
            <span className="text-xs opacity-80">打包进度</span>
          </div>
          <p className="font-display text-3xl font-bold">
            {stats.packed}
            <span className="text-lg opacity-70">/{stats.total}</span>
          </p>
          <p className="text-xs opacity-80">{stats.percent}% 完成</p>
        </div>
        <div className="card !p-5 !rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span className="text-xs text-slate-400">待补充</span>
          </div>
          <p className="font-display text-3xl font-bold text-amber-600">
            {stats.unpacked + stats.insufficient.length}
          </p>
          <p className="text-xs text-slate-500">未达建议数量</p>
        </div>
        <div className="card !p-5 !rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-xs text-slate-400">过期药</span>
          </div>
          <p
            className={clsx(
              'font-display text-3xl font-bold',
              stats.expiredItems.length > 0 ? 'text-red-600' : 'text-emerald-500'
            )}
          >
            {stats.expiredItems.length}
          </p>
          <p className="text-xs text-slate-500">
            {stats.expiredItems.length > 0 ? '请及时更换！' : '清单无过期药'}
          </p>
        </div>
        <div className="card !p-5 !rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart size={18} className="text-blue-500" />
            <span className="text-xs text-slate-400">需补货</span>
          </div>
          <p className="font-display text-3xl font-bold text-blue-600">
            {restockList.reduce((s, r) => s + r.qty, 0)}
          </p>
          <p className="text-xs text-slate-500">{restockList.length} 种药品</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">⚠️ 还差这些药</h3>
              <p className="text-xs text-slate-500">
                未打包 / 数量不足 / 已过期的药品项
              </p>
            </div>
            <Badge variant="warning">
              {stats.missing.length + stats.insufficient.length + stats.expiredItems.length} 项
            </Badge>
          </div>

          {stats.missing.length + stats.insufficient.length + stats.expiredItems.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-700 font-medium">太棒了！清单一切就绪</p>
              <p className="text-xs text-slate-500 mt-1">没有需要补充的药品</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
              {stats.expiredItems.map((ti) => {
                const m = medicines.find((x) => x.id === ti.medicineId);
                return (
                  <div
                    key={ti.id}
                    className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"
                  >
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-800">{m?.name}</p>
                      <p className="text-xs text-red-600">❌ 已过期，请购买新药</p>
                    </div>
                  </div>
                );
              })}
              {stats.missing.map((ti) => {
                const m = medicines.find((x) => x.id === ti.medicineId);
                const cat = m ? CATEGORY_LABELS[m.category] : null;
                return (
                  <div
                    key={ti.id}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3"
                  >
                    <X size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{m?.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        {cat && <span className="text-amber-700">{cat.label}</span>}
                        <span>建议 {ti.suggestedQuantity} 份，未打包</span>
                      </p>
                    </div>
                    <Badge variant="warning">未打包</Badge>
                  </div>
                );
              })}
              {stats.insufficient.map((ti) => {
                const m = medicines.find((x) => x.id === ti.medicineId);
                return (
                  <div
                    key={ti.id}
                    className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3"
                  >
                    <AlertTriangle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{m?.name}</p>
                      <p className="text-xs text-slate-500">
                        建议 {ti.suggestedQuantity} 份，已打包{' '}
                        <span className="font-bold text-blue-700">{ti.packedQuantity}</span> 份，还差{' '}
                        <span className="font-bold text-blue-700">
                          {ti.suggestedQuantity - ti.packedQuantity}
                        </span>{' '}
                        份
                      </p>
                    </div>
                    <Badge variant="info">数量不足</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Users size={18} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">👥 个人专用药检查</h3>
              <p className="text-xs text-slate-500">每位同行人的健康保障确认</p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {personalCheck.length === 0 ? (
              <EmptyState icon={<Users size={28} />} title="无同行人" description="请返回添加同行人" />
            ) : (
              personalCheck.map((pc) => (
                <div
                  key={pc.member.id}
                  className={clsx(
                    'p-3 rounded-xl border',
                    pc.missing.length > 0
                      ? 'bg-red-50/50 border-red-100'
                      : 'bg-emerald-50/50 border-emerald-100'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                        pc.member.gender === 'male'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-700'
                      )}
                    >
                      {pc.member.name.slice(0, 1)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{pc.member.name}</p>
                      <p className="text-xs text-slate-500">
                        {pc.member.relation} · {pc.member.age}岁
                      </p>
                    </div>
                    {pc.missing.length > 0 ? (
                      <Badge variant="danger">{pc.missing.length} 项缺失</Badge>
                    ) : (
                      <Badge variant="success">
                        <CheckCircle2 size={10} /> 齐全
                      </Badge>
                    )}
                  </div>
                  {pc.all.length === 0 ? (
                    <p className="text-xs text-slate-400 pl-10">暂无关联药品</p>
                  ) : (
                    <div className="space-y-1 pl-10">
                      {pc.all.map((item) => {
                        const m = item.med;
                        if (!m) return null;
                        const isExp = isExpired(m);
                        const isPacked = item.item?.isPacked;
                        return (
                          <div
                            key={item.id + (item.isDedicated ? '-d' : '')}
                            className="flex items-center gap-2 text-xs"
                          >
                            {isExp ? (
                              <AlertCircle size={12} className="text-red-500" />
                            ) : isPacked ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : (
                              <X size={12} className="text-amber-500" />
                            )}
                            <span
                              className={clsx(
                                'flex-1',
                                isExp
                                  ? 'text-red-700 line-through'
                                  : isPacked
                                  ? 'text-slate-700'
                                  : 'text-amber-700 font-medium'
                              )}
                            >
                              {m.name}
                              {item.isDedicated && (
                                <span className="ml-1 text-[10px] px-1 rounded bg-violet-100 text-violet-700">
                                  专用
                                </span>
                              )}
                            </span>
                            <span className="text-slate-400">
                              {item.item?.packedQuantity || 0}/
                              {item.item?.suggestedQuantity} 份
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShoppingCart size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              🛒 回家后补货清单
              <Badge variant="info">{restockList.length} 种</Badge>
            </h3>
            <p className="text-xs text-slate-500">
              按旅行消耗、库存余量、过期情况自动生成，共需{' '}
              <span className="font-bold text-blue-600">
                {restockList.reduce((s, r) => s + r.qty, 0)}
              </span>{' '}
              份
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 size={14} />}
            onClick={handleApplyRestock}
            disabled={restockList.length === 0}
          >
            一键补货
          </Button>
        </div>

        {restockList.length === 0 ? (
          <div className="py-10 text-center">
            <Pill size={36} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-700 font-medium">库存充足，无需补货</p>
            <p className="text-xs text-slate-500 mt-1">所有药品状态良好，旅途无忧！</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">药品名称</th>
                  <th className="pb-3 font-medium">分类</th>
                  <th className="pb-3 font-medium">当前库存</th>
                  <th className="pb-3 font-medium">补货数量</th>
                  <th className="pb-3 font-medium">原因</th>
                  <th className="pb-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {restockList.map((r) => {
                  const cat = CATEGORY_LABELS[r.medicine.category];
                  const exp = isExpired(r.medicine);
                  const soon = isExpiringSoon(r.medicine);
                  return (
                    <tr key={r.medicine.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{r.medicine.name}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={clsx(
                            'badge border text-[10px]',
                            cat?.color || 'bg-slate-50 text-slate-600 border-slate-200'
                          )}
                        >
                          {cat?.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={clsx(
                            r.medicine.stockQuantity <= 2
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-700'
                          )}
                        >
                          {r.medicine.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-display font-bold text-xl text-blue-600">
                          ×{r.qty}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{r.reason}</td>
                      <td className="py-3">
                        {exp ? (
                          <Badge variant="danger">过期</Badge>
                        ) : soon ? (
                          <Badge variant="warning">临期</Badge>
                        ) : r.medicine.stockQuantity <= 2 ? (
                          <Badge variant="info">低库存</Badge>
                        ) : (
                          <Badge variant="success">正常</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
