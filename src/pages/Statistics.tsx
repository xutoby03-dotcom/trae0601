import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Cable, TrendingUp, AlertTriangle, ShoppingCart, Building2, BarChart3, PieChart, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { StatCard } from '@/components/common/StatCard';
import { AlertCard } from '@/components/common/AlertCard';
import { INTERFACE_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '@/types';
import type { Statistics as StatsType } from '@/types';

export default function Statistics() {
  const { initApp, getStatistics, alerts, currentUser } = useAppStore();
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await initApp();
      setStats(getStatistics());
      setIsLoading(false);
    };
    load();
  }, [initApp, getStatistics]);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const getMonthlyTrendOption = () => {
    if (!stats) return {};
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' }
      },
      legend: {
        data: ['借用次数', '归还次数'],
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: stats.monthlyTrend.map(t => t.month),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      series: [
        {
          name: '借用次数',
          type: 'line',
          smooth: true,
          data: stats.monthlyTrend.map(t => t.borrowCount),
          lineStyle: { color: '#3b82f6', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
              ]
            }
          },
          itemStyle: { color: '#3b82f6' }
        },
        {
          name: '归还次数',
          type: 'line',
          smooth: true,
          data: stats.monthlyTrend.map(t => t.returnCount),
          lineStyle: { color: '#10b981', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
              ]
            }
          },
          itemStyle: { color: '#10b981' }
        }
      ]
    };
  };

  const getInterfaceDemandOption = () => {
    if (!stats) return {};
    const colors = { 'USB-C': '#3b82f6', 'Lightning': '#8b5cf6', 'Micro-USB': '#f59e0b' };
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
        formatter: '{b}: {c}次 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        data: stats.interfaceDemand.map(d => INTERFACE_TYPE_LABELS[d.type])
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 3
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: stats.interfaceDemand.map(d => ({
            value: d.count,
            name: INTERFACE_TYPE_LABELS[d.type],
            itemStyle: { color: colors[d.type] }
          }))
        }
      ]
    };
  };

  const getFloorDemandOption = () => {
    if (!stats || stats.floorDemand.length === 0) return {};
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      yAxis: {
        type: 'category',
        data: stats.floorDemand.map(d => d.floor),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' }
      },
      series: [
        {
          type: 'bar',
          data: stats.floorDemand.map(d => d.count),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#60a5fa' }
              ]
            },
            borderRadius: [0, 6, 6, 0]
          },
          barWidth: '50%'
        }
      ]
    };
  };

  const getDamageOption = () => {
    if (!stats || stats.damageDistribution.length === 0) return {};
    const colors = { skin: '#f59e0b', interface: '#ef4444', charging: '#8b5cf6' };
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' }
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
          data: stats.damageDistribution.map(d => ({
            value: d.count,
            name: DAMAGE_TYPE_LABELS[d.type],
            itemStyle: { color: colors[d.type] }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          }
        }
      ]
    };
  };

  const getSuggestedPurchase = () => {
    if (!stats) return null;
    const lowStock = stats.interfaceStock.filter(s => s.available < s.safeStock);
    const highDemand = stats.interfaceDemand[0];

    if (lowStock.length === 0 && !highDemand) return null;

    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">采购建议</h3>
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.type} className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2">
                    {INTERFACE_TYPE_LABELS[item.type]} 接口
                    {item.available === 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">紧急</span>
                    )}
                  </span>
                  <span className="text-sm">
                    {item.available === 0 
                      ? `已断货！当前0条可用，建议采购 ${item.safeStock + 2} 条`
                      : `库存不足 (${item.available}/${item.total})，建议补充 ${item.safeStock - item.available + 2} 条`
                    }
                  </span>
                </div>
              ))}
              {highDemand && highDemand.count > 0 && (
                <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2">
                  <span>热门需求</span>
                  <span className="text-sm">{INTERFACE_TYPE_LABELS[highDemand.type]} 需求最高（{highDemand.count}次），建议多备货</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
            <p className="text-gray-500 mt-1">全面了解充电线使用情况和损耗分析</p>
          </div>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="累计借用次数"
                value={stats.totalBorrowCount}
                icon={Activity}
                color="blue"
                suffix="次"
              />
              <StatCard
                title="线材总数"
                value={stats.totalCables}
                icon={Cable}
                color="purple"
                suffix="条"
              />
              <StatCard
                title="损耗率"
                value={stats.lossRate.toFixed(1)}
                icon={TrendingUp}
                color={stats.lossRate > 10 ? 'red' : 'orange'}
                suffix="%"
              />
              <StatCard
                title="未读提醒"
                value={unreadAlerts.length}
                icon={AlertTriangle}
                color={unreadAlerts.length > 0 ? 'red' : 'green'}
                suffix="条"
              />
            </div>

            {getSuggestedPurchase()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">月度借还趋势</h3>
                </div>
                <div className="h-72">
                  <ReactECharts option={getMonthlyTrendOption()} style={{ height: '100%' }} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">接口需求分布</h3>
                </div>
                <div className="h-72">
                  <ReactECharts option={getInterfaceDemandOption()} style={{ height: '100%' }} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">各楼层需求排行</h3>
                </div>
                <div className="h-72">
                  <ReactECharts option={getFloorDemandOption()} style={{ height: '100%' }} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">损坏类型分布</h3>
                </div>
                <div className="h-72">
                  {stats.damageDistribution.length > 0 ? (
                    <ReactECharts option={getDamageOption()} style={{ height: '100%' }} />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">暂无损坏数据</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {stats.interfaceStock.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">库存详情</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">接口类型</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">总数</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">可用</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借出</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">安全库存</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.interfaceStock.map(item => (
                        <tr key={item.type} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {INTERFACE_TYPE_LABELS[item.type]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.total}</td>
                          <td className="py-3 px-4 text-gray-600">{item.available}</td>
                          <td className="py-3 px-4 text-gray-600">{item.total - item.available}</td>
                          <td className="py-3 px-4 text-gray-600">{item.safeStock}</td>
                          <td className="py-3 px-4">
                            {item.available < item.safeStock ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                库存不足
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                充足
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {stats.topBorrowed.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">热门线材 TOP 10</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">排名</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">编号</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">接口类型</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">长度</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">功率</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">借用次数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topBorrowed.map((item, index) => (
                        <tr key={item.cable.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-500'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">{item.cable.code}</td>
                          <td className="py-3 px-4 text-gray-600">{INTERFACE_TYPE_LABELS[item.cable.interfaceType]}</td>
                          <td className="py-3 px-4 text-gray-600">{item.cable.length}m</td>
                          <td className="py-3 px-4 text-gray-600">{item.cable.power}W</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-blue-600">{item.count}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {unreadAlerts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">待处理提醒</h3>
                <div className="grid gap-3">
                  {unreadAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
