import { FileUp, CheckCircle, XCircle, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
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
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-medium text-navy-700">归还检查</p>
                      {(!record.returnCheck.sealIntact || !record.returnCheck.pagesComplete || !record.returnCheck.cabinetCorrect) && (
                        <span className="badge bg-red-50 text-red-600 border border-red-200 !text-[10px] !py-0">
                          <AlertTriangle size={10} /> 异常
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className={`p-2 rounded-md ${record.returnCheck.sealIntact ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <p className="font-medium">封条</p>
                        <p>{record.returnCheck.sealIntact ? '完好' : '异常'}</p>
                      </div>
                      <div className={`p-2 rounded-md ${record.returnCheck.pagesComplete ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <p className="font-medium">页数</p>
                        <p>{record.returnCheck.pagesComplete ? '完整' : '缺失'}</p>
                      </div>
                      <div className={`p-2 rounded-md ${record.returnCheck.cabinetCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <p className="font-medium">柜位</p>
                        <p>{record.returnCheck.cabinetCorrect ? '正确' : '错误'}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>检查人：{record.returnCheck.checkerName}</p>
                      <p>实际清点：{record.returnCheck.actualPageCount} 页</p>
                      {record.returnCheck.sealRemark && (
                        <p className="text-red-600">封条异常说明：{record.returnCheck.sealRemark}</p>
                      )}
                      {record.returnCheck.missingPages && (
                        <p className="text-red-600">缺页说明：{record.returnCheck.missingPages}</p>
                      )}
                      {record.returnCheck.remarks && (
                        <p className="text-gold-700">备注：{record.returnCheck.remarks}</p>
                      )}
                    </div>
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
