import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Tag,
  CreditCard,
  Wallet,
  Calendar,
  FileText,
  Check,
  X,
  Send,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Clock,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';

export default function ReimbursementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getReimbursementById,
    getBudgetById,
    submitReimbursement,
    approveReimbursementByTeacher,
    approveReimbursementByFinance,
    rejectReimbursement,
  } = useAppStore();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRole, setRejectRole] = useState('');

  const reimbursement = getReimbursementById(id || '');
  const budget = reimbursement ? getBudgetById(reimbursement.budgetId) : null;

  if (!reimbursement) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileText size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-500 mb-4">报销单不存在</p>
        <button
          onClick={() => navigate('/reimbursements')}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          返回报销单列表
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    submitReimbursement(reimbursement.id);
  };

  const handleTeacherApprove = () => {
    approveReimbursementByTeacher(reimbursement.id, '同意报销');
  };

  const handleFinanceApprove = () => {
    approveReimbursementByFinance(reimbursement.id, '已打款');
  };

  const handleReject = (role: string) => {
    setRejectRole(role);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    rejectReimbursement(reimbursement.id, rejectRole, rejectReason || '驳回申请');
    setShowRejectModal(false);
    setRejectReason('');
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

  const canSubmit = reimbursement.status === 'draft' && reimbursement.receiptName;
  const canTeacherApprove = reimbursement.status === 'pending_teacher';
  const canFinanceApprove = reimbursement.status === 'pending_finance';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/reimbursements')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {reimbursement.budgetName}
              </h1>
              <StatusBadge status={reimbursement.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {reimbursement.clubName} · 提交于 {formatDateTime(reimbursement.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {reimbursement.status === 'draft' && (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                canSubmit
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              <Send size={16} />
              提交报销
            </button>
          )}

          {canTeacherApprove && (
            <>
              <button
                onClick={() => handleReject('指导老师')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-danger-200 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-50 transition-all"
              >
                <X size={16} />
                驳回
              </button>
              <button
                onClick={handleTeacherApprove}
                className="flex items-center gap-2 px-4 py-2 bg-success-500 text-white rounded-lg text-sm font-medium hover:bg-success-600 transition-all"
              >
                <Check size={16} />
                通过
              </button>
            </>
          )}

          {canFinanceApprove && (
            <>
              <button
                onClick={() => handleReject('财务')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-danger-200 text-danger-600 rounded-lg text-sm font-medium hover:bg-danger-50 transition-all"
              >
                <X size={16} />
                驳回
              </button>
              <button
                onClick={handleFinanceApprove}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm shadow-primary-200"
              >
                <Check size={16} />
                确认打款
              </button>
            </>
          )}
        </div>
      </div>

      {reimbursement.isOverBudget && reimbursement.status !== 'paid' && reimbursement.status !== 'draft' && (
        <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 flex items-start gap-3">
          <AlertTriangle size={20} className="text-warning-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-800">超预算提醒</p>
            <p className="text-xs text-warning-700 mt-1">
              本次报销超出预算，已进入老师二次审批流程
            </p>
          </div>
        </div>
      )}

      {reimbursement.status === 'draft' && !reimbursement.receiptName && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-danger-800">缺少票据照片</p>
            <p className="text-xs text-danger-700 mt-1">
              请先上传票据照片后再提交报销申请
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-5">报销信息</h3>
            <div className="grid grid-cols-2 gap-5">
              <InfoItem icon={Wallet} label="活动预算" value={reimbursement.budgetName} />
              <InfoItem icon={User} label="购买人" value={reimbursement.purchaser} />
              <InfoItem icon={Tag} label="报销品类" value={reimbursement.category} />
              <InfoItem icon={CreditCard} label="付款方式" value={reimbursement.paymentMethod} />
              <InfoItem
                icon={FileText}
                label="费用说明"
                value={reimbursement.description || '无'}
              />
              <InfoItem
                icon={Calendar}
                label="创建时间"
                value={formatDateTime(reimbursement.createdAt)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">票据凭证</h3>
            {reimbursement.receiptUrl ? (
              <div className="relative">
                <img
                  src={reimbursement.receiptUrl}
                  alt={reimbursement.receiptName}
                  className="w-full max-h-80 object-cover rounded-xl border border-slate-200"
                />
                <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                  <FileText size={14} />
                  {reimbursement.receiptName}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <ImageIcon size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">暂无票据照片</p>
                <p className="text-xs text-slate-400 mt-1">上传票据后才能提交报销</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-400" />
              审批记录
            </h3>
            {reimbursement.approvalLogs.length > 0 ? (
              <div className="space-y-5">
                {reimbursement.approvalLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          log.action === 'approve'
                            ? 'bg-success-100 text-success-600'
                            : log.action === 'reject'
                            ? 'bg-danger-100 text-danger-600'
                            : 'bg-primary-100 text-primary-600'
                        )}
                      >
                        {log.action === 'approve' ? (
                          <Check size={14} />
                        ) : log.action === 'reject' ? (
                          <X size={14} />
                        ) : (
                          <Send size={14} />
                        )}
                      </div>
                      {index < reimbursement.approvalLogs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {log.approver}
                        </span>
                        <span className="text-xs text-slate-400">· {log.role}</span>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            log.action === 'approve'
                              ? 'bg-success-50 text-success-700'
                              : log.action === 'reject'
                              ? 'bg-danger-50 text-danger-700'
                              : 'bg-primary-50 text-primary-700'
                          )}
                        >
                          {log.action === 'approve'
                            ? '通过'
                            : log.action === 'reject'
                            ? '驳回'
                            : '提交'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{log.comment}</p>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">暂无审批记录</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-200">
            <p className="text-white/80 text-sm">报销金额</p>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(reimbursement.amount)}
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-white/60">所属社团</p>
              <p className="text-sm font-medium text-white mt-1">{reimbursement.clubName}</p>
            </div>
          </div>

          {budget && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-semibold text-slate-900 mb-4">预算使用情况</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">预算总额</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">已使用（含本次）</span>
                    <span
                      className={cn(
                        'font-medium',
                        budget.usedAmount + reimbursement.amount > budget.amount
                          ? 'text-danger-600'
                          : 'text-slate-800'
                      )}
                    >
                      {formatCurrency(budget.usedAmount + reimbursement.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      budget.usedAmount + reimbursement.amount > budget.amount
                        ? 'bg-danger-500'
                        : 'bg-primary-500'
                    )}
                    style={{
                      width: `${Math.min(
                        ((budget.usedAmount + reimbursement.amount) / budget.amount) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">剩余额度</span>
                  <span
                    className={cn(
                      'font-semibold',
                      budget.usedAmount + reimbursement.amount > budget.amount
                        ? 'text-danger-600'
                        : 'text-primary-600'
                    )}
                  >
                    {budget.usedAmount + reimbursement.amount > budget.amount
                      ? `超支 ${formatCurrency(budget.usedAmount + reimbursement.amount - budget.amount)}`
                      : formatCurrency(budget.amount - budget.usedAmount - reimbursement.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h4 className="font-semibold text-slate-900 mb-4">状态流转</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success-100 text-success-600 flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span className="text-sm text-slate-700">创建报销单</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    reimbursement.status !== 'draft'
                      ? 'bg-success-100 text-success-600'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {reimbursement.status !== 'draft' ? (
                    <Check size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                </div>
                <span className="text-sm text-slate-700">提交报销</span>
              </div>
              {(reimbursement.isOverBudget || reimbursement.status === 'pending_teacher') && (
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center',
                      reimbursement.status === 'pending_teacher'
                        ? 'bg-warning-100 text-warning-600 animate-pulse'
                        : reimbursement.status === 'pending_finance' || reimbursement.status === 'paid'
                        ? 'bg-success-100 text-success-600'
                        : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    {reimbursement.status === 'pending_teacher' ? (
                      <Clock size={12} />
                    ) : reimbursement.status === 'pending_finance' || reimbursement.status === 'paid' ? (
                      <Check size={12} />
                    ) : (
                      <span className="text-[10px] font-bold">3</span>
                    )}
                  </div>
                  <span className="text-sm text-slate-700">老师审批（超预算）</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    reimbursement.status === 'pending_finance'
                      ? 'bg-primary-100 text-primary-600 animate-pulse'
                      : reimbursement.status === 'paid'
                      ? 'bg-success-100 text-success-600'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {reimbursement.status === 'paid' ? (
                    <Check size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                </div>
                <span className="text-sm text-slate-700">财务审核</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    reimbursement.status === 'paid'
                      ? 'bg-success-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {reimbursement.status === 'paid' ? <Check size={12} /> : <span className="text-[10px]">$</span>}
                </div>
                <span className="text-sm text-slate-700">已打款</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">驳回报销</h3>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">驳回原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-danger-500 text-white rounded-lg text-sm font-medium hover:bg-danger-600 transition-all"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
