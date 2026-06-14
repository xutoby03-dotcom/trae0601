import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Fuel,
  Ticket,
  ParkingCircle,
  Droplets,
  ShoppingBag,
  Receipt,
  User,
  FileText,
  Trash2,
  Save,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { EXPENSE_TYPE_LABELS, type ExpenseType } from '@/types';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';

const EXPENSE_TYPES: { key: ExpenseType; label: string; icon: typeof Fuel; color: string }[] = [
  { key: 'fuel', label: '油费', icon: Fuel, color: 'orange' },
  { key: 'toll', label: '过路费', icon: Ticket, color: 'blue' },
  { key: 'parking', label: '停车费', icon: ParkingCircle, color: 'green' },
  { key: 'carwash', label: '洗车', icon: Droplets, color: 'cyan' },
  { key: 'supplies', label: '临时用品', icon: ShoppingBag, color: 'purple' },
];

export default function ExpenseEdit() {
  const { id, expenseId } = useParams();
  const navigate = useNavigate();
  const isEdit = expenseId && expenseId !== 'new';
  const getTrip = useTripStore(state => state.getTrip);
  const addExpense = useTripStore(state => state.addExpense);
  const updateExpense = useTripStore(state => state.updateExpense);
  const deleteExpense = useTripStore(state => state.deleteExpense);

  const trip = getTrip(id!);

  const [type, setType] = useState<ExpenseType>('fuel');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [isSplit, setIsSplit] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isEdit && trip) {
      const expense = trip.expenses.find(e => e.id === expenseId);
      if (expense) {
        setType(expense.type);
        setAmount(expense.amount.toString());
        setPayerId(expense.payerId);
        setIsSplit(expense.isSplit);
        setNote(expense.note || '');
      }
    } else if (trip && trip.passengers.length > 0) {
      setPayerId(trip.passengers[0].id);
    }
  }, [isEdit, expenseId, trip]);

  if (!trip) {
    return (
      <PageLayout showBack title="费用详情">
        <div className="text-center py-20 text-stone-400">行程不存在</div>
      </PageLayout>
    );
  }

  const handleSave = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (!payerId) {
      alert('请选择付款人');
      return;
    }

    const expenseData = {
      tripId: id!,
      type,
      amount: amountNum,
      payerId,
      isSplit,
      note: note || undefined,
    };

    if (isEdit) {
      updateExpense(id!, expenseId!, expenseData);
    } else {
      addExpense(id!, expenseData);
    }
    navigate(-1);
  };

  const handleDelete = () => {
    if (isEdit && confirm('确定删除这笔费用吗？')) {
      deleteExpense(id!, expenseId!);
      navigate(-1);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-300' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-300' },
      green: { bg: 'bg-green-50', text: 'text-green-500', border: 'border-green-300' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-500', border: 'border-cyan-300' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-300' },
    };
    return colors[color] || colors.orange;
  };

  return (
    <PageLayout
      title={isEdit ? '编辑费用' : '添加费用'}
      showBack
      rightAction={
        <button
          onClick={handleSave}
          className="text-teal-600 font-medium text-sm flex items-center gap-1"
        >
          <Save size={16} />
          保存
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-orange-500" />
            费用类型
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {EXPENSE_TYPES.map(item => {
              const colors = getColorClasses(item.color);
              const isActive = type === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setType(item.key)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    isActive
                      ? `${colors.bg} ${colors.border}`
                      : 'bg-stone-50 border-transparent hover:bg-stone-100'
                  )}
                >
                  <item.icon
                    size={24}
                    className={isActive ? colors.text : 'text-stone-400'}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isActive ? colors.text : 'text-stone-500'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-orange-500 text-lg">¥</span>
            费用金额
          </h2>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-4xl font-bold text-center py-4 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
              autoFocus
            />
          </div>
          <p className="text-center text-stone-400 text-sm mt-2">
            人民币 (元)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-orange-500" />
            付款人
          </h2>
          <div className="space-y-2">
            {trip.passengers.map(passenger => {
              const isActive = payerId === passenger.id;
              return (
                <button
                  key={passenger.id}
                  onClick={() => setPayerId(passenger.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                    isActive
                      ? 'bg-teal-50 border-teal-300'
                      : 'bg-stone-50 border-transparent hover:bg-stone-100'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {passenger.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{passenger.name}</p>
                    {passenger.isChild && (
                      <span className="text-xs text-pink-500">儿童</span>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4">分摊设置</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-stone-700">参与均摊</span>
              <p className="text-xs text-stone-400 mt-0.5">关闭后此笔费用由付款人独自承担</p>
            </div>
            <div
              onClick={() => setIsSplit(!isSplit)}
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative cursor-pointer',
                isSplit ? 'bg-teal-500' : 'bg-stone-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  isSplit ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </div>
          </label>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h2 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-orange-500" />
            备注
          </h2>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="添加备注说明..."
            rows={3}
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors resize-none"
          />
        </div>

        {isEdit && (
          <button
            onClick={handleDelete}
            className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} />
            删除此笔费用
          </button>
        )}
      </div>
    </PageLayout>
  );
}
