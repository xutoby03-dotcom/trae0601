import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  User as UserIcon,
  AlertCircle,
  AlertTriangle,
  TrendingDown,
  Plus as PlusIcon,
  Minus,
  Package,
  Calendar,
  Users,
  BarChart3,
  Trash,
  Pill,
  Clock,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORY_LABELS } from '@/types';
import { formatDate } from '@/utils/date';
import { isExpired, getMedicineStatus, getStatusColor } from '@/utils/medicine';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { StatusTag } from '@/components/common/StatusTag';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { clsx } from 'clsx';
import type { TripItem, TripStatus } from '@/types';

export default function PackingList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    trips,
    medicines,
    familyMembers,
    tripItems,
    updateTrip,
    setTripStatus,
    togglePacked,
    setPackedQuantity,
    setPackedBy,
    deleteTripItem,
    addTripItem,
    addConsumption,
    removeConsumption,
  } = useAppStore();

  const trip = trips.find((t) => t.id === id);
  const items = tripItems.filter((ti) => ti.tripId === id);
  const companions = familyMembers.filter((fm) =>
    trip?.companionIds.includes(fm.id) || false
  );

  const [filter, setFilter] = useState<'all' | 'packed' | 'unpacked'>('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [consumptionTarget, setConsumptionTarget] = useState<TripItem | null>(null);
  const [consumptionForm, setConsumptionForm] = useState({
    type: 'used' as 'used' | 'lost',
    quantity: 1,
    note: '',
  });

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter((i) => i.isPacked).length;
    const percent = total > 0 ? Math.round((packed / total) * 100) : 0;
    const expiredCount = items.filter((ti) => {
      const m = medicines.find((x) => x.id === ti.medicineId);
      return m && isExpired(m);
    }).length;
    const totalConsumed = items.reduce((s, i) => s + i.consumedQuantity, 0);
    return { total, packed, percent, expiredCount, totalConsumed };
  }, [items, medicines]);

  const filteredItems = useMemo(() => {
    return items
      .filter((ti) => {
        if (filter === 'packed') return ti.isPacked;
        if (filter === 'unpacked') return !ti.isPacked;
        return true;
      })
      .sort((a, b) => {
        if (a.isPacked !== b.isPacked) return a.isPacked ? 1 : -1;
        return 0;
      });
  }, [items, filter]);

  const availableMeds = useMemo(() => {
    const added = new Set(items.map((i) => i.medicineId));
    return medicines.filter((m) => !added.has(m.id));
  }, [medicines, items]);

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

  const statusLabels: Record<TripStatus, { label: string; cls: string }> = {
    planning: { label: '规划中', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
    ongoing: { label: '旅行中', cls: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse-soft' },
    completed: { label: '已结束', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const handleSubmitConsumption = () => {
    if (!consumptionTarget) return;
    addConsumption(consumptionTarget.id, { ...consumptionForm });
    setConsumptionTarget(null);
    setConsumptionForm({ type: 'used', quantity: 1, note: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/trips')}
          className="p-2 rounded-xl text-slate-500 hover:bg-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-2xl font-bold text-slate-900 truncate">
              {trip.destination}
            </h2>
            <Badge variant="default" className={clsx('border', statusLabels[trip.status].cls)}>
              {statusLabels[trip.status].label}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-3 flex-wrap mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(trip.startDate)} · {trip.days}天
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} /> {companions.map((c) => c.name).join('、')}
            </span>
          </p>
        </div>
        <Link to={`/trips/${trip.id}/summary`}>
          <Button variant="secondary" leftIcon={<BarChart3 size={16} />}>
            汇总统计
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card !p-4 !rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">药品项数</p>
          <p className="font-display text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="card !p-4 !rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">打包进度</p>
          <p className="font-display text-2xl font-bold text-brand-600">
            {stats.packed}/{stats.total}
            <span className="text-sm text-slate-400 ml-1">{stats.percent}%</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
        <div className="card !p-4 !rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">已消耗</p>
          <p className="font-display text-2xl font-bold text-amber-600">
            {stats.totalConsumed}
          </p>
        </div>
        <div className="card !p-4 !rounded-2xl">
          <p className="text-xs text-slate-500 mb-1">问题提醒</p>
          <p
            className={clsx(
              'font-display text-2xl font-bold',
              stats.expiredCount > 0 ? 'text-red-600' : 'text-emerald-600'
            )}
          >
            {stats.expiredCount > 0 ? `${stats.expiredCount} 项过期` : '一切正常'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[
            { k: 'all', label: '全部', count: items.length },
            { k: 'unpacked', label: '待打包', count: items.filter((i) => !i.isPacked).length },
            { k: 'packed', label: '已打包', count: items.filter((i) => i.isPacked).length },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k as any)}
              className={clsx(
                'chip-outline !text-sm',
                filter === f.k && 'chip-active'
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="input-field !w-auto !py-2"
            value={trip.status}
            onChange={(e) => setTripStatus(trip.id, e.target.value as TripStatus)}
          >
            <option value="planning">状态：规划中</option>
            <option value="ongoing">状态：旅行中</option>
            <option value="completed">状态：已结束</option>
          </select>
          <Button leftIcon={<Plus size={16} />} onClick={() => setShowAddItem(true)}>
            添加药品
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="清单为空"
          description={
            items.length === 0
              ? '点击「添加药品」手动加入清单，或在新建旅行时让系统推荐'
              : '没有符合筛选条件的药品项'
          }
          action={
            items.length === 0 && (
              <Button leftIcon={<Plus size={18} />} onClick={() => setShowAddItem(true)}>
                添加第一个药品
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((ti, idx) => {
            const med = medicines.find((m) => m.id === ti.medicineId);
            if (!med) return null;
            const cat = CATEGORY_LABELS[med.category];
            const expired = isExpired(med);
            const status = getMedicineStatus(med);
            const sc = getStatusColor(status);
            const packedByMember = familyMembers.find((fm) => fm.id === ti.packedBy);
            const availableStock = med.stockQuantity;

            return (
              <div
                key={ti.id}
                className={clsx(
                  'card !p-4 !rounded-2xl transition-all animate-fade-in-up',
                  ti.isPacked && !expired && 'bg-emerald-50/40 border-emerald-100',
                  expired && 'bg-red-50/40 border-red-200',
                  !expired && !ti.isPacked && 'card-hover'
                )}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <button
                      disabled={expired}
                      onClick={() => !expired && togglePacked(ti.id)}
                      className={clsx(
                        'w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all',
                        expired
                          ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                          : ti.isPacked
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200/50 scale-105'
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                      )}
                    >
                      {ti.isPacked && <Check size={16} strokeWidth={3} />}
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2 flex-wrap">
                      <h3
                        className={clsx(
                          'font-bold text-lg',
                          ti.isPacked && !expired && 'line-through text-slate-500',
                          expired && 'text-red-700',
                          !ti.isPacked && !expired && 'text-slate-900'
                        )}
                      >
                        {med.name}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="default" className={clsx('border', cat.color)}>
                          {cat.label}
                        </Badge>
                        {expired ? (
                          <Badge variant="danger" icon={<AlertCircle size={10} />}>
                            已过期，禁止打包
                          </Badge>
                        ) : (
                          status !== 'normal' && <StatusTag medicine={med} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 mb-3">
                      <span>💊 {med.dosage || '暂无用法说明'}</span>
                      <span>
                        📍 {med.storageLocation || '未指定位置'}
                      </span>
                      <span>
                        📅 有效期至 {formatDate(med.expiryDate)}
                      </span>
                      <span
                        className={clsx(
                          sc.text,
                          'font-semibold'
                        )}
                      >
                        库存 {availableStock} 份
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                          <TrendingDown size={11} /> 建议数量
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="text-base font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl">
                            {ti.suggestedQuantity}
                          </div>
                          <span className="text-xs text-slate-400">份</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                          <Package size={11} /> 实际打包
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={expired}
                            onClick={() =>
                              setPackedQuantity(ti.id, Math.max(0, ti.packedQuantity - 1))
                            }
                            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={0}
                            disabled={expired}
                            value={ti.packedQuantity}
                            onChange={(e) =>
                              setPackedQuantity(ti.id, Math.max(0, Number(e.target.value)))
                            }
                            className="w-14 h-8 text-center rounded-xl border-2 border-slate-100 focus:border-brand-300 focus:outline-none font-bold disabled:bg-slate-50"
                          />
                          <button
                            disabled={expired}
                            onClick={() => setPackedQuantity(ti.id, ti.packedQuantity + 1)}
                            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon size={14} />
                          </button>
                          <span className="text-xs text-slate-400">份</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                          <UserIcon size={11} /> 负责人
                        </p>
                        <select
                          disabled={expired}
                          value={ti.packedBy}
                          onChange={(e) => setPackedBy(ti.id, e.target.value)}
                          className="input-field !py-1.5 !text-xs !px-3 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        >
                          <option value="">请选择...</option>
                          {companions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {packedByMember && (
                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <Badge variant="brand" icon={<UserIcon size={10} />}>
                          {packedByMember.name} 负责
                        </Badge>
                        {ti.consumedQuantity > 0 && (
                          <Badge variant="warning">已消耗 {ti.consumedQuantity} 份</Badge>
                        )}
                        <div className="flex-1" />
                        <button
                          onClick={() => {
                            setConsumptionTarget(ti);
                            setConsumptionForm({ type: 'used', quantity: 1, note: '' });
                          }}
                          className="text-xs text-slate-500 hover:text-brand-600 transition flex items-center gap-1"
                        >
                          <Clock size={12} /> 登记消耗
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定从清单中移除吗？')) deleteTripItem(ti.id);
                          }}
                          className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1"
                        >
                          <Trash size={12} /> 移除
                        </button>
                      </div>
                    )}

                    {ti.consumptionLog.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50/70 space-y-2">
                        <p className="text-xs font-semibold text-slate-600">消耗记录</p>
                        {ti.consumptionLog.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <Badge
                              variant={log.type === 'used' ? 'default' : 'danger'}
                              className="!text-[10px]"
                            >
                              {log.type === 'used' ? '已使用' : '遗失'}
                            </Badge>
                            <span className="font-semibold">{log.quantity} 份</span>
                            {log.note && <span>· {log.note}</span>}
                            <span className="text-slate-400 ml-auto">
                              {formatDate(log.timestamp, 'short')}
                            </span>
                            <button
                              onClick={() => removeConsumption(ti.id, log.id)}
                              className="text-slate-300 hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAddItem}
        onClose={() => setShowAddItem(false)}
        title="手动添加药品到清单"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {availableMeds.length === 0 ? (
            <p className="text-center py-8 text-slate-500">所有药品已在清单中</p>
          ) : (
            availableMeds.map((m) => {
              const cat = CATEGORY_LABELS[m.category];
              const expired = isExpired(m);
              return (
                <div
                  key={m.id}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-2xl border transition',
                    expired
                      ? 'bg-red-50/50 border-red-100'
                      : 'border-slate-100 hover:border-brand-200 hover:bg-brand-50/30'
                  )}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}
                  >
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={clsx(
                        'font-medium truncate',
                        expired ? 'text-red-700' : 'text-slate-900'
                      )}
                    >
                      {m.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {cat.label} · 库存 {m.stockQuantity}
                      {expired && <span className="text-red-600 ml-2">· 已过期</span>}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={expired ? 'ghost' : 'secondary'}
                    disabled={expired}
                    onClick={() => {
                      addTripItem(trip.id, {
                        medicineId: m.id,
                        suggestedQuantity: 1,
                        addedManually: true,
                      });
                      setShowAddItem(false);
                    }}
                  >
                    添加
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      <Modal
        open={!!consumptionTarget}
        onClose={() => setConsumptionTarget(null)}
        title="登记消耗 / 遗失"
      >
        <div className="space-y-4">
          {consumptionTarget && (
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Pill size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {medicines.find((m) => m.id === consumptionTarget?.medicineId)?.name}
                </p>
                <p className="text-xs text-slate-500">
                  已打包 {consumptionTarget.packedQuantity} 份，已消耗{' '}
                  {consumptionTarget.consumedQuantity} 份
                </p>
              </div>
            </div>
          )}
          <div>
            <label className="label">消耗类型</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { k: 'used', label: '已使用', icon: '💊', desc: '服用/使用了' },
                { k: 'lost', label: '遗失', icon: '❗', desc: '丢失/找不到了' },
              ] as const).map((opt) => (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() =>
                    setConsumptionForm((f) => ({ ...f, type: opt.k }))
                  }
                  className={clsx(
                    'p-3 rounded-2xl border-2 text-left transition',
                    consumptionForm.type === opt.k
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-100 hover:border-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span>{opt.icon}</span>
                    <span className="font-semibold text-slate-900">{opt.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">数量（份）</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setConsumptionForm((f) => ({
                    ...f,
                    quantity: Math.max(1, f.quantity - 1),
                  }))
                }
                className="w-10 h-10 rounded-2xl border-2 border-slate-100 text-slate-500 hover:border-brand-300 hover:text-brand-600 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={consumptionForm.quantity}
                onChange={(e) =>
                  setConsumptionForm((f) => ({
                    ...f,
                    quantity: Math.max(1, Number(e.target.value)),
                  }))
                }
                className="flex-1 input-field text-center text-xl font-bold"
              />
              <button
                type="button"
                onClick={() =>
                  setConsumptionForm((f) => ({ ...f, quantity: f.quantity + 1 }))
                }
                className="w-10 h-10 rounded-2xl border-2 border-slate-100 text-slate-500 hover:border-brand-300 hover:text-brand-600 font-bold"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              rows={2}
              className="input-field resize-none"
              placeholder="如：头痛服用了一粒..."
              value={consumptionForm.note}
              onChange={(e) =>
                setConsumptionForm((f) => ({ ...f, note: e.target.value }))
              }
            />
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
            <span>登记后将自动扣减药品库存，请确认数量正确。</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setConsumptionTarget(null)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmitConsumption}>
            确认登记
          </Button>
        </div>
      </Modal>
    </div>
  );
}
