import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Gift, Eye, ChevronDown, ChevronUp, Calendar, DollarSign, Users } from 'lucide-react';
import { billApi, employeeApi } from '../services/api';
import type { Bill, BillDetail, Employee } from '../../shared/types';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [expandedBill, setExpandedBill] = useState<number | null>(null);
  const [billDetail, setBillDetail] = useState<BillDetail | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState('');
  const [remarkInput, setRemarkInput] = useState('');

  useEffect(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const defaultMonth = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(defaultMonth);
    setGenerateMonth(defaultMonth);
    loadData(defaultMonth);
  }, []);

  async function loadData(month?: string) {
    const [bills, employees] = await Promise.all([
      billApi.getAll(month ? { month } : undefined),
      employeeApi.getAll(),
    ]);
    setBills(bills);
    setEmployees(employees);
  }

  async function handleMonthChange(month: string) {
    setSelectedMonth(month);
    loadData(month);
  }

  async function handleViewDetail(id: number) {
    if (expandedBill === id) {
      setExpandedBill(null);
      setBillDetail(null);
    } else {
      const detail = await billApi.getOne(id);
      setBillDetail(detail);
      setExpandedBill(id);
    }
  }

  async function handleUpdateStatus(id: number, status: 'paid' | 'pending' | 'waived', remark?: string) {
    try {
      await billApi.updateStatus(id, status, remark);
      loadData(selectedMonth);
      if (expandedBill === id) {
        const detail = await billApi.getOne(id);
        setBillDetail(detail);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleGenerateBills() {
    if (!generateMonth) return;
    try {
      await billApi.generate(generateMonth);
      setShowGenerateModal(false);
      loadData(generateMonth);
      setSelectedMonth(generateMonth);
    } catch (err: any) {
      alert(err.message);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle, text: '已付款', color: 'bg-success-100 text-success-600' };
      case 'pending':
        return { icon: Clock, text: '待催收', color: 'bg-warning-100 text-warning-600' };
      case 'partial':
        return { icon: DollarSign, text: '部分付款', color: 'bg-primary-100 text-primary-600' };
      case 'waived':
        return { icon: Gift, text: '已免单', color: 'bg-gray-100 text-gray-600' };
      default:
        return { icon: Clock, text: status, color: 'bg-gray-100 text-gray-600' };
    }
  }

  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const totalStats = {
    total: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    paid: bills.reduce((sum, b) => sum + b.paidAmount, 0),
    unpaid: bills.reduce((sum, b) => sum + b.unpaidAmount, 0),
    count: bills.length,
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-gray-800 mb-2">账单管理</h1>
            <p className="text-gray-500">管理员工月度账单和收款状态</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all active:scale-98"
          >
            <Calendar className="w-5 h-5" />
            生成账单
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">账单总数</p>
            <p className="font-display text-3xl text-gray-800">{totalStats.count}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">应收款总额</p>
            <p className="font-display text-3xl text-primary-600">¥{totalStats.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">已收款</p>
            <p className="font-display text-3xl text-success-600">¥{totalStats.paid.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">待收款</p>
            <p className="font-display text-3xl text-danger-600">¥{totalStats.unpaid.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-100 rounded-xl bg-white focus:border-primary-400 focus:outline-none"
            >
              {months.map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{bills.length} 位员工</span>
          </div>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">本月暂无账单</p>
              <p className="text-sm text-gray-400 mt-1">点击右上角"生成账单"创建本月账单</p>
            </div>
          ) : (
            bills.map((bill, idx) => {
              const badge = getStatusBadge(bill.status);
              const BadgeIcon = badge.icon;
              const progress = bill.totalAmount > 0 ? (bill.paidAmount / bill.totalAmount) * 100 : 0;
              const isExpanded = expandedBill === bill.id;
              const emp = employees.find(e => e.id === bill.employeeId);

              return (
                <div
                  key={bill.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                        <span className="font-display text-xl text-primary-600">{bill.employee?.name?.[0] || emp?.name?.[0] || '?'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-lg text-gray-800">
                            {bill.employee?.name || emp?.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {bill.employee?.department?.name || emp?.department?.name} · {bill.month}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl text-gray-800">¥{bill.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          已付 ¥{bill.paidAmount.toFixed(2)} · 欠 ¥{bill.unpaidAmount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewDetail(bill.id)}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{Math.round(progress)}%</p>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && billDetail && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                      <h4 className="font-medium text-gray-800 mb-4">账单明细</h4>
                      <div className="space-y-3">
                        {billDetail.transactions.map(t => (
                          <div key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                            <img src={t.product?.photo} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-800">{t.product?.name}</p>
                              <p className="text-xs text-gray-500">{t.product?.flavor} · {t.createdAt.split(' ')[0]}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">x{t.quantity}</p>
                              <p className="text-sm text-primary-600">¥{t.totalAmount.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6">
                        <input
                          type="text"
                          value={remarkInput}
                          onChange={(e) => setRemarkInput(e.target.value)}
                          placeholder="备注（如：已微信转账、请客免单等）"
                          className="flex-1 px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none text-sm"
                        />
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => { handleUpdateStatus(bill.id, 'paid', remarkInput || undefined); setRemarkInput(''); }}
                            className="px-4 py-2 bg-success-500 text-white rounded-xl hover:bg-success-600 transition-colors text-sm font-medium"
                          >
                            标记已付款
                          </button>
                        )}
                        {bill.status !== 'waived' && (
                          <button
                            onClick={() => { handleUpdateStatus(bill.id, 'waived', remarkInput || undefined); setRemarkInput(''); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            标记免单
                          </button>
                        )}
                        {bill.status === 'paid' && (
                          <button
                            onClick={() => { handleUpdateStatus(bill.id, 'pending', remarkInput || undefined); setRemarkInput(''); }}
                            className="px-4 py-2 bg-warning-500 text-white rounded-xl hover:bg-warning-600 transition-colors text-sm font-medium"
                          >
                            标记待催收
                          </button>
                        )}
                      </div>

                      {bill.remark && (
                        <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">备注：</span>{bill.remark}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md animate-slide-up">
            <h2 className="font-display text-2xl text-gray-800 mb-6">生成月度账单</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">选择月份</label>
                <select
                  value={generateMonth}
                  onChange={(e) => setGenerateMonth(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary-400 focus:outline-none"
                >
                  {months.map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500">
                系统将自动汇总 {generateMonth} 月所有未入账的取货记录，按员工生成账单。
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerateBills}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-200 transition-all"
                >
                  生成账单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
