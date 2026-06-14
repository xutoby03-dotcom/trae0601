import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  PackageOpen,
  ClipboardCheck,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import ColorBadge from '@/components/ColorBadge';
import { formatDateTime, getItemTypeLabel, getStatusLabel } from '@/utils';

export default function Dashboard() {
  const getDashboardStats = useAppStore((state) => state.getDashboardStats);
  const supplyItems = useAppStore((state) => state.supplyItems);
  const inspectionRecords = useAppStore((state) => state.inspectionRecords);
  const [stats, setStats] = useState({
    totalRooms: 0,
    pendingSupply: 0,
    todayInspections: 0,
    shortageAlerts: 0,
    inspectionCompletionRate: 0,
  });

  useEffect(() => {
    setStats(getDashboardStats());
  }, [getDashboardStats, supplyItems, inspectionRecords]);

  const pendingItems = supplyItems
    .filter((s) => s.status === 'pending')
    .sort((a, b) => {
      if (a.consecutiveShortage >= 2 && b.consecutiveShortage < 2) return -1;
      if (b.consecutiveShortage >= 2 && a.consecutiveShortage < 2) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const recentRecords = inspectionRecords.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">欢迎回来 👋</h1>
        <p className="mt-1 text-slate-500">
          这是您的会议室耗材管理总览
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="会议室总数"
          value={stats.totalRooms}
          icon={Building2}
          color="blue"
          delay={0}
        />
        <StatCard
          title="今日巡检"
          value={stats.todayInspections}
          icon={ClipboardCheck}
          color="green"
          delay={100}
        />
        <StatCard
          title="待补给项"
          value={stats.pendingSupply}
          icon={PackageOpen}
          color="amber"
          delay={200}
        />
        <StatCard
          title="缺货预警"
          value={stats.shortageAlerts}
          icon={AlertTriangle}
          color="red"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">待补给清单</h2>
              <p className="text-sm text-slate-500">需要尽快补货的物品</p>
            </div>
            <Link
              to="/supply"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <PackageOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无待补给项</p>
              </div>
            ) : (
              pendingItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                    item.consecutiveShortage >= 2 ? 'bg-red-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.consecutiveShortage >= 2
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {item.consecutiveShortage >= 2 ? (
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      ) : (
                        <PackageOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {item.roomName}
                        </span>
                        {item.consecutiveShortage >= 2 && (
                          <StatusBadge
                            status="urgent"
                            label={`连续${item.consecutiveShortage}次缺货`}
                            variant="danger"
                            size="sm"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {item.itemType === 'marker' && item.color ? (
                          <ColorBadge
                            color={item.color}
                            colorName={item.colorName}
                            size="sm"
                          />
                        ) : (
                          <span className="text-sm text-slate-600">
                            {getItemTypeLabel(item.itemType)}
                          </span>
                        )}
                        <span className="text-sm text-slate-400">·</span>
                        <span className="text-sm text-slate-500">
                          需补 {item.requiredQuantity} 件
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    status={item.status}
                    label={getStatusLabel(item.status)}
                    variant="warning"
                    size="sm"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">最近巡检记录</h2>
              <p className="text-sm text-slate-500">最新的巡检情况</p>
            </div>
            <Link
              to="/inspection/history"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {recentRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无巡检记录</p>
              </div>
            ) : (
              recentRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.needReplenish
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {record.roomName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          {formatDateTime(new Date(record.createdAt))}
                        </span>
                        <span className="text-sm text-slate-400">·</span>
                        <span className="text-sm text-slate-500">
                          巡检人：{record.inspector}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {record.needReplenish ? (
                      <StatusBadge
                        status="need-replenish"
                        label="需补货"
                        variant="warning"
                        size="sm"
                      />
                    ) : (
                      <StatusBadge
                        status="normal"
                        label="正常"
                        variant="success"
                        size="sm"
                      />
                    )}
                    <div className="mt-1 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {record.bookingDepartment}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">今日巡检完成率</h3>
            <p className="text-blue-100 mt-1">
              已完成 {Math.round((stats.inspectionCompletionRate / 100) * stats.totalRooms)} / {stats.totalRooms} 个会议室
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${stats.inspectionCompletionRate * 2.51} 251`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.inspectionCompletionRate}%</span>
              </div>
            </div>
            <Link
              to="/inspection"
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              开始巡检
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
