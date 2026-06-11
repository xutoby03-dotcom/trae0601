import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  Clock,
  User,
  Package,
  Check,
  X,
  Search,
  Eye,
  Calendar,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../utils';
import type { RenewalStatus } from '../types';

export default function RenewalList() {
  const navigate = useNavigate();
  const { loans, devices, customers, approveRenewal, rejectRenewal } = useAppStore();
  const [filter, setFilter] = useState<RenewalStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [approveNote, setApproveNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const allRenewals = loans.flatMap((loan) => {
    const device = devices.find((d) => d.id === loan.deviceId);
    const customer = customers.find((c) => c.id === loan.customerId);
    return loan.renewals.map((renewal) => ({
      ...renewal,
      loanId: loan.id,
      device,
      customer,
      loanExpectedReturn: loan.expectedReturnDate,
    }));
  });

  const filteredRenewals = allRenewals.filter((renewal) => {
    const matchesFilter = filter === 'all' || renewal.status === filter;
    const matchesSearch =
      renewal.device?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renewal.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renewal.device?.deviceNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusOptions: { value: RenewalStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: allRenewals.length },
    { value: 'pending', label: '待审批', count: allRenewals.filter(r => r.status === 'pending').length },
    { value: 'approved', label: '已通过', count: allRenewals.filter(r => r.status === 'approved').length },
    { value: 'rejected', label: '已拒绝', count: allRenewals.filter(r => r.status === 'rejected').length },
  ];

  const handleApprove = (loanId: string, renewalId: string) => {
    approveRenewal(loanId, renewalId, approveNote || '同意续借');
    setShowApproveModal(null);
    setApproveNote('');
  };

  const handleReject = (loanId: string, renewalId: string) => {
    rejectRenewal(loanId, renewalId, rejectNote || '不同意续借');
    setShowRejectModal(null);
    setRejectNote('');
  };

  return (
    <PageContainer title="续借管理" subtitle="管理样机续借申请与审批">
      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索样机、客户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex gap-3 mb-6">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === option.value
                ? 'bg-primary-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              filter === option.value ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* 续借列表 */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  样机信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  续借时长
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  原归还日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRenewals.map((renewal) => (
                <tr key={renewal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{renewal.device?.name}</div>
                        <div className="text-xs text-gray-400">{renewal.device?.deviceNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{renewal.customer?.name}</div>
                      <div className="text-xs text-gray-500">{renewal.customer?.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-gray-800">
                      <RotateCcw className="w-4 h-4 text-primary-500" />
                      <span className="font-medium">{renewal.extendDays} 天</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(renewal.loanExpectedReturn)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(renewal.applyDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={renewal.status} type="renewal" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/loans/${renewal.loanId}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </button>
                      {renewal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setShowApproveModal(renewal.id)}
                            className="text-success-600 hover:text-success-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            通过
                          </button>
                          <button
                            onClick={() => setShowRejectModal(renewal.id)}
                            className="text-danger-600 hover:text-danger-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRenewals.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>没有找到匹配的续借记录</p>
          </div>
        )}
      </div>

      {/* 审批通过弹窗 */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">审批通过</h3>
            <p className="text-gray-600 mb-4">确认同意此次续借申请？</p>
            <div>
              <label className="label-base">审批意见</label>
              <textarea
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="请输入审批意见（选填）"
                rows={3}
                className="input-base resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const renewal = allRenewals.find(r => r.id === showApproveModal);
                  if (renewal) {
                    handleApprove(renewal.loanId, renewal.id);
                  }
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认通过
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝弹窗 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">拒绝申请</h3>
            <p className="text-gray-600 mb-4">确认拒绝此次续借申请？</p>
            <div>
              <label className="label-base">拒绝原因 <span className="text-danger-500">*</span></label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="请输入拒绝原因"
                rows={3}
                className="input-base resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const renewal = allRenewals.find(r => r.id === showRejectModal);
                  if (renewal) {
                    handleReject(renewal.loanId, renewal.id);
                  }
                }}
                className="btn-danger flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
