import { useMemo } from 'react';
import { AlertTriangle, Phone, Clock, Package, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatusTag } from '@/components/StatusTag';
import { formatDateTime, formatCurrency, getDaysOverdue } from '@/utils/helpers';

export function Overdue() {
  const { records, bags, markAsLost, refreshOverdueStatus } = useAppStore();
  
  const overdueRecords = useMemo(() => {
    refreshOverdueStatus();
    return records
      .filter(r => r.status === 'overdue')
      .sort((a, b) => getDaysOverdue(b.expectedReturnTime) - getDaysOverdue(a.expectedReturnTime));
  }, [records, refreshOverdueStatus]);
  
  const handleMarkLost = (recordId: string) => {
    if (confirm('确定要将此记录标记为丢失吗？袋子状态将更新为"丢失"。')) {
      markAsLost(recordId);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </span>
            催还区
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {overdueRecords.length} 个超时未还
          </p>
        </div>
      </div>
      
      {overdueRecords.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{overdueRecords.length} 个保温袋超时</h3>
              <p className="text-white/80 text-sm mt-1">请尽快联系骑手归还，避免资产损失</p>
            </div>
          </div>
        </div>
      )}
      
      {overdueRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-50">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无超时</h3>
          <p className="text-gray-400">所有保温袋都在按时归还中</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overdueRecords.map((record, index) => {
            const bag = bags.find(b => b.id === record.bagId);
            const daysOverdue = getDaysOverdue(record.expectedReturnTime);
            
            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden">
                      {bag?.photo && (
                        <img src={bag.photo} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {daysOverdue}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          {record.riderName}
                          <StatusTag type="platform" status={record.platform} size="sm" />
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{bag?.code} · {bag?.capacity}L</p>
                      </div>
                      <div className="text-right">
                        <StatusTag type="borrow" status={record.status} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          联系电话
                        </p>
                        <p className="font-medium text-gray-700">{record.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">订单号</p>
                        <p className="font-medium text-gray-700 font-mono text-sm">{record.orderNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">押金</p>
                        <p className="font-medium text-primary-600">{formatCurrency(bag?.deposit || 0)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        <span className="text-gray-400">借出时间：</span>
                        {formatDateTime(record.borrowTime)}
                      </div>
                      <div>
                        <span className="text-gray-400">应还时间：</span>
                        <span className="text-red-500 font-medium">{formatDateTime(record.expectedReturnTime)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={`tel:${record.phone}`}
                      className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors text-center text-sm"
                    >
                      电话催还
                    </a>
                    <button
                      onClick={() => handleMarkLost(record.id)}
                      className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      标记丢失
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
