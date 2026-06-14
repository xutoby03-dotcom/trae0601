import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { TransactionType } from '../../shared/types';
import { getTransactionLabel, getTransactionColor } from '@/utils/format';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { registers, fetchRegisters, createTransaction } = useAppStore();
  const [type, setType] = useState<TransactionType>('replenish');
  const [registerId, setRegisterId] = useState('');
  const [amount, setAmount] = useState(0);
  const [operator, setOperator] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!registerId) e.registerId = '请选择收银台';
    if (amount <= 0) e.amount = '金额必须大于0';
    if (!operator.trim()) e.operator = '请输入操作人姓名';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createTransaction({ type, registerId, amount, operator, note: note || undefined });
      navigate('/transactions');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/transactions')}
          className="p-2 rounded-lg text-gray-500 hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">新建资金异动</h1>
          <p className="text-sm text-gray-500 mt-1">登记备用金相关的资金变动</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            异动类型 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['loan', 'replenish', 'deposit'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  type === t
                    ? `${getTransactionColor(t)} border-transparent`
                    : 'border-warm-200 text-gray-600 hover:bg-warm-50'
                }`}
              >
                {getTransactionLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            收银台 <span className="text-red-500">*</span>
          </label>
          <select
            value={registerId}
            onChange={(e) => setRegisterId(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              errors.registerId ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
            }`}
          >
            <option value="">请选择收银台</option>
            {registers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.managerName}
              </option>
            ))}
          </select>
          {errors.registerId && <p className="text-xs text-red-500 mt-1">{errors.registerId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            金额（元） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="请输入金额"
            className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              errors.amount ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
            }`}
          />
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            操作人 <span className="text-red-500">*</span>
          </label>
          <input
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder="请输入操作人姓名"
            className={`w-full md:w-1/2 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              errors.operator ? 'border-red-400' : 'border-warm-200 focus:border-primary-400'
            }`}
          />
          {errors.operator && <p className="text-xs text-red-500 mt-1">{errors.operator}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="可选，说明异动原因等..."
            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="px-5 py-2 rounded-lg border border-warm-200 text-gray-600 hover:bg-warm-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
