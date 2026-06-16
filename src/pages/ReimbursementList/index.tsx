import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate } from '@/utils/format';
import type { ReimbursementStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function ReimbursementList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reimbursements, clubs } = useAppStore();

  const statusFromUrl = searchParams.get('status') as ReimbursementStatus | null;

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReimbursementStatus | 'all'>(
    statusFromUrl || 'all'
  );
  const [clubFilter, setClubFilter] = useState<string>('all');

  const filteredReimbursements = reimbursements.filter((r) => {
    const matchSearch =
      r.budgetName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.purchaser.toLowerCase().includes(searchText.toLowerCase()) ||
      r.clubName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchClub = clubFilter === 'all' || r.clubId === clubFilter;
    return matchSearch && matchStatus && matchClub;
  });

  const statusTabs: { key: ReimbursementStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: reimbursements.length },
    {
      key: 'draft',
      label: '待提交',
      count: reimbursements.filter((r) => r.status === 'draft').length },
    {
      key: 'pending_teacher',
      label: '待老师',
      count: reimbursements.filter((r) => r.status === 'pending_teacher').length,
    },
    {
      key: 'pending_finance',
      label: '待财务',
      count: reimbursements.filter((r) => r.status === 'pending_finance').length,
    },
    { key: 'paid', label: '已打款', count: reimbursements.filter((r) => r.status === 'paid').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">报销单管理</h1>
          <p className="mt-1 text-sm text-slate-500">管理所有社团活动的报销申请</p>
        </div>
        <button
          onClick={() => navigate('/reimbursements/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
        >
          <Plus size={16} />
          新建报销
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  statusFilter === tab.key
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-2 px-1.5 py-0.5 rounded text-xs font-medium',
                    statusFilter === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索活动名称、购买人或社团..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
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

        <div className="p-4">
          {filteredReimbursements.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredReimbursements.map((reim) => (
                <div
                  key={reim.id}
                  onClick={() => navigate(`/reimbursements/${reim.id}`)}
                  className="p-5 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center',
                          reim.status === 'paid'
                            ? 'bg-success-100 text-success-600'
                            : reim.status === 'rejected'
                            ? 'bg-danger-100 text-danger-600'
                            : reim.status === 'pending_teacher'
                            ? 'bg-warning-100 text-warning-600'
                            : 'bg-primary-100 text-primary-600'
                        )}
                      >
                        <Receipt size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                          {reim.budgetName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{reim.clubName}</p>
                      </div>
                    </div>
                    <StatusBadge status={reim.status} />
                  </div>

                  {reim.isOverBudget && (
                    <div className="mb-3 p-2 rounded-lg bg-warning-50 border border-warning-200 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-warning-600" />
                      <span className="text-xs text-warning-700 font-medium">超预算，需老师审批</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">金额</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {formatCurrency(reim.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">购买人</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">{reim.purchaser}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">付款方式</p>
                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {reim.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {reim.receiptName ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <FileText size={12} />
                          有票据
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-danger-500">
                          <AlertTriangle size={12} />
                          无票据
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(reim.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500">暂无报销单</p>
            <button
              onClick={() => navigate('/reimbursements/new')}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + 创建第一张报销单
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
