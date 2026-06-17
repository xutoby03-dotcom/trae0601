import { useState, useMemo } from 'react';
import { CheckSquare, Check, X, ShieldAlert, User } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, SecurityBadge } from '../components/ui/Badges';
import { useAppStore } from '../store/useAppStore';
import { formatDateTime } from '../utils';
import type { BorrowRecord } from '../types';

export function BorrowApprove() {
  const currentUser = useAppStore((s) => s.currentUser);
  const borrowRecords = useAppStore((s) => s.borrowRecords);
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const approveBorrow = useAppStore((s) => s.approveBorrow);
  const rejectBorrow = useAppStore((s) => s.rejectBorrow);
  const managerApproveBorrow = useAppStore((s) => s.managerApproveBorrow);
  const confirmBorrowed = useAppStore((s) => s.confirmBorrowed);

  const processable = useMemo(
    () => borrowRecords.filter((r) => r.status === '待审批' || r.status === '已通过'),
    [borrowRecords]
  );
  const pending = useMemo(() => borrowRecords.filter((r) => r.status === '待审批'), [borrowRecords]);
  const [remark, setRemark] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'needManager' | 'normal' | 'approved'>('all');

  const filtered = processable.filter((r) => {
    if (filter === 'needManager') return r.needsManagerApproval;
    if (filter === 'normal') return !r.needsManagerApproval;
    if (filter === 'approved') return r.status === '已通过';
    return true;
  });

  const getBoxSecurityLevel = (archiveBoxId: string) => {
    const box = archiveBoxes.find((b) => b.id === archiveBoxId);
    return box?.securityLevel || '普通';
  };

  const handleApprove = (record: BorrowRecord) => {
    if (record.needsManagerApproval && !record.managerApproved) {
      managerApproveBorrow(record.id, currentUser.id, currentUser.realName);
    } else {
      approveBorrow(record.id, currentUser.id, currentUser.realName, remark || undefined);
    }
    setActiveId(null);
    setRemark('');
  };

  const handleReject = (record: BorrowRecord) => {
    rejectBorrow(record.id, currentUser.id, currentUser.realName, remark || undefined);
    setActiveId(null);
    setRemark('');
  };

  const handleConfirmBorrowed = (record: BorrowRecord) => {
    confirmBorrowed(record.id);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="借阅审批"
        subtitle={`待审批 ${pending.length} 条，已通过待借出 ${borrowRecords.filter((r) => r.status === '已通过').length} 条`}
        actions={
          <div className="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden text-sm">
            {(['all', 'needManager', 'normal', 'approved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 transition-colors ${
                  filter === f ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? '全部' : f === 'needManager' ? '需主管审批' : f === 'normal' ? '普通审批' : '已通过待借出'}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckSquare size={40} className="mx-auto text-green-400 mb-3" />
          <p className="text-navy-700 font-medium mb-1">
            {filter === 'approved' ? '暂无已通过待借出的申请' : '暂无待审批申请'}
          </p>
          <p className="text-sm text-gray-500">
            {filter === 'approved' ? '审批通过的申请会在此处等待借出确认' : '所有借阅申请已处理完毕'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((record, idx) => {
            const needsManager = record.needsManagerApproval && !record.managerApproved;
            const isApproved = record.status === '已通过';
            const isPending = record.status === '待审批';
            const isActive = activeId === record.id || activeId === record.id + '_reject';
            const securityLevel = getBoxSecurityLevel(record.archiveBoxId);
            return (
              <div
                key={record.id}
                className="card p-5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-serif text-base font-semibold text-navy-900">{record.boxNumber}</h4>
                      <StatusBadge status={record.status} />
                      {record.needsManagerApproval && record.managerApproved && (
                        <span className="badge bg-green-50 text-green-700 border border-green-200">主管已确认</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">申请时间：{formatDateTime(record.createdAt)}</p>
                  </div>
                  {record.needsManagerApproval && (
                    <span className="badge bg-gold-50 text-gold-700 border border-gold-200">
                      <ShieldAlert size={12} />
                      需主管审批
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      <span className="text-navy-800 font-medium">{record.borrowerName}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      {record.borrowerDepartment}
                    </span>
                  </div>
                  <div className="text-gray-600">预计归还：{record.expectedReturnDate}</div>
                  <div className="text-gray-600">带出办公室：{record.allowTakeOut ? '是' : '否'}</div>
                  <div className="flex items-center gap-2">
                    <SecurityBadge level={securityLevel} />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md mb-4">
                  <p className="text-xs text-gray-500 mb-1">借阅用途</p>
                  <p className="text-sm text-navy-800">{record.purpose}</p>
                </div>

                {!isActive ? (
                  <div className="flex gap-2">
                    {isApproved && (
                      <button onClick={() => handleConfirmBorrowed(record)} className="btn-gold flex-1">
                        <Check size={14} />
                        确认借出
                      </button>
                    )}
                    {isPending && (
                      <>
                        <button onClick={() => setActiveId(record.id)} className="btn-primary flex-1">
                          <Check size={14} />
                          {needsManager ? '主管确认' : '审批通过'}
                        </button>
                        <button onClick={() => setActiveId(record.id + '_reject')} className="btn-danger flex-1">
                          <X size={14} />
                          驳回
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="label-base">审批意见（可选）</label>
                      <textarea
                        rows={2}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="请输入审批意见..."
                        className="input-base resize-none text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveId(null); setRemark(''); }} className="btn-secondary flex-1">
                        取消
                      </button>
                      {activeId.endsWith('_reject') ? (
                        <button onClick={() => handleReject(record)} className="btn-danger flex-1">
                          <X size={14} />
                          确认驳回
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(record)} className="btn-primary flex-1">
                          <Check size={14} />
                          {needsManager ? '确认主管审批' : '确认通过'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
