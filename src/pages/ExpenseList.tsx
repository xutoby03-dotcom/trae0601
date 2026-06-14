import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  User,
  Car,
  Gauge,
  Fuel,
  Ticket,
  ParkingCircle,
  Droplets,
  ShoppingBag,
  Plus,
  Settings,
  Calculator,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import {
  formatCurrency,
  formatDate,
  calculateSettlement,
} from '@/utils/calculation';
import { EXPENSE_TYPE_LABELS, type ExpenseType } from '@/types';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';

const FILTERS: { key: ExpenseType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'fuel', label: '油费' },
  { key: 'toll', label: '过路费' },
  { key: 'parking', label: '停车费' },
  { key: 'carwash', label: '洗车' },
  { key: 'supplies', label: '临时用品' },
];

const ExpenseIcon = ({ type, size = 20 }: { type: ExpenseType; size?: number }) => {
  const iconMap = {
    fuel: Fuel,
    toll: Ticket,
    parking: ParkingCircle,
    carwash: Droplets,
    supplies: ShoppingBag,
  };
  const colorMap = {
    fuel: 'text-orange-500 bg-orange-50',
    toll: 'text-blue-500 bg-blue-50',
    parking: 'text-green-500 bg-green-50',
    carwash: 'text-cyan-500 bg-cyan-50',
    supplies: 'text-purple-500 bg-purple-50',
  };
  const Icon = iconMap[type];
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        colorMap[type]
      )}
    >
      <Icon size={size} />
    </div>
  );
};

export default function ExpenseList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trips = useTripStore(state => state.trips);
  const deleteExpense = useTripStore(state => state.deleteExpense);
  const isLoaded = useTripStore(state => state.isLoaded);
  const loadTrips = useTripStore(state => state.loadTrips);
  
  const [activeFilter, setActiveFilter] = useState<ExpenseType | 'all'>('all');

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  const trip = useMemo(() => trips.find(t => t.id === id), [trips, id]);

  if (!trip) {
    return (
      <PageLayout showBack title="行程详情">
        <div className="text-center py-20 text-stone-400">行程不存在</div>
      </PageLayout>
    );
  }

  const settlement = calculateSettlement(trip);
  
  const filteredExpenses = activeFilter === 'all'
    ? trip.expenses
    : trip.expenses.filter(e => e.type === activeFilter);

  const getPayerName = (payerId: string) => {
    const passenger = trip.passengers.find(p => p.id === payerId);
    return passenger?.name || '未知';
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('确定删除这笔费用吗？')) {
      deleteExpense(id!, expenseId);
    }
  };

  return (
    <PageLayout
      title={trip.destination}
      showBack
      rightAction={
        <button
          onClick={() => navigate(`/trip/${id}/edit`)}
          className="text-teal-600 p-2 -mr-2"
        >
          <Settings size={20} />
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-4">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span className="font-medium">{trip.destination}</span>
            </div>
            <span className="text-teal-100 text-sm">{trip.kilometers}km</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold font-serif">
              {formatCurrency(settlement.totalCost)}
            </span>
            <span className="text-teal-200 text-sm">总费用</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(trip.departureTime)}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} />
                {trip.driverName}
              </span>
            </div>
            <span>人均 {formatCurrency(settlement.averageCost)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate(`/trip/${id}/settlement`)}
            className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calculator size={18} className="text-orange-500" />
              <span className="font-medium text-stone-800">查看结算</span>
            </div>
            <p className="text-sm text-stone-500">
              {trip.passengers.length}人分摊明细
            </p>
          </div>
          
          <div
            onClick={() => navigate(`/trip/${id}/edit`)}
            className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Car size={18} className="text-teal-500" />
              <span className="font-medium text-stone-800">行程设置</span>
            </div>
            <p className="text-sm text-stone-500">
              乘客、司机补贴等
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-800 flex items-center gap-2">
                <Receipt size={18} className="text-orange-500" />
                费用记录
                <span className="text-sm font-normal text-stone-400">
                  ({trip.expenses.length}笔)
                </span>
              </h2>
            </div>
            
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
              {FILTERS.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    activeFilter === filter.key
                      ? 'bg-teal-500 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-amber-50">
            {filteredExpenses.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Receipt size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无费用记录</p>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="p-4 hover:bg-amber-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/trip/${id}/expense/${expense.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <ExpenseIcon type={expense.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-stone-800">
                          {EXPENSE_TYPE_LABELS[expense.type]}
                        </span>
                        <span className="font-bold text-stone-800">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500 truncate">
                          {getPayerName(expense.payerId)} 支付
                        </span>
                        <div className="flex items-center gap-2">
                          {expense.receiptUrl && (
                            <div className="relative group">
                              <img
                                src={expense.receiptUrl}
                                alt="票据"
                                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                              />
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                                <Receipt size={10} className="text-white" />
                              </div>
                            </div>
                          )}
                          {expense.isSplit && (
                            <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                              均摊
                            </span>
                          )}
                          {!expense.isSplit && (
                            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              不摊
                            </span>
                          )}
                          <ChevronRight size={14} className="text-stone-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {settlement.expenseByType.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <h3 className="font-bold text-stone-800 mb-3">费用分类统计</h3>
            <div className="space-y-3">
              {settlement.expenseByType.map(item => {
                const percentage = settlement.totalCost > 0
                  ? (item.total / settlement.totalCost) * 100
                  : 0;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-stone-600 flex items-center gap-2">
                        <ExpenseIcon type={item.type} size={16} />
                        {EXPENSE_TYPE_LABELS[item.type]}
                      </span>
                      <span className="font-medium text-stone-800">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate(`/trip/${id}/expense/new`)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </PageLayout>
  );
}
