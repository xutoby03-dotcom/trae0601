import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Download,
  Trophy,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { COLOR_OPTIONS } from '@/types';
import ColorBadge from '@/components/ColorBadge';
import StatusBadge from '@/components/StatusBadge';
import { getItemTypeLabel, downloadCSV, cn } from '@/utils';

type TabType = 'consumption' | 'department' | 'purchase';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState<TabType>('consumption');

  const getConsumptionStats = useAppStore((state) => state.getConsumptionStats);
  const getDepartmentStats = useAppStore((state) => state.getDepartmentStats);
  const getPurchaseSuggestions = useAppStore((state) => state.getPurchaseSuggestions);
  const supplyItems = useAppStore((state) => state.supplyItems);

  const consumptionStats = useMemo(() => getConsumptionStats(), [getConsumptionStats]);
  const departmentStats = useMemo(() => getDepartmentStats(), [getDepartmentStats]);
  const purchaseSuggestions = useMemo(() => getPurchaseSuggestions(), [getPurchaseSuggestions]);

  const chartData = useMemo(() => {
    return consumptionStats.slice(0, 6).map((stat) => ({
      name: stat.roomName.length > 6 ? stat.roomName.slice(0, 6) + '...' : stat.roomName,
      fullName: stat.roomName,
      每周消耗: stat.averageConsumptionPerWeek,
      缺货率: stat.shortageRate,
    }));
  }, [consumptionStats]);

  const totalSuggestionTotal = useMemo(() => {
    return purchaseSuggestions.reduce((sum, s) => sum + s.suggestedPurchase, 0);
  }, [purchaseSuggestions]);

  const handleExportPurchase = () => {
    const csvData = purchaseSuggestions.map((s) => ({
      物品类型: getItemTypeLabel(s.itemType),
      颜色: s.colorName || '-',
      总需求: s.totalRequired,
      缓冲库存: s.bufferStock,
      建议采购: s.suggestedPurchase,
      涉及会议室: s.roomsNeeding.join('、'),
    }));
    downloadCSV(csvData, `采购建议_${new Date().toISOString().split('T')[0]}`);
  };

  const tabs: { key: TabType; label: string; icon: typeof BarChart3 }[] = [
    { key: 'consumption', label: '消耗排名', icon: TrendingUp },
    { key: 'department', label: '部门分析', icon: Users },
    { key: 'purchase', label: '采购建议', icon: ShoppingCart },
  ];

  const barColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">统计分析</h1>
          <p className="mt-1 text-slate-500">
            会议室耗材消耗数据洞察
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">消耗最快会议室</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {consumptionStats[0]?.roomName || '-'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {consumptionStats[0]?.averageConsumptionPerWeek || 0} 件/周
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">最常缺耗材部门</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {departmentStats[0]?.department || '-'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                缺货率 {departmentStats[0]?.shortageRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">建议采购总数</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {totalSuggestionTotal} 件
              </p>
              <p className="text-xs text-slate-400 mt-1">
                含 {purchaseSuggestions.length} 种物品
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">待处理预警</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {supplyItems.filter((s) => s.status === 'pending').length} 项
              </p>
              <p className="text-xs text-slate-400 mt-1">
                连续缺货 {supplyItems.filter((s) => s.status === 'pending' && s.consecutiveShortage >= 2).length} 项
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all duration-200 border-b-2',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
        </div>

        <div className="p-6">
          {activeTab === 'consumption' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  会议室消耗速度排名
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number, name: string) => [
                          name === '每周消耗' ? `${value} 件/周` : `${value}%`,
                          name
                        ]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                      />
                      <Legend />
                      <Bar dataKey="每周消耗" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  详细数据
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          排名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          会议室
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          巡检次数
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          缺货次数
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          缺货率
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          周均消耗
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consumptionStats.map((stat, index) => (
                        <tr key={stat.roomId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                                index === 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : index === 1
                                  ? 'bg-slate-200 text-slate-600'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-800">{stat.roomName}</td>
                          <td className="px-4 py-4 text-center font-mono text-slate-700">
                            {stat.totalInspections}
                          </td>
                          <td className="px-4 py-4 text-center font-mono text-slate-700">
                            {stat.totalShortages}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={cn(
                                'font-mono font-bold',
                                stat.shortageRate > 50
                                  ? 'text-red-600'
                                  : stat.shortageRate > 30
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              )}
                            >
                              {stat.shortageRate}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-mono font-bold text-slate-800">
                            {stat.averageConsumptionPerWeek} 件
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'department' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  各部门预约后耗材缺失情况
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          排名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          部门
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          预约次数
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          缺货次数
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          缺货率
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          最常缺耗材
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departmentStats.map((stat, index) => (
                        <tr key={stat.department} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                                index === 0
                                  ? 'bg-red-100 text-red-700'
                                  : index === 1
                                  ? 'bg-amber-100 text-amber-700'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-500'
                              )}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-800">{stat.department}</td>
                          <td className="px-4 py-4 text-center font-mono text-slate-700">
                            {stat.bookingCount}
                          </td>
                          <td className="px-4 py-4 text-center font-mono text-slate-700">
                            {stat.shortageCount}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={cn(
                                'font-mono font-bold',
                                stat.shortageRate > 70
                                  ? 'text-red-600'
                                  : stat.shortageRate > 40
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              )}
                            >
                              {stat.shortageRate}%
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge
                              status={stat.mostMissingItem}
                              label={stat.mostMissingItem}
                              variant="info"
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  下次采购建议
                </h3>
                <button
                  onClick={handleExportPurchase}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  导出采购清单
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        物品类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        颜色
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        总需求
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        缓冲库存
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        建议采购
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        涉及会议室
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchaseSuggestions.map((suggestion, index) => (
                      <tr key={`${suggestion.itemType}-${suggestion.color || 'none'}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-medium text-slate-800">
                          {getItemTypeLabel(suggestion.itemType)}
                        </td>
                        <td className="px-4 py-4">
                          {suggestion.color ? (
                            <ColorBadge color={suggestion.color} colorName={suggestion.colorName} />
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-700">
                          {suggestion.totalRequired}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-500">
                          {suggestion.bufferStock}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-mono font-bold text-lg text-blue-600">
                            {suggestion.suggestedPurchase}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {suggestion.roomsNeeding.map((room) => (
                              <span
                                key={room}
                                className="inline-block px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
                              >
                                {room}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-4 font-bold text-slate-800 text-right">
                        合计
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-800">
                        {purchaseSuggestions.reduce((sum, s) => sum + s.totalRequired, 0)}
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-500">
                        {purchaseSuggestions.reduce((sum, s) => sum + s.bufferStock, 0)}
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-lg text-blue-600">
                        {totalSuggestionTotal}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">采购说明：</span>
                  建议采购数量 = 当前缺口数量 + 2周缓冲库存。
                  缓冲库存根据各会议室历史消耗速度计算，确保2周内不缺货。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
