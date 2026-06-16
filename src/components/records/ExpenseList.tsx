import { Expense, ExpenseCategory, Vehicle, Person } from '../../types';
import { expenseCategoryConfig, formatTime, formatMoney, cn } from '../../utils/helpers';
import { Edit2, Trash2, DollarSign, Fuel, CreditCard, ParkingSquare, Utensils, ShoppingBag, MoreHorizontal, Car, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpenseListProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  people: Person[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const categoryIconMap: Record<ExpenseCategory, typeof Fuel> = {
  fuel: Fuel,
  toll: CreditCard,
  parking: ParkingSquare,
  food: Utensils,
  supply: ShoppingBag,
  other: MoreHorizontal,
};

export function ExpenseList({ expenses, vehicles, people, onEdit, onDelete }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const getVehicle = (vehicleId: string | null) => {
    if (!vehicleId) return null;
    return vehicles.find((v) => v.id === vehicleId);
  };

  const getPayer = (payerId: string) => {
    return people.find((p) => p.id === payerId);
  };

  const categoryTotals = sortedExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const totalAmount = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (sortedExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="w-10 h-10 text-forest-500" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-forest-800 mb-2">
          暂无费用记录
        </h3>
        <p className="text-gray-500">点击右上角按钮添加第一条费用记录</p>
      </div>
    );
  }

  const categories: ExpenseCategory[] = ['fuel', 'toll', 'parking', 'food', 'supply', 'other'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-5">
        <h4 className="font-semibold text-forest-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          费用汇总
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {categories.map((category) => {
            const config = expenseCategoryConfig[category];
            const Icon = categoryIconMap[category];
            const amount = categoryTotals[category] || 0;
            return (
              <div
                key={category}
                className={cn(
                  'rounded-xl p-3 border',
                  config.color.split(' ')[0].replace('text-', 'bg-').replace('-100', '-50')
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">{config.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{formatMoney(amount)}</p>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
          <span className="font-semibold text-forest-800">总计</span>
          <span className="text-2xl font-bold text-forest-700">{formatMoney(totalAmount)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedExpenses.map((expense, index) => {
          const config = expenseCategoryConfig[expense.category];
          const Icon = categoryIconMap[expense.category];
          const vehicle = getVehicle(expense.vehicleId);
          const payer = getPayer(expense.payerId);

          return (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-2xl shadow-sm border border-cream-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    config.color.split(' ')[0].replace('text-', 'bg-').replace('-100', '-100')
                  )}>
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        config.color
                      )}>
                        {config.label}
                      </span>
                      <span className="text-xl font-bold text-forest-700">
                        {formatMoney(expense.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">
                      {payer && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {payer.name}
                        </span>
                      )}
                      {vehicle && (
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" />
                          {vehicle.carModel} ({vehicle.plateNumber})
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatTime(expense.time)}
                      </span>
                    </div>

                    {expense.note && (
                      <p className="mt-2 text-sm text-gray-600 bg-cream-50 rounded-lg px-3 py-2">
                        {expense.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 rounded-lg hover:bg-cream-100 text-gray-500 hover:text-forest-600 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
