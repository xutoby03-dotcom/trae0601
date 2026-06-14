import { useEffect, useState } from 'react';
import { Plus, Filter, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatCurrency,
  formatDateTime,
  getTransactionLabel,
  getTransactionColor,
} from '@/utils/format';
import type { TransactionType } from '../../shared/types';

export default function TransactionList() {
  const navigate = useNavigate();
  const { transactions, fetchTransactions, registers, fetchRegisters } = useAppStore();
  const [filterType, setFilterType] = useState<TransactionType | ''>('');

  useEffect(() => {
    fetchTransactions();
    fetchRegisters();
  }, [fetchTransactions, fetchRegisters]);

  const filtered = filterType
    ? transactions.filter((t) => t.type === filterType)
    : transactions;

  const registerMap = new Map(registers.map((r) => [r.id, r.code]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">资金异动</h1>
          <p className="text-sm text-gray-500 mt-1">临时借出、补零和银行存入记录</p>
        </div>
        <button
          onClick={() => navigate('/transactions/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">新建异动</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-warm-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">类型：</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterType === ''
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-warm-50'
              }`}
            >
              全部
            </button>
            {(['loan', 'replenish', 'deposit'] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === t
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-warm-50'
                }`}
              >
                {getTransactionLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">暂无异动记录</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">类型</th>
                  <th className="px-5 py-3 font-medium">收银台</th>
                  <th className="px-5 py-3 font-medium text-right">金额</th>
                  <th className="px-5 py-3 font-medium">操作人</th>
                  <th className="px-5 py-3 font-medium">备注</th>
                  <th className="px-5 py-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTransactionColor(t.type)}`}>
                        {getTransactionLabel(t.type)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">
                        {registerMap.get(t.registerId) || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          t.type === 'deposit'
                            ? 'text-sky-600'
                            : t.type === 'loan'
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {t.type === 'loan' ? '-' : '+'}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{t.operator}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {t.note || '--'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm">
                      {formatDateTime(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
