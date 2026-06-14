import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, RefreshCw, Calendar, Users, AlertTriangle, Droplets, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS, COSTUME_SIZES, ACCESSORY_LABELS } from '../../shared/types';

const COLORS = ['#1E3A8A', '#D4AF37', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];

export default function Statistics() {
  const { statistics, overdueRecords, damages, fetchStatistics, fetchOverdue, fetchDamages, loading } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'overdue' | 'damages'>('overview');

  useEffect(() => {
    fetchStatistics();
    fetchOverdue();
    fetchDamages();
  }, [fetchStatistics, fetchOverdue, fetchDamages]);

  const sizeChartData = statistics ? Object.entries(statistics.sizeDemand)
    .filter(([size]) => size !== '均码')
    .map(([size, count]) => ({ size, count })) : [];

  const statusChartData = statistics ? Object.entries(statistics.statusDistribution)
    .map(([status, count]) => ({ name: status, value: count }))
    .filter(d => d.value > 0) : [];

  const totalDemand = statistics ? Object.values(statistics.sizeDemand).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">统计报表</h1>
          <p className="text-gray-500 mt-1">查看各尺码需求、逾期未还、缺配件记录和清洗排队数量</p>
        </div>
        <button
          onClick={() => {
            fetchStatistics();
            fetchOverdue();
            fetchDamages();
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-primary-600 text-sm">尺码总需求</p>
              <p className="text-2xl font-bold text-primary-800">{totalDemand} 套</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-red-600 text-sm">逾期未还</p>
              <p className="text-2xl font-bold text-red-800">{statistics?.overdueCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-yellow-600 text-sm">缺配件记录</p>
              <p className="text-2xl font-bold text-yellow-800">{statistics?.missingAccessoryCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-orange-600 text-sm">清洗排队</p>
              <p className="text-2xl font-bold text-orange-800">{statistics?.cleaningQueueCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'overview', label: '数据概览', icon: BarChart3 },
          { key: 'overdue', label: '逾期未还', icon: AlertTriangle },
          { key: 'damages', label: '缺损记录', icon: Package },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                各尺码需求统计
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sizeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="size" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="需求数量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-gold-500" />
                服装状态分布
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              各尺码库存和需求对比
            </h3>
            <div className="space-y-3">
              {COSTUME_SIZES.map(size => {
                const demand = statistics?.sizeDemand[size] || 0;
                const stockKey = size;
                return (
                  <div key={size} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-700">{size}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-end pr-2">
                        <span className="text-xs text-white font-medium">
                          需求 {demand}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overdue' && (
        <div className="card">
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            逾期未还记录
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {overdueRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 border-2 border-red-200 bg-red-50 rounded-xl animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">
                          {record.reservation?.className}
                        </h4>
                        <span className="status-badge bg-red-100 text-red-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          逾期
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="text-gray-600">
                          <span className="text-gray-400">领用人：</span>
                          {record.lenderName}
                        </div>
                        <div className="text-gray-600">
                          <span className="text-gray-400">借出日期：</span>
                          {record.lendDate}
                        </div>
                        <div className="text-gray-600">
                          <span className="text-gray-400">应还日期：</span>
                          {record.expectedReturnDate}
                        </div>
                        <div className="text-gray-600">
                          <span className="text-gray-400">未还数量：</span>
                          {record.items.filter(i => !i.returned).length} 件
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {record.items.filter(i => !i.returned).map(item => (
                          <span
                            key={item.id}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                          >
                            {item.costume?.type} - {item.costume?.size}
                          </span>
                        ))}
                      </div>
                    </div>
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
              {overdueRecords.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p>暂无逾期未还记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'damages' && (
        <div className="card">
          <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-500" />
            缺损记录
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {damages.map((damage, index) => {
                const missingItems = Object.entries(damage.missingAccessories)
                  .filter(([_, v]) => v)
                  .map(([k]) => ACCESSORY_LABELS[k as keyof typeof ACCESSORY_LABELS]);

                return (
                  <div
                    key={damage.id}
                    className={`p-4 border rounded-xl animate-slide-up ${
                      damage.resolved
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {damage.costume?.type} - {damage.costume?.size}
                          </h4>
                          <span className={`status-badge ${
                            damage.resolved
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {damage.resolved ? '已处理' : '待处理'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="text-gray-400">服装编号：</span>
                            #{damage.costumeId}
                          </p>
                          {missingItems.length > 0 && (
                            <p>
                              <span className="text-gray-400">缺少配件：</span>
                              <span className="text-red-600">{missingItems.join('、')}</span>
                            </p>
                          )}
                          {damage.hasStain && (
                            <p>
                              <span className="text-gray-400">污渍情况：</span>
                              <span className="text-orange-600">有污渍</span>
                            </p>
                          )}
                          {damage.damageDescription && (
                            <p>
                              <span className="text-gray-400">损坏说明：</span>
                              {damage.damageDescription}
                            </p>
                          )}
                          <p>
                            <span className="text-gray-400">记录时间：</span>
                            {damage.recordedAt}
                          </p>
                        </div>
                      </div>
                      {damage.resolved ? (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
              {damages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p>暂无缺损记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
