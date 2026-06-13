import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { DollarSign, Calendar, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFilterStore } from '../store';
import { formatDateDisplay, getCurrentYear } from '../utils/dateUtils';

export default function Statistics() {
  const {
    getMonthlyCosts,
    getYearlyTotalCost,
    getRemainingDaysByDevice,
    getPurchaseSuggestions,
    devices,
    inventory,
    records,
  } = useFilterStore();

  const monthlyCosts = getMonthlyCosts();
  const yearlyTotal = getYearlyTotalCost();
  const remainingDays = getRemainingDaysByDevice();
  const purchaseSuggestions = getPurchaseSuggestions();
  const currentYear = getCurrentYear();

  const modelUsageData = devices.reduce((acc, device) => {
    const existing = acc.find((item) => item.name === device.filterModel);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: device.filterModel, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

  const getBarColor = (days: number) => {
    if (days < 15) return '#EF4444';
    if (days <= 30) return '#F59E0B';
    return '#10B981';
  };

  const avgCostPerMonth = yearlyTotal / Math.max(1, monthlyCosts.filter((m) => m.cost > 0).length);
  const totalRecords = records.length;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-800">统计分析</h1>
          <p className="text-gray-500 mt-1">查看滤芯使用数据和费用统计</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今年总花费</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">¥{yearlyTotal.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{currentYear}年度</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-50">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">月均花费</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">¥{avgCostPerMonth.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">平均每月</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50">
              <TrendingUp className="w-6 h-6 text-violet-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">累计更换</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalRecords} 次</p>
              <p className="text-xs text-gray-400 mt-1">历史记录</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50">
              <Calendar className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">库存价值</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">¥{totalInventoryValue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">当前库存</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50">
              <ShoppingCart className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg text-gray-800 mb-6">{currentYear}年月度花费</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`¥${value}`, '花费']}
                />
                <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                  {monthlyCosts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cost > 0 ? '#0EA5E9' : '#E5E7EB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg text-gray-800 mb-6">各型号使用分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modelUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg text-gray-800 mb-6">各设备剩余天数</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={remainingDays}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis
                dataKey="location"
                type="category"
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${value} 天`, '剩余天数']}
              />
              <Bar dataKey="remainingDays" radius={[0, 8, 8, 0]} barSize={24}>
                {remainingDays.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.remainingDays)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger-500" />
            <span className="text-sm text-gray-600">急需更换 ({'<'}15天)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-500" />
            <span className="text-sm text-gray-600">临期 (15-30天)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-500" />
            <span className="text-sm text-gray-600">正常 ({'>'}30天)</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-gray-800">采购建议</h3>
          {purchaseSuggestions.length > 0 && (
            <span className="badge-warning">
              {purchaseSuggestions.length} 个型号需要关注
            </span>
          )}
        </div>

        {purchaseSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-success-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <p className="text-gray-600 font-medium">库存充足</p>
            <p className="text-sm text-gray-400 mt-1">当前所有型号滤芯库存都在安全线以上</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">滤芯型号</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">当前库存</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">预计可用</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">建议采购日期</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">原因</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">优先级</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSuggestions.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">{item.filterModel}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold ${item.currentStock === 0 ? 'text-danger-500' : 'text-warning-500'}`}>
                        {item.currentStock} 件
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600">{item.estimatedDaysLeft} 天</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-gray-600">{formatDateDisplay(item.suggestedPurchaseDate)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{item.reason}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.currentStock === 0 ? (
                        <span className="badge-danger inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          紧急
                        </span>
                      ) : item.estimatedDaysLeft < 30 ? (
                        <span className="badge-warning inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          高
                        </span>
                      ) : (
                        <span className="badge-success inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          中
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
