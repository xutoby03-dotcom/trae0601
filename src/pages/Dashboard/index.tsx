import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  DollarSign,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useMemberStore } from '@/store/useMemberStore';
import { usePlanStore } from '@/store/usePlanStore';
import { cn } from '@/lib/utils';

const severityColors = {
  high: 'bg-danger-100 text-danger-700 border-danger-200',
  medium: 'bg-warning-100 text-warning-700 border-warning-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function Dashboard() {
  const { stats, loading: statsLoading, fetchStats } = useDashboardStore();
  const { members, fetchMembers } = useMemberStore();
  const { plans, fetchPlans } = usePlanStore();

  useEffect(() => {
    fetchStats();
    fetchMembers();
    fetchPlans();
  }, [fetchStats, fetchMembers, fetchPlans]);

  const unconfirmedMembers = members.filter((m) => !m.confirmed);
  const latestPlan = plans[0];

  const statCards = [
    {
      label: '未确认成员',
      value: stats?.unconfirmedMembers ?? 0,
      total: stats?.totalMembers ?? 0,
      icon: Users,
      color: 'from-warning-400 to-warning-600',
      bgColor: 'bg-warning-50',
      link: '/members',
      linkText: '查看成员',
    },
    {
      label: '高风险菜品',
      value: stats?.highRiskDishes ?? 0,
      icon: AlertTriangle,
      color: 'from-danger-400 to-danger-600',
      bgColor: 'bg-danger-50',
      link: latestPlan ? `/plans/${latestPlan.id}` : '/plans',
      linkText: '查看菜品',
    },
    {
      label: '预算差额',
      value: stats?.budgetDiff ?? 0,
      isCurrency: true,
      icon: DollarSign,
      color: (stats?.budgetDiff ?? 0) >= 0 ? 'from-success-400 to-success-600' : 'from-danger-400 to-danger-600',
      bgColor: (stats?.budgetDiff ?? 0) >= 0 ? 'bg-success-50' : 'bg-danger-50',
      link: latestPlan ? `/plans/${latestPlan.id}` : '/plans',
      linkText: '调整预算',
    },
    {
      label: '需替换菜品',
      value: stats?.dishesToReplace ?? 0,
      icon: UtensilsCrossed,
      color: 'from-primary-400 to-primary-600',
      bgColor: 'bg-primary-50',
      link: latestPlan ? `/plans/${latestPlan.id}` : '/plans',
      linkText: '管理菜品',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
          看板总览
        </h1>
        <p className="text-slate-500">
          实时监控聚餐筹备进度和风险预警
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                'card p-6 animate-fade-in-up',
                card.bgColor
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
                    card.color
                  )}
                >
                  <Icon size={24} />
                </div>
                <Link
                  to={card.link}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  {card.linkText}
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                <p className="font-display text-3xl font-bold text-slate-900">
                  {card.isCurrency
                    ? `¥${card.value.toLocaleString()}`
                    : card.value}
                  {card.total !== undefined && (
                    <span className="text-lg text-slate-400 font-normal">
                      {' / '}
                      {card.total}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-slate-900">
              待处理预警
            </h2>
            {stats?.pendingConflicts && stats.pendingConflicts.length > 0 && (
              <span className="badge bg-danger-100 text-danger-700">
                {stats.pendingConflicts.length} 项待处理
              </span>
            )}
          </div>

          {statsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg" />
              ))}
            </div>
          ) : stats?.pendingConflicts && stats.pendingConflicts.length > 0 ? (
            <div className="space-y-3">
              {stats.pendingConflicts.slice(0, 5).map((conflict, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-sm animate-fade-in-up',
                    severityColors[conflict.severity]
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AlertCircle
                    size={20}
                    className={cn(
                      'mt-0.5 flex-shrink-0',
                      conflict.severity === 'high'
                        ? 'text-danger-500'
                        : conflict.severity === 'medium'
                        ? 'text-warning-500'
                        : 'text-slate-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{conflict.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {conflict.suggestion}
                    </p>
                    {conflict.tableId && (
                      <span className="inline-flex items-center mt-2 text-xs">
                        第 {conflict.tableId} 桌
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2
                size={48}
                className="mx-auto text-success-500 mb-4"
              />
              <p className="text-slate-600 font-medium">暂无待处理预警</p>
              <p className="text-sm text-slate-400 mt-1">
                所有配置检查通过，可以放心聚餐！
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">
              未确认成员
            </h2>
            {unconfirmedMembers.length > 0 ? (
              <div className="space-y-3">
                {unconfirmedMembers.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center text-warning-700 font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {member.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} />
                        <span>待确认</span>
                      </div>
                    </div>
                  </div>
                ))}
                {unconfirmedMembers.length > 4 && (
                  <Link
                    to="/members"
                    className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    还有 {unconfirmedMembers.length - 4} 位未确认 →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2
                  size={36}
                  className="mx-auto text-success-500 mb-3"
                />
                <p className="text-sm text-slate-600">全部成员已确认</p>
              </div>
            )}
          </div>

          <div className="card p-6 bg-gradient-to-br from-primary-50 to-teal-50">
            <h3 className="font-display text-lg font-bold text-primary-700 mb-3">
              📋 快速操作
            </h3>
            <div className="space-y-2">
              <Link
                to="/members/new"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all"
              >
                <Users size={18} className="text-primary-500" />
                <span className="text-sm font-medium text-slate-700">
                  添加新成员
                </span>
                <ArrowRight size={16} className="ml-auto text-slate-400" />
              </Link>
              <Link
                to="/plans/new"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all"
              >
                <UtensilsCrossed size={18} className="text-primary-500" />
                <span className="text-sm font-medium text-slate-700">
                  创建新方案
                </span>
                <ArrowRight size={16} className="ml-auto text-slate-400" />
              </Link>
              {latestPlan && (
                <Link
                  to={`/plans/${latestPlan.id}/seating`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all"
                >
                  <span className="text-lg">🪑</span>
                  <span className="text-sm font-medium text-slate-700">
                    智能分桌
                  </span>
                  <ArrowRight size={16} className="ml-auto text-slate-400" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
