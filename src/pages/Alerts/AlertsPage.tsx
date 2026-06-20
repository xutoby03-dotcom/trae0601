import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  ALERT_STATUS_COLORS,
  ALERT_STATUS_LABEL,
  DAMAGE_LABEL_MAP,
  formatDateShort,
  MATERIAL_LABEL_MAP,
} from '@/utils/constants';
import type { AlertStatus, DamageType, AlertItem, Toy, CleaningRecord } from '@/types';

const filterTabs: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'resolved', label: '已处理' },
  { value: 'disabled', label: '已停用' },
];

const damageWarnings: Record<DamageType, string> = {
  peeling: '油漆被孩子误食风险',
  loose: '小零件脱落误食窒息风险',
  mold: '霉菌导致过敏/感染风险',
  crack: '破损划伤孩子皮肤风险',
  other: '存在未知安全隐患',
};

type AlertWithRelations = AlertItem & { toy: Toy; record?: CleaningRecord };

export default function AlertsPage() {
  const { alerts, toys, cleaningRecords, updateAlertStatus } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<AlertStatus | 'all'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const disabledCount = alerts.filter(a => a.status === 'disabled').length;

  const alertsWithRelations: AlertWithRelations[] = useMemo(() => {
    const result: AlertWithRelations[] = [];
    for (const alert of alerts) {
      const toy = toys.find(t => t.id === alert.toyId);
      if (!toy) continue;
      const record = cleaningRecords.find(r => r.id === alert.recordId);
      result.push({ ...alert, toy, record });
    }
    return result.sort((a, b) => {
      if (a.status !== b.status) {
        const order: Record<AlertStatus, number> = { pending: 0, resolved: 1, disabled: 2 };
        return order[a.status] - order[b.status];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, toys, cleaningRecords]);

  const filteredAlerts = activeFilter === 'all'
    ? alertsWithRelations
    : alertsWithRelations.filter(a => a.status === activeFilter);

  const handleAction = async (alertId: string, status: AlertStatus) => {
    setProcessingId(alertId);
    await new Promise(r => setTimeout(r, 300));
    updateAlertStatus(alertId, status);
    setProcessingId(null);
  };

  const getCardBorderClass = (status: AlertStatus) => {
    if (status === 'pending') return 'border-2 border-alert-200 animate-pulse-glow';
    if (status === 'resolved') return 'border-2 border-mint-200';
    return 'border-2 border-gray-200';
  };

  const getTopIconBg = (status: AlertStatus) => {
    if (status === 'pending') return 'bg-gradient-to-br from-alert-400 to-alert-300';
    if (status === 'resolved') return 'bg-gradient-to-br from-mint-400 to-mint-300';
    return 'bg-gradient-to-br from-gray-400 to-gray-300';
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 font-display mb-2">
          异常预警中心 ⚠️
        </h1>
        <p className="text-gray-500 text-lg">及时发现玩具安全隐患，守护宝宝健康</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-base p-5 text-center border-2 border-alert-100 bg-gradient-to-br from-alert-50 to-white">
          <div className="text-5xl md:text-6xl font-extrabold text-alert-400 font-display mb-1">
            {pendingCount}
          </div>
          <div className="text-sm font-semibold text-gray-600">待处理</div>
        </div>
        <div className="card-base p-5 text-center">
          <div className="text-5xl md:text-6xl font-extrabold text-mint-500 font-display mb-1">
            {resolvedCount}
          </div>
          <div className="text-sm font-semibold text-gray-600">已处理</div>
        </div>
        <div className="card-base p-5 text-center">
          <div className="text-5xl md:text-6xl font-extrabold text-gray-400 font-display mb-1">
            {disabledCount}
          </div>
          <div className="text-sm font-semibold text-gray-600">已停用</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`chip-select ${activeFilter === tab.value ? 'active' : ''} ${
              tab.value === 'pending' && activeFilter !== tab.value ? '!text-alert-400' : ''
            }`}
          >
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              tab.value === 'all' ? 'bg-gray-200 text-gray-600' :
              tab.value === 'pending' ? 'bg-alert-100 text-alert-400' :
              tab.value === 'resolved' ? 'bg-mint-100 text-mint-500' :
              'bg-gray-200 text-gray-500'
            }`}>
              {tab.value === 'all' ? alerts.length :
               tab.value === 'pending' ? pendingCount :
               tab.value === 'resolved' ? resolvedCount : disabledCount}
            </span>
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="card-base p-16 text-center">
          <div className="text-7xl mb-4 animate-bounce-soft">✅</div>
          <p className="text-2xl font-bold text-gray-700 mb-2">没有异常预警，一切安好！</p>
          <p className="text-gray-500">宝宝的玩具都很安全，继续保持哦～</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredAlerts.map((alert, idx) => {
            const damageMeta = DAMAGE_LABEL_MAP.get(alert.type);
            const materialMeta = MATERIAL_LABEL_MAP.get(alert.toy.material);
            const isPending = alert.status === 'pending';
            const isProcessing = processingId === alert.id;

            return (
              <div
                key={alert.id}
                className={`card-base overflow-hidden ${getCardBorderClass(alert.status)} animate-fade-in-up`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className={`${getTopIconBg(alert.status)} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">⚠️</div>
                    <div>
                      <div className="text-white text-lg font-bold flex items-center gap-2">
                        {damageMeta?.icon} {damageMeta?.label}
                      </div>
                      <div className="text-white/80 text-xs">
                        {formatDateShort(alert.createdAt)} 发现
                      </div>
                    </div>
                  </div>
                  <span className={`tag bg-white/90 ${ALERT_STATUS_COLORS[alert.status].includes('alert') ? 'text-alert-400' : ALERT_STATUS_COLORS[alert.status].includes('mint') ? 'text-mint-500' : 'text-gray-500'}`}>
                    {ALERT_STATUS_LABEL[alert.status]}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-baby-100 to-mint-100 flex items-center justify-center text-3xl shrink-0">
                      🧸
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-lg mb-1 hover:text-baby-500 transition-colors cursor-pointer">
                        {alert.toy.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {materialMeta && (
                          <span className={`tag ${materialMeta.color}`}>
                            {materialMeta.icon} {materialMeta.label}
                          </span>
                        )}
                        <span className="tag bg-gray-200 text-gray-600">
                          📍 {alert.toy.storageLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {alert.record?.notes && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="text-xs font-semibold text-amber-600 mb-1">📝 检查记录</div>
                      <div className="text-sm text-gray-700">{alert.record.notes}</div>
                    </div>
                  )}

                  {isPending && (
                    <div className="mb-4 p-3 bg-alert-50 border border-alert-100 rounded-xl flex items-start gap-2">
                      <span className="text-xl shrink-0">🚨</span>
                      <div>
                        <div className="text-sm font-semibold text-alert-400 mb-0.5">安全警告</div>
                        <div className="text-sm text-gray-700">
                          {damageWarnings[alert.type]}，建议立即停止使用
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPending && alert.resolvedAt && (
                    <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 ${
                      alert.status === 'resolved'
                        ? 'bg-mint-50 border border-mint-100'
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <span className="text-xl shrink-0">
                        {alert.status === 'resolved' ? '✅' : '🚫'}
                      </span>
                      <div>
                        <div className={`text-sm font-semibold mb-0.5 ${
                          alert.status === 'resolved' ? 'text-mint-500' : 'text-gray-500'
                        }`}>
                          {alert.status === 'resolved' ? '修复完成' : '已停用'}
                        </div>
                        <div className="text-sm text-gray-600">
                          处理时间：{formatDateShort(alert.resolvedAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(alert.id, 'resolved')}
                        disabled={isProcessing}
                        className="flex-1 btn-secondary disabled:opacity-50"
                      >
                        🔧 标记已修复
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'disabled')}
                        disabled={isProcessing}
                        className="flex-1 btn-danger disabled:opacity-50"
                      >
                        🚫 停用此玩具
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
