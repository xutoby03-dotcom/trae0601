import { Link, Navigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, Calendar, User, Building2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, isOverdue, getOverdueHours } from '@/utils/dateUtils';
import { INTERFACE_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '@/types';

export default function MyBorrow() {
  const { currentUser, borrowRecords, getCableById } = useAppStore();

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  const myRecords = borrowRecords
    .filter(r => r.employeeNo === currentUser.employeeNo)
    .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime());

  const activeRecords = myRecords.filter(r => r.status === 'borrowing');
  const historyRecords = myRecords.filter(r => r.status === 'returned');

  const getStatusWithOverdue = (record: typeof myRecords[0]) => {
    if (record.status === 'borrowing' && isOverdue(record.expectedReturn)) {
      return 'overdue';
    }
    return record.status;
  };

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的借用</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {myRecords.length} 条记录 · {activeRecords.length} 条正在借用
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">借用中</p>
                <p className="text-3xl font-bold">{activeRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm">已归还</p>
                <p className="text-3xl font-bold">{historyRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-red-100 text-sm">已逾期</p>
                <p className="text-3xl font-bold">
                  {activeRecords.filter(r => isOverdue(r.expectedReturn)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeRecords.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">正在借用</h2>
            <div className="space-y-4">
              {activeRecords.map(record => {
                const cable = getCableById(record.cableId);
                const isOverdueRecord = isOverdue(record.expectedReturn);
                const overdueHours = getOverdueHours(record.expectedReturn);
                
                return (
                  <div key={record.id} className={`bg-white rounded-2xl border ${isOverdueRecord ? 'border-red-200' : 'border-gray-200'} overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row">
                      {cable && (
                        <div className="sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
                          <img src={cable.photoUrl} alt={cable.code} className="w-full h-full object-cover" />
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
                              {cable?.power}W · {cable?.length}m
                            </p>
                          </div>
                          <StatusBadge status={getStatusWithOverdue(record)} type="borrow" />
                        </div>

                        {isOverdueRecord && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>已逾期 {overdueHours} 小时，请尽快归还</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">借用时间</p>
                              <p className="font-mono text-gray-900">{formatDateTime(record.borrowTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">预计归还</p>
                              <p className={`font-mono ${isOverdueRecord ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatDateTime(record.expectedReturn)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">设备</p>
                              <p className="text-gray-900">{record.device}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">用途</p>
                              <p className="text-gray-900">{record.purpose}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Link
                            to={`/return/${record.id}`}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                          >
                            立即归还
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {historyRecords.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">历史记录</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">线材</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">接口</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">借用时间</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">归还时间</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">设备</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">异常</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {historyRecords.map(record => {
                      const cable = getCableById(record.cableId);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{cable?.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {cable && INTERFACE_TYPE_LABELS[cable.interfaceType]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                            {formatDateTime(record.borrowTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                            {record.returnTime && formatDateTime(record.returnTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.device}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={record.status} type="borrow" size="sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.damageType ? (
                              <span className="text-orange-600">{DAMAGE_TYPE_LABELS[record.damageType]}</span>
                            ) : (
                              <span className="text-green-600">正常</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {myRecords.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无借用记录</h3>
            <p className="text-gray-500 text-sm mb-4">去看看有哪些可借用的线材吧</p>
            <Link
              to="/borrow"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              去借线
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
