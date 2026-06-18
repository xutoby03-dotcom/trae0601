import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Heart, Package, Recycle, Trash2, Droplets } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/KpiCard';
import { useStatisticsStore } from '../../store/statistics';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { useSortingRecordsStore } from '../../store/sortingRecords';
import { useDropRecordsStore } from '../../store/dropRecords';
import { BarChartComponent } from '../../components/charts/BarChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import { SankeyChartComponent } from '../../components/charts/SankeyChart';
import { formatPercentage, formatWeight, getCategoryColor, getCategoryText } from '../../utils/formatters';
import { calculateTotalWeight, calculateDonatableRatio, estimateBagWeight } from '../../utils/calculations';
import type { SortingItem } from '../../types';

export const StatisticsPage: React.FC = () => {
  const { getStatistics } = useStatisticsStore();
  const { recoveryPoints } = useRecoveryPointsStore();
  const { sortingRecords } = useSortingRecordsStore();
  const { dropRecords } = useDropRecordsStore();

  const stats = useMemo(() => getStatistics(), [getStatistics]);

  const pointDropData = useMemo(() => {
    return recoveryPoints.map(point => {
      const pointDropRecords = dropRecords.filter(d => d.recoveryPointId === point.id);
      const totalBags = pointDropRecords.reduce((sum, r) => sum + r.bagCount, 0);
      return {
        name: point.name.length > 6 ? point.name.slice(0, 6) + '...' : point.name,
        fullName: point.name,
        value: totalBags * 5,
      };
    });
  }, [recoveryPoints, dropRecords]);

  const totalDropWeight = useMemo(() => {
    return dropRecords.reduce((sum, r) => sum + estimateBagWeight(r.bagCount), 0);
  }, [dropRecords]);

  const totalSortedWeight = useMemo(() => {
    return sortingRecords.reduce((sum, r) => sum + calculateTotalWeight(r.items as SortingItem[]), 0);
  }, [sortingRecords]);

  const donatableRatio = useMemo(() => {
    return calculateDonatableRatio(sortingRecords);
  }, [sortingRecords]);

  const categorySummary = useMemo(() => {
    const allItems = sortingRecords.flatMap(r => r.items);
    const summary: Record<string, number> = {
      donatable: 0,
      recyclable: 0,
      damaged: 0,
      needs_cleaning: 0,
    };
    allItems.forEach(item => {
      summary[item.category] = (summary[item.category] || 0) + item.weightKg;
    });
    return Object.entries(summary).map(([key, value]) => ({
      category: key,
      weight: value,
    }));
  }, [sortingRecords]);

  const categoryIcons: Record<string, React.ReactNode> = {
    donatable: <Heart className="w-5 h-5" />,
    recyclable: <Recycle className="w-5 h-5" />,
    damaged: <Trash2 className="w-5 h-5" />,
    needs_cleaning: <Droplets className="w-5 h-5" />,
  };

  return (
    <div>
      <PageHeader
        title="统计分析"
        description="查看各回收点投放数据、分拣比例和清运效率"
        icon={BarChart3}
      />

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="总投放重量"
          value={totalDropWeight}
          unit="kg"
          icon={Package}
          color="green"
        />
        <KpiCard
          title="已分拣重量"
          value={totalSortedWeight}
          unit="kg"
          icon={BarChart3}
          color="blue"
        />
        <KpiCard
          title="可捐赠比例"
          value={donatableRatio}
          unit="percentage"
          icon={Heart}
          color="orange"
        />
        <KpiCard
          title="清运及时率"
          value={stats.collectionCompletionRate}
          unit="percentage"
          icon={TrendingUp}
          color="red"
        />
      </div>

      {/* 分类统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {categorySummary.map(item => (
          <div
            key={item.category}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${getCategoryColor(item.category)} bg-opacity-20`}>
                <div className={getCategoryColor(item.category).replace('bg-', 'text-')}>
                  {categoryIcons[item.category]}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{getCategoryText(item.category)}</p>
                <p className="text-xl font-bold text-gray-900">{formatWeight(item.weight)}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getCategoryColor(item.category)}`}
                style={{
                  width: `${totalSortedWeight > 0 ? (item.weight / totalSortedWeight) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 - 第一行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 各回收点投放量 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">各回收点投放量</h3>
              <p className="text-sm text-gray-500">按重量统计（kg）</p>
            </div>
            <div className="p-2.5 bg-primary-100 rounded-xl">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <BarChartComponent
            data={pointDropData.map(p => ({ name: p.name, value: p.value }))}
            height={280}
          />
        </div>

        {/* 分拣比例 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">分拣类别占比</h3>
              <p className="text-sm text-gray-500">按重量统计</p>
            </div>
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <PieChartComponent
            data={stats.sortingRatio}
            height={280}
          />
        </div>
      </div>

      {/* 图表区域 - 第二行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 清运效率 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">清运响应效率</h3>
              <p className="text-sm text-gray-500">近7天平均响应时间（小时）</p>
            </div>
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <LineChartComponent
            data={stats.collectionEfficiency}
            height={280}
          />
        </div>

        {/* 公益去向 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">本月公益去向</h3>
              <p className="text-sm text-gray-500">按重量统计（kg）</p>
            </div>
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <SankeyChartComponent
            data={stats.donationDestinations}
            height={280}
          />
        </div>
      </div>

      {/* 回收点详细数据 */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">回收点数据明细</h3>
          <p className="text-sm text-gray-500 mt-1">各回收点投放、分拣、容量数据一览</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  回收点
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  投放次数
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  投放总重
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  已分拣重量
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  可捐赠率
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  当前容量
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recoveryPoints.map((point, index) => {
                const pointDrops = dropRecords.filter(d => d.recoveryPointId === point.id);
                const pointSortings = sortingRecords.filter(s => s.recoveryPointId === point.id);
                const pointDropWeight = pointDrops.reduce((sum, d) => sum + estimateBagWeight(d.bagCount), 0);
                const pointSortedWeight = pointSortings.reduce((sum, s) => sum + calculateTotalWeight(s.items as SortingItem[]), 0);
                const pointDonatableRatio = calculateDonatableRatio(pointSortings);
                const capacityRatio = point.capacityKg > 0 ? point.currentKg / point.capacityKg : 0;

                return (
                  <tr
                    key={point.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{point.name}</div>
                      <div className="text-sm text-gray-500">{point.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{pointDrops.length} 次</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">{formatWeight(pointDropWeight)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-primary-600 font-medium">{formatWeight(pointSortedWeight)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        pointDonatableRatio >= 0.5 ? 'text-green-600' :
                        pointDonatableRatio >= 0.3 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(pointDonatableRatio)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              capacityRatio >= 0.9 ? 'bg-red-500' :
                              capacityRatio >= 0.7 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(capacityRatio * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{formatPercentage(capacityRatio)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        point.status === 'normal' ? 'bg-green-100 text-green-700' :
                        point.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        point.status === 'full' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {point.status === 'normal' ? '正常' :
                         point.status === 'warning' ? '容量预警' :
                         point.status === 'full' ? '已满' : '异常'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
