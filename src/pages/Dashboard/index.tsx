import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  FileText,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import DataCard from '@/components/DataCard';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate } from '@/utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    getDashboardStats,
    reimbursements,
    getLongPendingReimbursements,
  } = useAppStore();

  const stats = getDashboardStats();
  const longPending = getLongPendingReimbursements(15);

  const recentReimbursements = [...reimbursements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingItems = [
    {
      label: '待老师审批',
      count: stats.pendingTeacherCount,
      color: 'warning' as const,
      status: 'pending_teacher',
    },
    {
      label: '待财务审核',
      count: stats.pendingFinanceCount,
      color: 'primary' as const,
      status: 'pending_finance',
    },
    {
      label: '待提交草稿',
      count: stats.draftCount,
      color: 'slate' as const,
      status: 'draft',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎回来，李明轩 👋</h1>
          <p className="mt-1 text-sm text-slate-500">今天是 {formatDate(new Date().toISOString())}，祝您工作顺利</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/budgets/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Wallet size={16} />
            新建预算
          </button>
          <button
            onClick={() => navigate('/reimbursements/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
          >
            <Plus size={16} />
            新建报销
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <DataCard
          title="总预算额度"
          value={formatCurrency(stats.totalBudget)}
          icon={<Wallet size={22} />}
          color="primary"
          description="本学期所有社团预算"
        />
        <DataCard
          title="已使用金额"
          value={formatCurrency(stats.usedBudget)}
          icon={<TrendingUp size={22} />}
          color="success"
          description={`使用率 ${stats.totalBudget > 0 ? Math.round((stats.usedBudget / stats.totalBudget) * 100) : 0}%`}
        />
        <DataCard
          title="待处理报销"
          value={stats.pendingCount}
          icon={<Clock size={22} />}
          color="warning"
          description="等待审批的报销单"
        />
        <DataCard
          title="已完成报销"
          value={stats.paidCount}
          icon={<CheckCircle size={22} />}
          color="slate"
          description="已打款的报销单"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">待办事项</h3>
                <button
                  onClick={() => navigate('/reimbursements')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  查看全部
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <button
                  key={item.status}
                  onClick={() => navigate(`/reimbursements?status=${item.status}`)}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.color === 'warning'
                          ? 'bg-warning-100 text-warning-600'
                          : item.color === 'primary'
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Clock size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-500 flex items-center gap-1">
                    点击查看
                    <ArrowRight size={12} />
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">最近报销</h3>
                <button
                  onClick={() => navigate('/reimbursements')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  查看全部
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {recentReimbursements.map((reim) => (
                <div
                  key={reim.id}
                  onClick={() => navigate(`/reimbursements/${reim.id}`)}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                    <Receipt size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {reim.budgetName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {reim.clubName} · {reim.purchaser}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(reim.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(reim.createdAt)}</p>
                  </div>
                  <StatusBadge status={reim.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white shadow-lg shadow-primary-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">预算使用率</h3>
              <span className="text-2xl font-bold">
                {stats.totalBudget > 0 ? Math.round((stats.usedBudget / stats.totalBudget) * 100) : 0}%
              </span>
            </div>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${stats.totalBudget > 0 ? (stats.usedBudget / stats.totalBudget) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <p className="text-white/60 text-xs">剩余预算</p>
                <p className="font-semibold">{formatCurrency(stats.remainingBudget)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">已使用</p>
                <p className="font-semibold">{formatCurrency(stats.usedBudget)}</p>
              </div>
            </div>
          </div>

          {longPending.length > 0 && (
            <div className="bg-white rounded-xl border border-warning-200 shadow-sm">
              <div className="p-4 border-b border-warning-100 bg-warning-50/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-warning-600" />
                  <h3 className="font-semibold text-slate-900">长期未报销提醒</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">以下垫付款超过 15 天未完成报销</p>
              </div>
              <div className="divide-y divide-slate-100">
                {longPending.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/reimbursements/${item.id}`)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate flex-1">
                        {item.budgetName}
                      </p>
                      <span className="ml-2 text-xs font-medium text-warning-600 bg-warning-50 px-2 py-0.5 rounded">
                        {item.daysPending}天
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{item.clubName}</span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <span className="text-sm text-slate-700">创建活动预算</span>
                <ArrowRight size={14} className="ml-auto text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/reimbursements/new')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center text-success-600">
                  <FileText size={16} />
                </div>
                <span className="text-sm text-slate-700">提交报销申请</span>
                <ArrowRight size={14} className="ml-auto text-slate-400" />
              </button>
              <button
                onClick={() => navigate('/statistics')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center text-warning-600">
                  <TrendingUp size={16} />
                </div>
                <span className="text-sm text-slate-700">查看统计分析</span>
                <ArrowRight size={14} className="ml-auto text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
