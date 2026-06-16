import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import DataCard from '@/components/DataCard';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate, getDaysSince } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function Statistics() {
  const navigate = useNavigate();
  const {
    getBudgetStatistics,
    getOverBudgetItems,
    getLongPendingReimbursements,
    getDashboardStats,
  } = useAppStore();

  const [pendingDaysThreshold, setPendingDaysThreshold] = useState(15);

  const budgetStats = getBudgetStatistics();
  const overBudgetItems = getOverBudgetItems();
  const longPending = getLongPendingReimbursements(pendingDaysThreshold);
  const dashboardStats = getDashboardStats();

  const maxBudget = Math.max(...budgetStats.map((s) => s.totalBudget), 1);

  const totalOverBudget = overBudgetItems.reduce((sum, item) => sum + item.overAmount, 0);
  const totalPendingAmount = longPending.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">统计分析</h1>
        <p className="mt-1 text-sm text-slate-500">
          社团经费使用情况、超支项目和未报销统计
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <DataCard
          title="社团总预算"
          value={formatCurrency(dashboardStats.totalBudget)}
          icon={<Wallet size={22} />}
          color="primary"
          description={`共 ${budgetStats.length} 个社团`}
        />
        <DataCard
          title="已使用金额"
          value={formatCurrency(dashboardStats.usedBudget)}
          icon={<TrendingUp size={22} />}
          color="success"
          description={`使用率 ${dashboardStats.totalBudget > 0 ? Math.round((dashboardStats.usedBudget / dashboardStats.totalBudget) * 100) : 0}%`}
        />
        <DataCard
          title="超支项目"
          value={overBudgetItems.length}
          icon={<AlertTriangle size={22} />}
          color="warning"
          description={`超支总额 ${formatCurrency(totalOverBudget)}`}
        />
        <DataCard
          title="长期未报销"
          value={longPending.length}
          icon={<Clock size={22} />}
          color="danger"
          description={`涉及金额 ${formatCurrency(totalPendingAmount)}`}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary-500" />
                  各社团预算使用情况
                </h3>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-5">
                {budgetStats.map((stat) => {
                  const usagePercent =
                    stat.totalBudget > 0 ? (stat.usedBudget / stat.totalBudget) * 100 : 0;
                  const isOver = stat.usedBudget > stat.totalBudget;

                  return (
                    <div key={stat.clubId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                            <Users size={14} />
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {stat.clubName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">
                            预算: <span className="font-medium text-slate-700">{formatCurrency(stat.totalBudget)}</span>
                          </span>
                          <span
                            className={cn(
                              'font-semibold',
                              isOver ? 'text-danger-600' : 'text-primary-600'
                            )}
                          >
                            {Math.round(usagePercent)}%
                          </span>
                        </div>
                      </div>
                      <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-lg transition-all duration-500',
                            isOver
                              ? 'bg-gradient-to-r from-danger-400 to-danger-500'
                              : 'bg-gradient-to-r from-primary-400 to-primary-500'
                          )}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-xs font-medium text-white drop-shadow-sm">
                            已用 {formatCurrency(stat.usedBudget)}
                          </span>
                          <span className="text-xs font-medium text-slate-600">
                            剩余 {formatCurrency(stat.remainingBudget)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary-500"></div>
                      <span className="text-slate-600">正常使用</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-danger-500"></div>
                      <span className="text-slate-600">超支</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-warning-500" />
                  超支项目
                </h3>
                <span className="text-sm text-slate-500">
                  共 {overBudgetItems.length} 个项目超支
                </span>
              </div>
            </div>

            {overBudgetItems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {overBudgetItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/budgets/${item.id}`)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center text-warning-600">
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.budgetName}</p>
                          <p className="text-xs text-slate-500">{item.clubName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-danger-600 flex items-center gap-1 justify-end">
                          <ArrowUpRight size={14} />
                          超支 {formatCurrency(item.overAmount)}
                        </p>
                        <p className="text-xs text-slate-500">
                          预算 {formatCurrency(item.budgetAmount)} / 已用{' '}
                          {formatCurrency(item.usedAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">超支比例</span>
                        <span className="font-medium text-danger-600">+{item.overPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-warning-400 to-danger-500 rounded-full"
                          style={{ width: `${Math.min(item.overPercentage + 100, 150)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                  <Wallet size={24} className="text-success-500" />
                </div>
                <p className="text-slate-700 font-medium">太棒了！没有超支项目</p>
                <p className="text-sm text-slate-400 mt-1">所有预算都控制在合理范围内</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-danger-500" />
                  长期未报销
                </h3>
                <select
                  value={pendingDaysThreshold}
                  onChange={(e) => setPendingDaysThreshold(Number(e.target.value))}
                  className="h-7 px-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={7}>7天以上</option>
                  <option value={15}>15天以上</option>
                  <option value={30}>30天以上</option>
                </select>
              </div>
            </div>

            {longPending.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {longPending.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/reimbursements/${item.id}`)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.budgetName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.clubName} · {item.purchaser}
                        </p>
                      </div>
                      <span className="ml-2 text-xs font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {item.daysPending}天
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      创建于 {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-3">
                  <Clock size={20} className="text-success-500" />
                </div>
                <p className="text-sm text-slate-600">暂无长期未报销项</p>
                <p className="text-xs text-slate-400 mt-1">所有报销都在正常处理中</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white shadow-lg shadow-primary-200">
            <h3 className="font-semibold mb-4">本月数据概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">总预算</span>
                <span className="text-xl font-bold">{formatCurrency(dashboardStats.totalBudget)}</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: `${dashboardStats.totalBudget > 0 ? (dashboardStats.usedBudget / dashboardStats.totalBudget) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-white/60">已使用</p>
                  <p className="text-base font-semibold mt-0.5">
                    {formatCurrency(dashboardStats.usedBudget)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60">剩余</p>
                  <p className="text-base font-semibold mt-0.5">
                    {formatCurrency(dashboardStats.remainingBudget)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/20">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.pendingCount}</p>
                  <p className="text-xs text-white/60">待处理</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.paidCount}</p>
                  <p className="text-xs text-white/60">已完成</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.draftCount}</p>
                  <p className="text-xs text-white/60">草稿</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4">快捷操作</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/budgets/new')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                  <Wallet size={16} />
                </div>
                <span className="text-sm text-slate-700">新建活动预算</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/reimbursements/new')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center text-success-600">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm text-slate-700">提交报销申请</span>
                <ArrowUpRight size={14} className="ml-auto text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
