import { useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, Loading, Empty, Badge } from '@/components/ui';
import { useStatisticsStore } from '@/stores/useStatisticsStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { formatDateTime } from '@/utils/date';
import type { EChartsOption } from 'echarts';
import { subDays, format } from 'date-fns';

export default function Statistics() {
  const { statistics, loading, calculateAllStatistics } = useStatisticsStore();
  const { furniture, fetchFurniture } = useFurnitureStore();

  useEffect(() => {
    calculateAllStatistics(7);
    fetchFurniture();
  }, [calculateAllStatistics, fetchFurniture]);

  const furnitureMap = useMemo(() => {
    const map = new Map<string, string>();
    furniture.forEach(f => map.set(f.id, f.code));
    return map;
  }, [furniture]);

  const usageChartOption: EChartsOption = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(format(subDays(new Date(), i), 'MM-dd'));
    }
    const rates = dates.map((_, index) => {
      const data = statistics?.dailyUsageRate[index];
      return data ? data.rate : 0;
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>使用率: {c}%',
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%', fontSize: 11 },
      },
      series: [{
        name: '使用率',
        type: 'line',
        smooth: true,
        data: rates,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
        },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
      }],
    };
  }, [statistics]);

  const missingChartOption: EChartsOption = useMemo(() => {
    const data = statistics?.frequentlyMissing.slice(0, 10) || [];
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.code).reverse(),
        axisLabel: { fontSize: 11 },
      },
      series: [{
        name: '丢失次数',
        type: 'bar',
        data: data.map(d => d.count).reverse(),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#f97316' },
              { offset: 1, color: '#fb923c' },
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 16,
      }],
    };
  }, [statistics]);

  const weatherChartOption: EChartsOption = useMemo(() => {
    const data = statistics?.weatherImpact || [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', textStyle: { fontSize: 11 } },
      series: [{
        name: '天气影响',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: data.map((d, i) => ({
          value: d.incidentCount,
          name: d.condition,
          itemStyle: { color: colors[i % colors.length] },
        })),
      }],
    };
  }, [statistics]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900">统计报表</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">最近7天使用率</h3>
              <div className="h-64">
                {statistics?.dailyUsageRate?.length ? (
                  <ReactECharts option={usageChartOption} style={{ height: '100%' }} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">常缺件分析 TOP 10</h3>
              <div className="h-64">
                {statistics?.frequentlyMissing?.length ? (
                  <ReactECharts option={missingChartOption} style={{ height: '100%' }} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">天气影响分析</h3>
              <div className="h-64">
                {statistics?.weatherImpact?.length ? (
                  <ReactECharts option={weatherChartOption} style={{ height: '100%' }} />
                ) : (
                  <Empty description="暂无数据" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">维修台账</h3>
              {statistics?.repairList?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 text-left font-medium text-gray-500">桌椅编号</th>
                        <th className="py-2 text-left font-medium text-gray-500">类型</th>
                        <th className="py-2 text-left font-medium text-gray-500">严重程度</th>
                        <th className="py-2 text-left font-medium text-gray-500">状态</th>
                        <th className="py-2 text-left font-medium text-gray-500">上报时间</th>
                        <th className="py-2 text-right font-medium text-gray-500">费用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.repairList.map(incident => (
                        <tr key={incident.id} className="border-b border-gray-100 last:border-0">
                          <td className="py-3 font-medium text-gray-900">
                            {furnitureMap.get(incident.furnitureId) || '未知'}
                          </td>
                          <td className="py-3 text-gray-600">
                            {incident.type === 'damage' ? '损坏' : '丢失'}
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-medium ${
                              incident.severity === 'severe' ? 'text-red-600' :
                              incident.severity === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {incident.severity === 'severe' ? '严重' :
                               incident.severity === 'moderate' ? '中等' : '轻微'}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge variant={
                              incident.status === 'resolved' ? 'success' :
                              incident.status === 'processing' ? 'info' : 'warning'
                            }>
                              {incident.status === 'resolved' ? '已解决' :
                               incident.status === 'processing' ? '处理中' : '待处理'}
                            </Badge>
                          </td>
                          <td className="py-3 text-gray-500">
                            {formatDateTime(incident.reportTime)}
                          </td>
                          <td className="py-3 text-right font-medium text-gray-900">
                            {incident.repairCost !== undefined ? `¥${incident.repairCost.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty description="暂无维修记录" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
