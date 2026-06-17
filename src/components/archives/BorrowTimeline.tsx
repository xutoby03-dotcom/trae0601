import { FileUp, CheckCircle, XCircle, RotateCcw, Clock } from 'lucide-react';
import type { BorrowRecord } from '../../types';
import { StatusBadge } from '../ui/Badges';
import { formatDateTime } from '../../utils';

interface BorrowTimelineProps {
  records: BorrowRecord[];
}

const statusIcon: Record<string, typeof FileUp> = {
  '待审批': Clock,
  '已通过': CheckCircle,
  '已驳回': XCircle,
  '借出中': FileUp,
  '已归还': RotateCcw,
  '已逾期': Clock,
};

export function BorrowTimeline({ records }: BorrowTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        暂无借阅记录
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100" />
      <div className="space-y-5">
        {records.map((record, idx) => {
          const Icon = statusIcon[record.status] || Clock;
          return (
            <div key={record.id} className="relative pl-12 animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                <Icon size={14} className="text-navy-600" />
              </div>
              <div className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-navy-800">{record.borrowerName}</span>
                      <span className="text-xs text-gray-400">{record.borrowerDepartment}</span>
                    </div>
                    <p className="text-xs text-gray-500">申请时间：{formatDateTime(record.createdAt)}</p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
                <p className="text-sm text-gray-700 mb-2">用途：{record.purpose}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>预计归还：{record.expectedReturnDate}</span>
                  <span>{record.allowTakeOut ? '允许带出' : '限室内查阅'}</span>
                  {record.needsManagerApproval && (
                    <span className="text-gold-700">需主管审批</span>
                  )}
                </div>
                {record.returnCheck && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs">
                    <p className="font-medium text-navy-700 mb-1">归还检查：</p>
                    <div className="flex flex-wrap gap-3 text-gray-600">
                      <span>封条：{record.returnCheck.sealIntact ? '完好' : '异常'}</span>
                      <span>页数：{record.returnCheck.pagesComplete ? '完整' : '缺失'}</span>
                      <span>柜位：{record.returnCheck.cabinetCorrect ? '正确' : '错误'}</span>
                      <span>检查人：{record.returnCheck.checkerName}</span>
                    </div>
                    {record.returnCheck.remarks && (
                      <p className="mt-1 text-gold-700">备注：{record.returnCheck.remarks}</p>
                    )}
                  </div>
                )}
                {record.approverName && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    审批人：{record.approverName}
                    {record.approvalRemark && ` · 意见：${record.approvalRemark}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
