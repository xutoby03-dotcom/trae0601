import { useState, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  FileX,
  CheckCircle,
  Eye,
  Check,
  X,
  ChevronDown,
  Store,
  Users,
  Calendar,
  Wallet,
} from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { StatusTag, InvoiceStatusTag } from '@/components/StatusTag';
import { Modal } from '@/components/Modal';
import type { Reimbursement } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, formatAmount, formatDateTime } from '@/utils/format';

type TabType = 'pending' | 'over-standard' | 'missing-invoice' | 'completed';

const tabs: { key: TabType; label: string; icon: typeof Clock; color: string }[] = [
  { key: 'pending', label: '待处理', icon: Clock, color: 'text-amber-600' },
  { key: 'over-standard', label: '超标准', icon: AlertTriangle, color: 'text-orange-600' },
  { key: 'missing-invoice', label: '缺发票', icon: FileX, color: 'text-red-600' },
  { key: 'completed', label: '已完成', icon: CheckCircle, color: 'text-emerald-600' },
];

export function ReviewPage() {
  const {
    reimbursements,
    projects,
    approveReimbursement,
    rejectReimbursement,
    batchApproveByProject,
    settleReimbursement,
    isOverStandard,
    getPendingCount,
    getOverStandardCount,
    getMissingInvoiceCount,
  } = useReimbursementStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<Reimbursement | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string>('');

  const pendingCount = getPendingCount();
  const overStandardCount = getOverStandardCount();
  const missingInvoiceCount = getMissingInvoiceCount();
  const completedCount = useMemo(
    () => reimbursements.filter((r) => r.status === 'approved' || r.status === 'settled').length,
    [reimbursements]
  );

  const tabCounts: Record<TabType, number> = {
    pending: pendingCount,
    'over-standard': overStandardCount,
    'missing-invoice': missingInvoiceCount,
    completed: completedCount,
  };

  const filteredList = useMemo(() => {
    let list = reimbursements;

    switch (activeTab) {
      case 'pending':
        list = list.filter((r) => r.status === 'pending');
        break;
      case 'over-standard':
        list = list.filter(
          (r) => r.status === 'pending' && isOverStandard(r.amount, r.peopleCount, r.projectId)
        );
        break;
      case 'missing-invoice':
        list = list.filter((r) => r.status === 'pending' && r.invoiceStatus === 'missing');
        break;
      case 'completed':
        list = list.filter((r) => r.status === 'approved' || r.status === 'settled');
        break;
    }

    if (selectedProject) {
      list = list.filter((r) => r.projectId === selectedProject);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeTab, reimbursements, selectedProject, isOverStandard]);

  const pendingByProject = useMemo(() => {
    const result: { projectId: string; projectName: string; count: number; amount: number }[] = [];
    const projectMap = new Map<string, { count: number; amount: number }>();

    reimbursements
      .filter((r) => r.status === 'pending' && r.invoiceStatus !== 'missing')
      .forEach((r) => {
        const existing = projectMap.get(r.projectId) || { count: 0, amount: 0 };
        projectMap.set(r.projectId, {
          count: existing.count + 1,
          amount: existing.amount + r.amount,
        });
      });

    projectMap.forEach((value, projectId) => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        result.push({
          projectId,
          projectName: project.name,
          count: value.count,
          amount: value.amount,
        });
      }
    });

    return result;
  }, [reimbursements, projects]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map((r) => r.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleApprove = (id: string) => {
    approveReimbursement(id);
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (rejectingId && rejectReason.trim()) {
      rejectReimbursement(rejectingId, rejectReason);
      setRejectModalOpen(false);
      setRejectingId('');
      setRejectReason('');
    }
  };

  const handleBatchApprove = () => {
    if (selectedProject) {
      const count = batchApproveByProject(selectedProject);
      setSelectedIds(new Set());
      alert(`已批量通过 ${count} 条报销单`);
    }
  };

  const handleSettle = (id: string) => {
    settleReimbursement(id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">审核管理</h1>
        <p className="text-gray-500 mt-1">审核加班餐报销申请，支持批量操作</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedIds(new Set());
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px',
                    isActive
                      ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {tabCounts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedIds(new Set());
                }}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              >
                <option value="">全部项目</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {activeTab === 'pending' && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredList.length && filteredList.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                全选
                {selectedIds.size > 0 && (
                  <span className="text-teal-600">已选 {selectedIds.size} 条</span>
                )}
              </label>
            )}
          </div>

          {activeTab === 'pending' && selectedProject && (
            <button
              onClick={handleBatchApprove}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              按项目批量通过
            </button>
          )}
        </div>

        {activeTab === 'pending' && pendingByProject.length > 0 && (
          <div className="p-4 bg-amber-50/50 border-b border-amber-100">
            <p className="text-sm text-amber-800 font-medium mb-2">各项目待审核统计（可批量过单）</p>
            <div className="flex flex-wrap gap-2">
              {pendingByProject.map((item) => (
                <button
                  key={item.projectId}
                  onClick={() => setSelectedProject(item.projectId)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-colors',
                    selectedProject === item.projectId
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  )}
                >
                  {item.projectName}: {item.count} 单 / {formatAmount(item.amount)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100 max-h-[calc(100vh-380px)] overflow-y-auto">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">暂无数据</p>
            </div>
          ) : (
            filteredList.map((item) => {
              const isOver = isOverStandard(item.amount, item.peopleCount, item.projectId);
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-4 hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-teal-50/50'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {activeTab === 'pending' && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-4 h-4 mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{item.shopName}</h3>
                            <StatusTag status={item.status} />
                            <InvoiceStatusTag status={item.invoiceStatus} />
                            {isOver && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                超标
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(item.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {item.peopleCount} 人
                            </span>
                            <span className="flex items-center gap-1">
                              <Store className="w-3.5 h-3.5" />
                              {item.projectName}
                            </span>
                            <span>{item.employeeName} 提交</span>
                          </div>
                          {item.overStandardReason && (
                            <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                              <p className="text-xs text-orange-700">
                                <span className="font-medium">超标原因：</span>
                                {item.overStandardReason}
                              </p>
                            </div>
                          )}
                          {item.reviewComment && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">审核意见：</span>
                                {item.reviewComment}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900 font-mono tabular-nums">
                            {formatAmount(item.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          查看详情
                        </button>

                        {activeTab === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReject(item.id)}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              驳回
                            </button>
                            <button
                              onClick={() => handleApprove(item.id)}
                              disabled={item.invoiceStatus === 'missing'}
                              className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1',
                                item.invoiceStatus === 'missing'
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-teal-600 text-white hover:bg-teal-700'
                              )}
                            >
                              <Check className="w-4 h-4" />
                              通过
                            </button>
                            {item.invoiceStatus === 'missing' && (
                              <span className="text-xs text-red-500">缺发票不可结算</span>
                            )}
                          </div>
                        )}

                        {activeTab === 'completed' && item.status === 'approved' && (
                          <button
                            onClick={() => handleSettle(item.id)}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 bg-cyan-600 text-white hover:bg-cyan-700"
                          >
                            <Wallet className="w-4 h-4" />
                            结算
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title="报销单详情">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">店铺名称</p>
                <p className="font-medium text-gray-900 mt-1">{detailItem.shopName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">用餐日期</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(detailItem.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">所属项目</p>
                <p className="font-medium text-gray-900 mt-1">{detailItem.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">所属部门</p>
                <p className="font-medium text-gray-900 mt-1">{detailItem.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">提交人</p>
                <p className="font-medium text-gray-900 mt-1">{detailItem.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">用餐人数</p>
                <p className="font-medium text-gray-900 mt-1">{detailItem.peopleCount} 人</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">报销金额</span>
                <span className="text-2xl font-bold text-gray-900 font-mono">
                  {formatAmount(detailItem.amount)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusTag status={detailItem.status} />
                <InvoiceStatusTag status={detailItem.invoiceStatus} />
              </div>
            </div>

            {detailItem.overStandardReason && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-amber-800 mb-1">超标原因</p>
                <p className="text-sm text-amber-700">{detailItem.overStandardReason}</p>
              </div>
            )}

            {detailItem.reviewComment && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-1">审核意见</p>
                <p className="text-sm text-gray-600">{detailItem.reviewComment}</p>
              </div>
            )}

            {detailItem.reviewedAt && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm font-medium text-emerald-800 mb-2">审核信息</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-600">审核人</p>
                    <p className="text-sm font-medium text-emerald-900 mt-0.5">
                      {detailItem.reviewer || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600">审核时间</p>
                    <p className="text-sm font-medium text-emerald-900 mt-0.5">
                      {formatDateTime(detailItem.reviewedAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {detailItem.settledAt && (
              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <p className="text-sm font-medium text-cyan-800 mb-2">结算信息</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cyan-600">结算操作人</p>
                    <p className="text-sm font-medium text-cyan-900 mt-0.5">
                      {detailItem.settledBy || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-cyan-600">结算时间</p>
                    <p className="text-sm font-medium text-cyan-900 mt-0.5">
                      {formatDateTime(detailItem.settledAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">餐单截图</p>
              <img
                src={detailItem.receiptImage}
                alt="餐单截图"
                className="w-full rounded-xl border border-gray-200"
              />
            </div>

            {detailItem.status === 'approved' && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleSettle(detailItem.id)}
                  className="w-full px-4 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  确认结算此报销单
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="驳回申请">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">请填写驳回原因：</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                rejectReason.trim()
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              确认驳回
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
