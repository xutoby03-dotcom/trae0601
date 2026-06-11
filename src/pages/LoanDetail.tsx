import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  FileText,
  Package,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatMoney, getDaysUntilReturn, isOverdue, getToday, addDays } from '../utils';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLoanById, approveRenewal, rejectRenewal, addRenewal } = useAppStore();

  const loan = getLoanById(id || '');

  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewDays, setRenewDays] = useState(7);
  const [renewReason, setRenewReason] = useState('');

  if (!loan) {
    return (
      <PageContainer title="借出详情" subtitle="记录不存在">
        <div className="text-center py-16 text-gray-500">借出记录不存在</div>
      </PageContainer>
    );
  }

  const device = loan.device;
  const customer = loan.customer;
  const employee = loan.employee;
  const overdue = isOverdue(loan.expectedReturnDate, loan.status);
  const daysLeft = getDaysUntilReturn(loan.expectedReturnDate);

  const handleSubmitRenewal = () => {
    if (!renewReason.trim()) {
      alert('请填写续借原因');
      return;
    }
    addRenewal(loan.id, {
      extendDays: renewDays,
      newReturnDate: addDays(loan.expectedReturnDate, renewDays),
      reason: renewReason,
    });
    setShowRenewModal(false);
    setRenewDays(7);
    setRenewReason('');
  };

  const pendingRenewal = loan.renewals.find((r) => r.status === 'pending');

  return (
    <PageContainer title="借出详情" subtitle={device?.deviceNo || ''}>
      <button
        onClick={() => navigate('/loans')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回借出列表
      </button>

      {/* 状态卡片 */}
      <div className={`rounded-xl p-6 mb-6 ${overdue ? 'bg-danger-50 border border-danger-100' : 'bg-primary-50 border border-primary-100'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold font-serif text-gray-800">{device?.name}</h2>
              <StatusBadge status={overdue ? 'overdue' : loan.status} type="loan" />
            </div>
            <p className="text-gray-600">{device?.model} · {device?.deviceNo}</p>
          </div>
          {loan.status !== 'returned' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenewModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                申请续借
              </button>
              <button
                onClick={() => navigate(`/loans/${loan.id}/return`)}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                登记归还
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-6 mt-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">借出日期</p>
            <p className="font-medium text-gray-800 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDate(loan.loanDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">预计归还</p>
            <p className={`font-medium flex items-center gap-1 ${overdue ? 'text-danger-600' : 'text-gray-800'}`}>
              <Clock className={`w-4 h-4 ${overdue ? 'text-danger-500' : 'text-gray-400'}`} />
              {formatDate(loan.expectedReturnDate)}
            </p>
            {loan.status !== 'returned' && (
              <p className={`text-xs mt-1 ${overdue ? 'text-danger-500' : 'text-gray-400'}`}>
                {overdue ? `已逾期 ${Math.abs(daysLeft)} 天` : `还剩 ${daysLeft} 天`}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">押金金额</p>
            <p className="font-medium text-gray-800 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {formatMoney(loan.deposit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">负责人</p>
            <p className="font-medium text-gray-800 flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              {employee?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* 客户信息 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary-600" />
              客户信息
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">联系人</p>
                <p className="font-medium text-gray-800">{customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">公司</p>
                <p className="font-medium text-gray-800">{customer?.company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">电话</p>
                <p className="font-medium text-gray-800">{customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">邮箱</p>
                <p className="font-medium text-gray-800">{customer?.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* 配件清单 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                配件清单
              </h3>
              <span className="text-sm text-gray-500">共 {loan.loanAccessories.length} 件</span>
            </div>

            <div className="space-y-3">
              {loan.loanAccessories.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-800">{acc.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      借出: <span className="font-bold text-primary-600">× {acc.quantity}</span>
                    </span>
                    {loan.status === 'returned' && (
                      <span className="text-gray-600">
                        归还: <span className={`font-bold ${
                          (acc.returnQuantity || 0) < acc.quantity ? 'text-danger-600' : 'text-success-600'
                        }`}>
                          × {acc.returnQuantity || 0}
                        </span>
                      </span>
                    )}
                    {loan.status === 'returned' && (
                      <StatusBadge
                        status={(acc.returnQuantity || 0) >= acc.quantity ? 'returned' : 'overdue'}
                        type="loan"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 续借记录 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <RotateCcw className="w-5 h-5 text-primary-600" />
              续借记录
            </h3>

            {loan.renewals.length === 0 ? (
              <p className="text-gray-400 text-center py-6">暂无续借记录</p>
            ) : (
              <div className="space-y-3">
                {loan.renewals.map((renewal) => {
                  const approver = useAppStore.getState().employees.find(
                    (e) => e.id === renewal.approverId
                  );
                  return (
                    <div
                      key={renewal.id}
                      className="p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-800">
                            续借 {renewal.extendDays} 天
                          </span>
                          <StatusBadge status={renewal.status} type="renewal" />
                        </div>
                        <span className="text-sm text-gray-500">
                          申请时间: {formatDate(renewal.applyDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">原因: {renewal.reason}</p>
                      {renewal.status !== 'pending' && (
                        <div className="text-sm text-gray-500 pt-2 border-t border-gray-50">
                          <p>审批人: {approver?.name || '-'}</p>
                          <p>审批意见: {renewal.approvalNote || '-'}</p>
                          <p>审批时间: {renewal.approveDate ? formatDate(renewal.approveDate) : '-'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 备注 */}
          {loan.notes && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary-600" />
                备注
              </h3>
              <p className="text-gray-600">{loan.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* 异常记录 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                异常记录
              </h3>
              <span className="text-sm text-gray-500">{loan.exceptions.length} 条</span>
            </div>

            {loan.exceptions.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-success-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">暂无异常记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loan.exceptions.map((exc) => (
                  <div key={exc.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {exc.type === 'damage'
                          ? '外观损坏'
                          : exc.type === 'accessory_missing'
                          ? '配件缺失'
                          : exc.type === 'malfunction'
                          ? '功能故障'
                          : '其他异常'}
                      </span>
                      <StatusBadge status={exc.status} type="exception" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{exc.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>严重程度: 
                        <span className={exc.severity === 'high' ? 'text-danger-500' : exc.severity === 'medium' ? 'text-orange-500' : 'text-warning-500'}>
                          {' '}{exc.severity === 'high' ? '严重' : exc.severity === 'medium' ? '一般' : '轻微'}
                        </span>
                      </span>
                      <span>{formatDate(exc.createDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 操作记录 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">时间线</h3>
            <div className="relative">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200"></div>
              <div className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-success-500 border-2 border-white shadow"></div>
                  <p className="text-sm font-medium text-gray-800">借出登记</p>
                  <p className="text-xs text-gray-500">{formatDate(loan.loanDate)}</p>
                </div>

                {loan.renewals
                  .filter((r) => r.status === 'approved')
                  .map((r) => (
                    <div key={r.id} className="relative pl-8">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow"></div>
                      <p className="text-sm font-medium text-gray-800">续借 {r.extendDays} 天</p>
                      <p className="text-xs text-gray-500">{formatDate(r.approveDate || '')}</p>
                    </div>
                  ))}

                {loan.actualReturnDate && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                    <p className="text-sm font-medium text-gray-800">样机归还</p>
                    <p className="text-xs text-gray-500">{formatDate(loan.actualReturnDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 续借弹窗 */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-6">申请续借</h3>

            <div className="space-y-4">
              <div>
                <label className="label-base">续借时长</label>
                <select
                  value={renewDays}
                  onChange={(e) => setRenewDays(parseInt(e.target.value))}
                  className="input-base"
                >
                  <option value={3}>3 天</option>
                  <option value={7}>7 天</option>
                  <option value={14}>14 天</option>
                  <option value={30}>30 天</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  新的预计归还日期: {formatDate(addDays(loan.expectedReturnDate, renewDays))}
                </p>
              </div>

              <div>
                <label className="label-base">续借原因</label>
                <textarea
                  value={renewReason}
                  onChange={(e) => setRenewReason(e.target.value)}
                  placeholder="请说明续借原因..."
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRenewModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRenewal}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
