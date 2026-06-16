import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cable, Users, Clock, AlertTriangle, ArrowRight, BarChart3, Package, History } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/components/common/StatCard';
import { AlertCard } from '@/components/common/AlertCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Layout } from '@/components/layout/Layout';
import { formatDateTime } from '@/utils/dateUtils';
import { INTERFACE_TYPE_LABELS } from '@/types';

export default function Home() {
  const { initApp, getStatistics, alerts, borrowRecords, cables, currentUser, isLoading } = useAppStore();
  const [stats, setStats] = useState<ReturnType<typeof getStatistics> | null>(null);

  useEffect(() => {
    const init = async () => {
      await initApp();
      setStats(getStatistics());
    };
    init();
  }, [initApp, getStatistics]);

  const unreadAlerts = alerts.filter(a => !a.isRead).slice(0, 5);
  const recentRecords = [...borrowRecords]
    .sort((a, b) => b.borrowTime.localeCompare(a.borrowTime))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              欢迎回来，{currentUser?.name || '访客'}
            </h1>
            <p className="text-gray-500 mt-1">共享充电线管理系统</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/borrow"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Package className="w-4 h-4" />
              立即借用
            </Link>
            <Link
              to="/return"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4" />
              归还登记
            </Link>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="线材总数"
              value={stats.totalCables}
              icon={Cable}
              color="blue"
              suffix="条"
            />
            <StatCard
              title="可借数量"
              value={stats.availableCables}
              icon={Package}
              color="green"
              suffix="条"
            />
            <StatCard
              title="借用中"
              value={stats.borrowedCables}
              icon={Users}
              color="orange"
              suffix="条"
            />
            <StatCard
              title="逾期未还"
              value={stats.overdueCount}
              icon={Clock}
              color="red"
              suffix="条"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">智能提醒</h2>
              <Link
                to="/statistics"
                className="text-sm text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {unreadAlerts.length > 0 ? (
              <div className="space-y-3">
                {unreadAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-600 font-medium">暂无待处理提醒</p>
                <p className="text-gray-400 text-sm mt-1">系统运行正常</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">最近借用</h2>
              <Link
                to="/my-borrow"
                className="text-sm text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
              >
                我的记录
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {recentRecords.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentRecords.map(record => {
                    const cable = cables.find(c => c.id === record.cableId);
                    return (
                      <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {record.employeeName}
                          </span>
                          <StatusBadge type="borrow" status={record.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            {cable ? INTERFACE_TYPE_LABELS[cable.interfaceType] : '-'}
                          </span>
                          <span>{cable?.code || '-'}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(record.borrowTime)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">暂无借用记录</p>
                </div>
              )}
            </div>

            {stats && stats.interfaceStock.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  接口库存
                </h3>
                <div className="space-y-3">
                  {stats.interfaceStock.map(item => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className="text-gray-600">
                            {INTERFACE_TYPE_LABELS[item.type]}
                          </span>
                          {item.available === 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">断货</span>
                          )}
                        </span>
                        <span className={item.available < item.safeStock ? 'text-red-500 font-medium' : 'text-gray-900'}>
                          {item.available}/{item.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.available === 0 ? 'bg-red-600' :
                            item.available < item.safeStock ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${item.total > 0 ? (item.available / item.total) * 100 : 0}%` }}
                        />
                      </div>
                      {item.available === 0 && (
                        <p className="text-xs text-red-600 font-medium mt-1">⚠️ 已完全断货，请紧急补货</p>
                      )}
                      {item.available > 0 && item.available < item.safeStock && (
                        <p className="text-xs text-red-500 mt-1">库存不足，建议补货</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
