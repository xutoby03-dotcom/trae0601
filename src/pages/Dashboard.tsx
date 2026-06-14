import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shirt,
  ClipboardList,
  Droplets,
  AlertTriangle,
  Plus,
  RotateCcw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { statisticsApi } from '../services/costumeService';
import { borrowApi } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useState } from 'react';
import type { UsageStat } from '../../shared/types';

interface StatCardProps {
  title: string;
  value: number;
  icon: typeof Shirt;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { overview, refreshOverview, overdueCount } = useAppStore();
  const [topCostumes, setTopCostumes] = useState<UsageStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    refreshOverview();
    loadData();
  }, [refreshOverview]);

  const loadData = async () => {
    try {
      const [usage, activity] = await Promise.all([
        statisticsApi.getUsageStats(5),
        statisticsApi.getRecentActivity(5),
      ]);
      setTopCostumes(usage);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const quickActions = [
    { label: '新增服装', icon: Plus, path: '/costumes/new', color: 'bg-primary-500 hover:bg-primary-600' },
    { label: '借出登记', icon: ClipboardList, path: '/borrow', color: 'bg-green-500 hover:bg-green-600' },
    { label: '归还检查', icon: RotateCcw, path: '/return', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: '待洗列表', icon: Droplets, path: '/statistics', color: 'bg-cyan-500 hover:bg-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">欢迎回来 👋</h1>
        <p className="text-gray-500 mt-1">这是您的服装管理仪表盘概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="服装总数"
          value={overview?.total_costumes || 0}
          icon={Shirt}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          title="在借数量"
          value={overview?.borrowed_count || 0}
          icon={ClipboardList}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="待清洗"
          value={overview?.washing_count || 0}
          icon={Droplets}
          color="text-cyan-600"
          bgColor="bg-cyan-50"
        />
        <StatCard
          title="逾期提醒"
          value={overdueCount}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">快捷操作</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.path}
                    className={`${action.color} text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">最近动态</h2>
              <Link to="/borrow/records" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.student_name} 借出 {activity.costume_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.club_name} · {activity.activity_name}
                    </p>
                  </div>
                  <StatusBadge status={activity.status} type="borrow" />
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-gray-400 text-center py-8">暂无动态</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-800">使用排行</h2>
            </div>
            <div className="space-y-3">
              {topCostumes.map((costume, index) => (
                <div key={costume.costume_id} className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-400 text-white'
                        : index === 1
                        ? 'bg-gray-300 text-white'
                        : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {costume.costume_name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {costume.use_count} 次
                  </span>
                </div>
              ))}
              {topCostumes.length === 0 && (
                <p className="text-gray-400 text-center py-4">暂无数据</p>
              )}
            </div>
          </div>

          {overdueCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">逾期提醒</h3>
                  <p className="text-sm text-red-600 mt-1">
                    有 {overdueCount} 套服装已逾期未归还
                  </p>
                  <Link
                    to="/notifications"
                    className="inline-flex items-center gap-1 text-sm text-red-700 hover:text-red-800 font-medium mt-3"
                  >
                    查看详情 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
