import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/store/useAppStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDateTime, isOverdue, getOverdueHours } from '@/utils/dateUtils';
import { INTERFACE_TYPE_LABELS } from '@/types';

export default function ReturnList() {
  const { currentUser, borrowRecords, getCableById } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  const toReturnRecords = borrowRecords
    .filter(r => r.status === 'borrowing')
    .sort((a, b) => {
      const aOverdue = isOverdue(a.expectedReturn);
      const bOverdue = isOverdue(b.expectedReturn);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.expectedReturn).getTime() - new Date(b.expectedReturn).getTime();
    });

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">归还登记</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {toReturnRecords.length} 条待归还记录
          </p>
        </div>

        {toReturnRecords.length > 0 ? (
          <div className="space-y-4">
            {toReturnRecords.map(record => {
              const cable = getCableById(record.cableId);
              const isOverdueRecord = isOverdue(record.expectedReturn);
              const overdueHours = getOverdueHours(record.expectedReturn);

              return (
                <div
                  key={record.id}
                  className={`bg-white rounded-2xl border ${isOverdueRecord ? 'border-red-200' : 'border-gray-200'} overflow-hidden`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {cable && (
                      <div className="sm:w-40 h-40 sm:h-auto bg-gray-100 flex-shrink-0">
                        <img
                          src={cable.photoUrl}
                          alt={cable.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{cable?.code}</h3>
                            {cable && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {INTERFACE_TYPE_LABELS[cable.interfaceType]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {record.employeeName} · {record.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={isOverdueRecord ? 'overdue' : 'borrowing'} type="borrow" />
                          {isOverdueRecord && (
                            <p className="text-xs text-red-600 mt-1">
                              已逾期 {overdueHours} 小时
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 text-xs">设备</p>
                          <p className="text-gray-900">{record.device}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">用途</p>
                          <p className="text-gray-900">{record.purpose}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">借用时间</p>
                          <p className="font-mono text-gray-900">{formatDateTime(record.borrowTime)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">预计归还</p>
                          <p className={`font-mono ${isOverdueRecord ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDateTime(record.expectedReturn)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          to={`/return/${record.id}`}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                          去归还
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无待归还记录</h3>
            <p className="text-gray-500 text-sm">所有借用的线材都已归还，太棒了！</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
