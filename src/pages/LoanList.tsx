import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText, User, Calendar, DollarSign, Eye, ArrowRight } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate, formatMoney, getDaysUntilReturn, isOverdue, isDueSoon } from '../utils';
import type { LoanStatus } from '../types';

export default function LoanList() {
  const navigate = useNavigate();
  const { loans, devices, customers, employees } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all');

  const filteredLoans = loans.filter((loan) => {
    const device = devices.find((d) => d.id === loan.deviceId);
    const customer = customers.find((c) => c.id === loan.customerId);
    const matchesSearch =
      device?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device?.deviceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter ||
      (statusFilter === 'overdue' && isOverdue(loan.expectedReturnDate, loan.status));
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { value: LoanStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: '全部', count: loans.length },
    { value: 'active', label: '进行中', count: loans.filter(l => l.status === 'active').length },
    { value: 'overdue', label: '已逾期', count: loans.filter(l => isOverdue(l.expectedReturnDate, l.status)).length },
    { value: 'returned', label: '已归还', count: loans.filter(l => l.status === 'returned').length },
  ];

  return (
    <PageContainer title="借出管理" subtitle="管理所有样机借出记录">
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

          <button
            onClick={() => navigate('/loans/new')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建借出
          </button>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex gap-3 mb-6">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === option.value
                ? 'bg-primary-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === option.value ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* 借出列表 */}
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
                  借出日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预计归还
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  押金
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  负责人
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
              {filteredLoans.map((loan) => {
                const device = devices.find((d) => d.id === loan.deviceId);
                const customer = customers.find((c) => c.id === loan.customerId);
                const employee = employees.find((e) => e.id === loan.employeeId);
                const overdue = isOverdue(loan.expectedReturnDate, loan.status);
                const dueSoon = isDueSoon(loan.expectedReturnDate, loan.status);
                const daysLeft = getDaysUntilReturn(loan.expectedReturnDate);

                return (
                  <tr
                    key={loan.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      overdue ? 'bg-danger-50/30' : ''
                    }`}
                    onClick={() => navigate(`/loans/${loan.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          overdue ? 'bg-danger-100' : 'bg-primary-50'
                        }`}>
                          <FileText className={`w-5 h-5 ${overdue ? 'text-danger-600' : 'text-primary-600'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{device?.name}</div>
                          <div className="text-xs text-gray-400">{device?.deviceNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{customer?.name}</div>
                        <div className="text-xs text-gray-500">{customer?.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(loan.loanDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">{formatDate(loan.expectedReturnDate)}</div>
                      {loan.status !== 'returned' && (
                        <div className={`text-xs font-medium ${
                          overdue ? 'text-danger-600' : dueSoon ? 'text-warning-600' : 'text-gray-400'
                        }`}>
                          {overdue ? `已逾期 ${Math.abs(daysLeft)} 天` : dueSoon ? `还剩 ${daysLeft} 天` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {formatMoney(loan.deposit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {employee?.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{employee?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={overdue ? 'overdue' : loan.status}
                        type="loan"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/loans/${loan.id}`);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          详情
                        </button>
                        {loan.status !== 'returned' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/loans/${loan.id}/return`);
                            }}
                            className="text-success-600 hover:text-success-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <ArrowRight className="w-4 h-4" />
                            归还
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>没有找到匹配的借出记录</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
