import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  User,
  Calendar,
  Tag,
  FileText,
  UserCheck,
  Clock,
  Check,
  X,
  Plus,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBudgetById, getReimbursementsByBudget, approveBudget, rejectBudget } = useAppStore();

  const budget = getBudgetById(id || '');
  const reimbursements = budget ? getReimbursementsByBudget(budget.id) : [];

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Wallet size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-500 mb-4">预算不存在</p>
        <button
          onClick={() => navigate('/budgets')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          返回预算列表
        </button>
      </div>
    );
  }

  const usagePercent = budget.amount > 0 ? (budget.usedAmount / budget.amount) * 100 : 0;
  const isOver = budget.usedAmount > budget.amount;
  const remaining = budget.amount - budget.usedAmount;

  const handleApprove = () => {
    approveBudget(budget.id);
  };

  const handleReject = () => {
    rejectBudget(budget.id, '请调整预算后重新提交');
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/budgets')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{budget.name}</h1>
              <StatusBadge status={budget.status} type="budget" />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {budget.clubName} · 创建于 {formatDate(budget.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {budget.status === 'pending_teacher' && (
            <>
              <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-danger-200 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-50 transition-all"
              >
                <X size={16} />
                驳回
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 bg-success-500 text-white rounded-lg text-sm font-medium hover:bg-success-600 transition-all"
              >
                <Check size={16} />
                通过
              </button>
            </>
          )}
          {budget.status === 'active' && (
            <button
              onClick={() => navigate(`/reimbursements/new?budgetId=${budget.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
            >
              <Plus size={16} />
              新建报销
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-5">基本信息</h3>
            <div className="grid grid-cols-2 gap-5">
              <InfoItem icon={User} label="所属社团" value={budget.clubName} />
              <InfoItem icon={Tag} label="预算科目" value={budget.category} />
              <InfoItem icon={UserCheck} label="审批老师" value={budget.teacherName} />
              <InfoItem icon={Calendar} label="创建时间" value={formatDateTime(budget.createdAt)} />
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">活动用途</p>
              <p className="text-sm text-slate-700 leading-relaxed">{budget.purpose}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">关联报销单</h3>
              <span className="text-sm text-slate-500">共 {reimbursements.length} 条</span>
            </div>

            {reimbursements.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {reimbursements.map((reim) => (
                  <div
                    key={reim.id}
                    onClick={() => navigate(`/reimbursements/${reim.id}`)}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{reim.description || reim.category}</p>
                      <p className="text-xs text-slate-500">
                        {reim.purchaser} · {formatDate(reim.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(reim.amount)}
                      </p>
                      <StatusBadge status={reim.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">暂无报销记录</p>
                {budget.status === 'active' && (
                  <button
                    onClick={() => navigate(`/reimbursements/new?budgetId=${budget.id}`)}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + 添加报销
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={cn(
              'rounded-xl p-6 shadow-sm',
              isOver
                ? 'bg-gradient-to-br from-danger-500 to-danger-600'
                : 'bg-gradient-to-br from-primary-500 to-primary-600'
            )}
          >
            <p className="text-white/80 text-sm">预算总额</p>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(budget.amount)}
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                <span>已使用</span>
                <span>{Math.round(usagePercent)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs text-white/60">已使用</p>
                <p className="text-base font-semibold text-white mt-0.5">
                  {formatCurrency(budget.usedAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">剩余额度</p>
                <p
                  className={cn(
                    'text-base font-semibold mt-0.5',
                    isOver ? 'text-warning-200' : 'text-white'
                  )}
                >
                  {isOver ? `超支 ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              状态时间线
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-success-100 text-success-600 flex items-center justify-center flex-shrink-0">
                  <Check size={12} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">预算创建</p>
                  <p className="text-xs text-slate-500">{formatDateTime(budget.createdAt)}</p>
                </div>
              </div>

              {budget.status !== 'pending_teacher' && (
                <div className="flex gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                      budget.status === 'rejected'
                        ? 'bg-danger-100 text-danger-600'
                        : 'bg-success-100 text-success-600'
                    )}
                  >
                    {budget.status === 'rejected' ? <X size={12} /> : <Check size={12} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      老师审批{budget.status === 'rejected' ? '驳回' : '通过'}
                    </p>
                    <p className="text-xs text-slate-500">{budget.teacherName}</p>
                  </div>
                </div>
              )}

              {budget.status === 'pending_teacher' && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Clock size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">等待老师审批</p>
                    <p className="text-xs text-slate-500">{budget.teacherName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
