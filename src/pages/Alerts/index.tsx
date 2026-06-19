import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, CheckCheck, XCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Alert, AlertStatus, ALERT_TYPE_LABELS, ALERT_LEVEL_LABELS, ALERT_LEVEL_COLORS } from '@/types';

type FilterTab = 'all' | 'unread' | 'handled' | 'ignored';

const LEVEL_PRIORITY: Record<string, number> = {
  danger: 0,
  warning: 1,
  normal: 2,
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'handled', label: '已处理' },
  { key: 'ignored', label: '已忽略' },
];

export default function Alerts() {
  const navigate = useNavigate();
  const alerts = useStore((state) => state.alerts);
  const markAlertRead = useStore((state) => state.markAlertRead);
  const markAlertHandled = useStore((state) => state.markAlertHandled);
  const markAlertIgnored = useStore((state) => state.markAlertIgnored);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const sortedAndFilteredAlerts = useMemo(() => {
    let filtered: Alert[] = [...alerts];

    if (activeTab === 'unread') {
      filtered = filtered.filter((a) => a.status === 'unread' || a.status === 'read');
    } else if (activeTab === 'handled') {
      filtered = filtered.filter((a) => a.status === 'handled');
    } else if (activeTab === 'ignored') {
      filtered = filtered.filter((a) => a.status === 'ignored');
    }

    filtered.sort((a, b) => {
      const levelDiff = LEVEL_PRIORITY[a.level] - LEVEL_PRIORITY[b.level];
      if (levelDiff !== 0) return levelDiff;
      return a.createdAt < b.createdAt ? 1 : -1;
    });

    return filtered;
  }, [alerts, activeTab]);

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'unread':
        return <span className="inline-block w-2 h-2 rounded-full bg-danger-500" />;
      case 'read':
        return <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />;
      case 'handled':
        return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'ignored':
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">提醒中心</h1>
            </div>
          </div>

          <div className="flex gap-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-3">
        {sortedAndFilteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无提醒</p>
          </div>
        ) : (
          sortedAndFilteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                alert.status === 'unread' ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ALERT_LEVEL_COLORS[alert.level]}`}
                  >
                    {ALERT_LEVEL_LABELS[alert.level]}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {ALERT_TYPE_LABELS[alert.type]}
                  </span>
                  {getStatusBadge(alert.status)}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{alert.createdAt}</span>
              </div>

              <h3 className="font-medium text-gray-900 mb-1.5">{alert.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{alert.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {alert.status !== 'read' && alert.status !== 'handled' && alert.status !== 'ignored' && (
                  <button
                    type="button"
                    onClick={() => markAlertRead(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    标记已读
                  </button>
                )}
                {alert.status !== 'handled' && (
                  <button
                    type="button"
                    onClick={() => markAlertHandled(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    标记已处理
                  </button>
                )}
                {alert.status !== 'ignored' && (
                  <button
                    type="button"
                    onClick={() => markAlertIgnored(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    忽略
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
