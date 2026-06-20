import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, DollarSign, AlertTriangle, Package, BarChart3, PieChart, TrendingDown } from 'lucide-react';
import { statsApi } from '../services/api';
import type { HotProduct, DeptConsumption, ProfitStats, DebtRanking, RestockSuggestion } from '../../shared/types';

export default function Stats() {
  const [hotProducts, setHotProducts] = useState<HotProduct[]>([]);
  const [deptConsumption, setDeptConsumption] = useState<DeptConsumption[]>([]);
  const [profitStats, setProfitStats] = useState<ProfitStats | null>(null);
  const [debtRanking, setDebtRanking] = useState<DebtRanking[]>([]);
  const [restockSuggestions, setRestockSuggestions] = useState<RestockSuggestion[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
    loadData(currentMonth);
  }, []);

  async function loadData(month?: string) {
    const [hot, dept, profit, debt, restock] = await Promise.all([
      statsApi.getHotProducts(10, month),
      statsApi.getDeptConsumption(month),
      statsApi.getProfit(),
      statsApi.getDebtRanking(),
      statsApi.getRestockSuggestions(),
    ]);
    setHotProducts(hot);
    setDeptConsumption(dept);
    setProfitStats(profit);
    setDebtRanking(debt);
    setRestockSuggestions(restock);
  }

  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const hotChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#9CA3AF' } },
    yAxis: {
      type: 'category',
      data: hotProducts.map(p => p.productName),
      axisLabel: { color: '#9CA3AF' },
    },
    series: [{
      type: 'bar',
      data: hotProducts.map(p => p.totalQuantity),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#FF7A00' },
            { offset: 1, color: '#FB923C' },
          ],
        },
        borderRadius: [0, 8, 8, 0],
      },
      barWidth: 20,
    }],
  };

  const deptChartOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#6B7280' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        labelLine: { show: false },
      },
      data: deptConsumption.map((d, i) => ({
        value: d.totalAmount,
        name: d.departmentName,
        itemStyle: {
          color: ['#FF7A00', '#36B37E', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5],
        },
      })),
    }],
  };

  const profitChartOption = profitStats ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '成本', '利润'], textStyle: { color: '#6B7280' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: profitStats.monthlyData.map(d => d.month),
      axisLabel: { color: '#9CA3AF' },
    },
    yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' } },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: profitStats.monthlyData.map(d => d.revenue),
        itemStyle: { color: '#FF7A00' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,122,0,0.3)' }, { offset: 1, color: 'rgba(255,122,0,0)' }] } },
      },
      {
        name: '成本',
        type: 'line',
        smooth: true,
        data: profitStats.monthlyData.map(d => d.cost),
        itemStyle: { color: '#F59E0B' },
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: profitStats.monthlyData.map(d => d.profit),
        itemStyle: { color: '#36B37E' },
      },
    ],
  } : {};

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-gray-800 mb-2">统计分析</h1>
            <p className="text-gray-500">查看销售数据和经营分析</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); loadData(e.target.value); }}
            className="px-4 py-2 border-2 border-gray-100 rounded-xl bg-white focus:border-primary-400 focus:outline-none"
          >
            {months.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-sm text-gray-500">总营收</span>
            </div>
            <p className="font-display text-3xl text-gray-800">¥{profitStats?.totalRevenue.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <span className="text-sm text-gray-500">总利润</span>
            </div>
            <p className="font-display text-3xl text-success-600">¥{profitStats?.totalProfit.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <span className="text-sm text-gray-500">利润率</span>
            </div>
            <p className="font-display text-3xl text-warning-600">{profitStats?.profitMargin || 0}%</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger-600" />
              </div>
              <span className="text-sm text-gray-500">待收款</span>
            </div>
            <p className="font-display text-3xl text-danger-600">¥{debtRanking.reduce((sum, d) => sum + d.totalDebt, 0).toFixed(2)}</p>
          </div>
          </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-display text-lg text-gray-800">热销商品 TOP10</h3>
            </div>
            <div className="h-80">
              <ReactECharts option={hotChartOption} style={{ height: '100%' }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-primary-500" />
              <h3 className="font-display text-lg text-gray-800">部门消费占比</h3>
            </div>
            <div className="h-80">
              <ReactECharts option={deptChartOption} style={{ height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Profit Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h3 className="font-display text-lg text-gray-800">收支趋势分析</h3>
          </div>
          <div className="h-72">
            <ReactECharts option={profitChartOption} style={{ height: '100%' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Debt Ranking */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-danger-500" />
              <h3 className="font-display text-lg text-gray-800">欠款排行榜</h3>
            </div>
            {debtRanking.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
              <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>暂无欠款</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debtRanking.map((item, idx) => (
                <div key={item.employeeId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-primary-100 text-primary-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-warning-100 text-warning-600' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.employeeName}</p>
                    <p className="text-xs text-gray-500">{item.departmentName} · {item.billCount}笔账单</p>
                  </div>
                  <span className="font-display text-xl text-danger-600">¥{item.totalDebt.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Restock Suggestions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-primary-500" />
              <h3 className="font-display text-lg text-gray-800">补货建议</h3>
            </div>
            {restockSuggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>库存充足，无需补货</p>
              </div>
            ) : (
              <div className="space-y-3">
                {restockSuggestions.map((item, idx) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        当前库存 {item.currentStock} 件 · 月均销量 {item.avgMonthlySales} 件
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-primary-600">建议补货</p>
                      <p className="text-sm text-gray-500">{item.suggestedQuantity} 件</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
