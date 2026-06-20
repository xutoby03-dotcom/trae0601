import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Calendar,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  MATERIAL_LABEL_MAP,
  CLEAN_METHOD_LABEL_MAP,
  CLEAN_ACTION_OPTIONS,
  DAMAGE_LABEL_MAP,
  MATERIAL_CLEAN_CYCLE,
  formatDateShort,
  formatDate,
  daysBetween,
} from '@/utils/constants';
import type { MaterialType } from '@/types';
import { cn } from '@/lib/utils';

const GRADIENT_MAP: Record<MaterialType, string> = {
  wood: 'from-woody-100 to-woody-200',
  plastic: 'from-clean-100 to-clean-200',
  silicone: 'from-baby-100 to-baby-200',
  plush: 'from-baby-50 to-baby-100',
  rubber: 'from-mint-100 to-mint-200',
  metal: 'from-gray-100 to-gray-200',
  cloth: 'from-woody-50 to-woody-100',
  other: 'from-gray-100 to-gray-200',
};

export default function ToyDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const toys = useAppStore((s) => s.toys);
  const cleaningRecords = useAppStore((s) => s.cleaningRecords);
  const alerts = useAppStore((s) => s.alerts);

  const deleteToy = useAppStore((s) => s.deleteToy);

  const toy = useMemo(() => (id ? toys.find(t => t.id === id) : undefined), [toys, id]);
  const records = useMemo(() => {
    if (!id) return [];
    return cleaningRecords
      .filter(r => r.toyId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cleaningRecords, id]);
  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'pending' && a.toyId === id).map(a => ({ ...a, toy })),
    [alerts, id, toy],
  );

  const handleDelete = () => {
    if (toy && confirm(`确定要删除玩具"${toy.name}"吗？相关的清洁记录和异常提醒也会被删除。`)) {
      deleteToy(toy.id);
      navigate('/toys');
    }
  };

  if (!toy) {
    return (
      <div className="card-base p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">玩具不存在</h3>
        <p className="text-gray-500 mb-6">该玩具可能已被删除，或者链接有误</p>
        <Link to="/toys" className="btn-primary">
          回到玩具列表
        </Link>
      </div>
    );
  }

  const materialInfo = MATERIAL_LABEL_MAP.get(toy.material);
  const cleanInfo = CLEAN_METHOD_LABEL_MAP.get(toy.cleanMethod);
  const gradient = GRADIENT_MAP[toy.material];

  const lastCleanDate = records.length > 0 ? records[0].date : null;
  const daysSinceLast = lastCleanDate ? daysBetween(lastCleanDate) : null;
  const recommendedCycle = MATERIAL_CLEAN_CYCLE[toy.material] || 5;
  const isOverdue = daysSinceLast !== null && daysSinceLast >= recommendedCycle;

  return (
    <div className="space-y-6">
      <div className="card-base p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/toys"
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{toy.name}</h1>
            <p className="text-sm text-gray-500">玩具详情 · 清洁记录</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/cleaning/new?toyId=${toy.id}`} className="btn-secondary text-sm">
            <PlayCircle className="w-4 h-4" />
            记录清洁
          </Link>
          <Link to={`/toys/${toy.id}/edit`} className="btn-ghost text-sm">
            <Pencil className="w-4 h-4" />
            编辑
          </Link>
          <button type="button" onClick={handleDelete} className="btn-danger text-sm">
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card-base overflow-hidden h-full">
            <div
              className={cn(
                'relative h-56 md:h-64 flex items-center justify-center bg-gradient-to-br',
                gradient,
              )}
            >
              {toy.photo ? (
                <img
                  src={toy.photo}
                  alt={toy.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl drop-shadow-sm">
                  {materialInfo?.icon || '📦'}
                </span>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{toy.name}</h2>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-lg">{materialInfo?.icon}</span>
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">材质</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {materialInfo?.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-clean-50 flex items-center justify-center shrink-0">
                    <span className="text-lg">👶</span>
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">适用年龄</p>
                    <p className="text-sm font-semibold text-gray-700">{toy.ageRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-mint-50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-mint-500" />
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">清洁方式</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {cleanInfo?.icon} {cleanInfo?.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{cleanInfo?.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-woody-50 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-woody-500" />
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">收纳位置</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {toy.storageLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-baby-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-baby-500" />
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">购买日期</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatDateShort(toy.purchaseDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      isOverdue ? 'bg-alert-50' : 'bg-mint-50',
                    )}
                  >
                    <Clock
                      className={cn(
                        'w-4 h-4',
                        isOverdue ? 'text-alert-400' : 'text-mint-500',
                      )}
                    />
                  </span>
                  <div>
                    <p className="text-xs text-gray-400">上次清洁</p>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isOverdue ? 'text-alert-400' : 'text-gray-700',
                      )}
                    >
                      {lastCleanDate
                        ? `${formatDateShort(lastCleanDate)}（${daysSinceLast}天前）`
                        : '暂无记录'}
                    </p>
                    {lastCleanDate && isOverdue && (
                      <p className="text-xs text-alert-400 mt-0.5">
                        ⚠️ 已超过建议清洁周期（{recommendedCycle}天）
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeAlerts.length > 0 && (
            <div className="card-base p-5 border-2 border-alert-200 shadow-glow-red animate-pulse-glow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-alert-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-alert-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-alert-500 mb-1">
                    ⚠️ 存在待处理的异常提醒（{activeAlerts.length}条）
                  </h3>
                  <div className="space-y-2 mt-3">
                    {activeAlerts.map((alert) => {
                      const dmg = DAMAGE_LABEL_MAP.get(alert.type);
                      return (
                        <div
                          key={alert.id}
                          className="p-3 rounded-xl bg-alert-50 border border-alert-100"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{dmg?.icon}</span>
                            <span className="font-semibold text-alert-500">
                              {dmg?.label}
                            </span>
                            <span className="text-xs text-alert-400 ml-auto">
                              {formatDateShort(alert.createdAt)}
                            </span>
                          </div>
                          {alert.notes && (
                            <p className="text-sm text-alert-400 ml-7">{alert.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card-base p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-mint-300 to-mint-400" />
                  清洁历史时间线
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-3.5">
                  共 {records.length} 条清洁记录
                </p>
              </div>
              <Link
                to={`/cleaning/new?toyId=${toy.id}`}
                className="btn-primary text-sm whitespace-nowrap self-start sm:self-auto"
              >
                <PlayCircle className="w-4 h-4" />
                记录本次清洁
              </Link>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🧽</div>
                <p className="text-gray-500 mb-4">还没有清洁记录</p>
                <Link
                  to={`/cleaning/new?toyId=${toy.id}`}
                  className="btn-secondary text-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  记录第一次清洁
                </Link>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-baby-200 via-mint-200 to-clean-200 rounded-full" />
                <div className="space-y-5">
                  {records.map((record, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={record.id} className="relative">
                        <div
                          className={cn(
                            'absolute -left-[26px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center',
                            isLatest
                              ? 'bg-baby-300 border-baby-100 shadow-soft'
                              : 'bg-white border-gray-200',
                          )}
                        >
                          {record.hasDamage ? (
                            <XCircle className="w-2.5 h-2.5 text-alert-400" />
                          ) : (
                            <CheckCircle className="w-2.5 h-2.5 text-mint-500" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'p-4 rounded-2xl border transition-all',
                            record.hasDamage
                              ? 'border-alert-200 bg-alert-50/60'
                              : 'border-gray-100 bg-gray-50/60 hover:border-baby-200 hover:bg-baby-50/40',
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <p
                                className={cn(
                                  'font-bold',
                                  record.hasDamage ? 'text-alert-500' : 'text-gray-800',
                                )}
                              >
                                {formatDate(record.date)}
                              </p>
                              {isLatest && (
                                <span className="tag bg-baby-100 text-baby-500 mt-1">
                                  最近一次
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {record.methods.length > 0 ? (
                                record.methods.map((m) => {
                                  const action = CLEAN_ACTION_OPTIONS.find(
                                    (o) => o.value === m,
                                  );
                                  return (
                                    <span
                                      key={m}
                                      className={cn('tag', action?.color)}
                                    >
                                      {action?.icon} {action?.label}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="tag bg-gray-100 text-gray-500">
                                  未记录方式
                                </span>
                              )}
                            </div>
                          </div>
                          {(record.hasDamage ||
                            record.hasOdor ||
                            record.damageType ||
                            record.notes) && (
                            <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 space-y-1.5">
                              {record.hasDamage && record.damageType && (
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-alert-400 mt-0.5 shrink-0" />
                                  <span className="text-sm text-alert-500 font-medium">
                                    发现异常：
                                    {DAMAGE_LABEL_MAP.get(record.damageType)?.label ||
                                      record.damageType}
                                  </span>
                                </div>
                              )}
                              {record.hasOdor && !record.hasDamage && (
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                  <span className="text-sm text-amber-600 font-medium">
                                    有异味需要注意
                                  </span>
                                </div>
                              )}
                              {record.notes && (
                                <p className="text-sm text-gray-500 pl-6">
                                  💬 {record.notes}
                                </p>
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
        </div>
      </div>
    </div>
  );
}
