import { useMemo } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatMoney, expenseCategoryConfig } from '../../utils/helpers';
import { motion } from 'framer-motion';
import type { ExpenseCategory, Vehicle } from '../../types';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fuel: '#f59e0b',
  toll: '#3b82f6',
  parking: '#8b5cf6',
  food: '#22c55e',
  supply: '#16a34a',
  other: '#6b7280',
};

const CATEGORIES: ExpenseCategory[] = ['fuel', 'toll', 'parking', 'food', 'supply', 'other'];

type VehicleExpenseEntry = {
  name: string;
  vehicle: Vehicle | null;
  total: number;
} & Record<ExpenseCategory, number>;

const createEmptyEntry = (name: string, vehicle: Vehicle | null): VehicleExpenseEntry => ({
  name,
  vehicle,
  total: 0,
  fuel: 0,
  toll: 0,
  parking: 0,
  food: 0,
  supply: 0,
  other: 0,
});

export default function VehicleExpenseChart() {
  const { vehicles, expenses } = useFleetStore();

  const vehicleBarData = useMemo(() => {
    const vehicleMap = new Map<string, VehicleExpenseEntry>();

    vehicleMap.set('__public__', createEmptyEntry('公共费用', null));

    vehicles.forEach((v) => {
      vehicleMap.set(v.id, createEmptyEntry(`${v.carModel} (${v.driverName})`, v));
    });

    expenses.forEach((e) => {
      const key = e.vehicleId ?? '__public__';
      if (!vehicleMap.has(key)) {
        vehicleMap.set(key, createEmptyEntry('未知车辆', null));
      }
      const entry = vehicleMap.get(key)!;
      entry[e.category] += e.amount;
    });

    return Array.from(vehicleMap.values()).map((v) => {
      const total = CATEGORIES.reduce((sum, cat) => sum + v[cat], 0);
      return { ...v, total };
    });
  }, [vehicles, expenses]);

  const categoryPieData = useMemo(() => {
    const catMap = new Map<ExpenseCategory, number>();
    CATEGORIES.forEach((cat) => catMap.set(cat, 0));

    expenses.forEach((e) => {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount);
    });

    return CATEGORIES
      .filter((cat) => (catMap.get(cat) ?? 0) > 0)
      .map((cat) => ({
        name: expenseCategoryConfig[cat].label,
        value: catMap.get(cat) ?? 0,
        color: CATEGORY_COLORS[cat],
      }));
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-forest-800">各车辆费用</h3>
          <span className="text-sm text-gray-500">合计：{formatMoney(totalExpenses)}</span>
        </div>
        {vehicleBarData.length > 0 && vehicleBarData.some((d) => d.total > 0) ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vehicleBarData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `¥${v}`} fontSize={12} />
                <YAxis type="category" dataKey="name" width={140} fontSize={12} />
                <Tooltip
                  formatter={(value: number, name) => {
                    const cat = CATEGORIES.find((c) => c === name);
                    const label = cat ? expenseCategoryConfig[cat].label : name;
                    return [formatMoney(value), label];
                  }}
                />
                <Legend />
                {CATEGORIES.map((cat) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={CATEGORY_COLORS[cat]}
                    name={expenseCategoryConfig[cat].label}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>暂无费用数据</p>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-forest-800">费用类型占比</h3>
          <span className="text-sm text-gray-500">共 {expenses.length} 笔</span>
        </div>
        {categoryPieData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>暂无费用数据</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
