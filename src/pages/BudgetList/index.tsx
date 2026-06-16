import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Check, X, Wallet } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate } from '@/utils/format';
import type { BudgetStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function BudgetList() {
  const navigate = useNavigate();
  const { budgets, clubs, approveBudget, rejectBudget } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all');
  const [clubFilter, setClubFilter] = useState<string>('all');

  const filteredBudgets = budgets.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(searchText.toLowerCase()) ||
      b.clubName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchClub = clubFilter === 'all' || b.clubId === clubFilter;
    return matchSearch && matchStatus && matchClub;
  });

  const handleApprove = (id: string) => {
    approveBudget(id);
  };

  const handleReject = (id: string) => {
    rejectBudget(id, '预算不符合要求，请修改后重新提交');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">活动预算</h1>
          <p className="mt-1 text-sm text-slate-500">管理所有社团活动的预算申请</p>
        </div>
        <button
          onClick={() => navigate('/budgets/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
        >
          <Plus size={16} />
          新建预算
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索预算名称或社团..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BudgetStatus | 'all')}
              className="h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">全部状态</option>
              <option value="pending_teacher">待老师审批</option>
              <option value="active">已生效</option>
              <option value="rejected">已驳回</option>
            </select>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="h-9 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">全部社团</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  预算名称
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  所属社团
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  预算金额
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  已使用
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  审批老师
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  状态
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  创建时间
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBudgets.map((budget) => {
                const usagePercent = budget.amount > 0 ? (budget.usedAmount / budget.amount) * 100 : 0;
                const isOver = budget.usedAmount > budget.amount;

                return (
                  <tr
                    key={budget.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/budgets/${budget.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                          <Wallet size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{budget.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {budget.purpose}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{budget.clubName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(budget.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span
                            className={cn(
                              'font-medium',
                              isOver ? 'text-danger-600' : 'text-slate-600'
                            )}
                          >
                            {formatCurrency(budget.usedAmount)}
                          </span>
                          <span className="text-slate-400">{Math.round(usagePercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              isOver ? 'bg-danger-500' : 'bg-primary-500'
                            )}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{budget.teacherName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={budget.status} type="budget" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{formatDate(budget.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {budget.status === 'pending_teacher' && (
                          <>
                            <button
                              onClick={() => handleApprove(budget.id)}
                              className="p-1.5 rounded-lg bg-success-50 text-success-600 hover:bg-success-100 transition-colors"
                              title="通过"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(budget.id)}
                              className="p-1.5 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors"
                              title="驳回"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/budgets/${budget.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBudgets.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500">暂无预算数据</p>
            <button
              onClick={() => navigate('/budgets/new')}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + 创建第一个预算
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
