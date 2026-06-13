import { ProcessRecord } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { User, MessageSquare, Home, Clock, CheckCircle } from 'lucide-react';

interface TimelineProps {
  records: ProcessRecord[];
}

export default function Timeline({ records }: TimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无处理记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
      <div className="space-y-6">
        {records.map((record, index) => (
          <div key={record.id} className="relative pl-10">
            <div className={`absolute left-2 w-5 h-5 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center ${
              record.actualVisitTime ? 'bg-emerald-500 border-emerald-400' : ''
            }`}>
              {record.actualVisitTime ? (
                <CheckCircle className="w-3 h-3 text-white" />
              ) : (
                <Clock className="w-3 h-3 text-blue-400" />
              )}
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{formatDateTime(record.createdAt)}</span>
                {record.actualVisitTime ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    已回访
                  </span>
                ) : (
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    待回访
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400">联系对象：</span>
                    <span className="text-white">{record.contactPerson}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400">劝阻结果：</span>
                    <span className="text-white">{record.persuasionResult}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400">是否上门：</span>
                    <span className={record.needHomeVisit ? 'text-orange-400' : 'text-slate-300'}>
                      {record.needHomeVisit ? '是' : '否'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400">承诺整改时间：</span>
                    <span className={new Date() > new Date(record.promisedTime) && !record.actualVisitTime ? 'text-red-400' : 'text-white'}>
                      {formatDateTime(record.promisedTime)}
                    </span>
                  </div>
                </div>
                {record.remark && (
                  <div className="pt-2 border-t border-slate-700/50 mt-2">
                    <p className="text-slate-300">{record.remark}</p>
                  </div>
                )}
                {record.actualVisitTime && (
                  <div className="pt-2 border-t border-emerald-500/20 mt-2">
                    <p className="text-emerald-400 text-sm">
                      实际回访时间：{formatDateTime(record.actualVisitTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {index < records.length - 1 && <div className="h-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}
