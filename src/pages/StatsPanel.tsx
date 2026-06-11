import { useEffect } from 'react';
import { TrendingUp, Users, XCircle, Calendar, Award, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function StatsPanel() {
  const { stats, fetchStats, tables } = useStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const maxHourCount = Math.max(...(stats?.peakHours.map(h => h.count) || [0]), 1);
  const maxTableCount = Math.max(...(stats?.popularTables.map(t => t.count) || [1]), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">运营面板</h1>
        <p className="text-gray-500 mt-1">今日数据概览与分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">今日预约</p>
              <p className="text-4xl font-bold mt-2">{stats?.todayReservations || 0}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-sm">到店率</p>
              <p className="text-4xl font-bold mt-2">{stats?.checkInRate || 0}%</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">爽约次数</p>
              <p className="text-4xl font-bold mt-2">{stats?.noShowCount || 0}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <XCircle size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-primary-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">高峰时段</h2>
          </div>

          <div className="space-y-3">
            {stats?.peakHours.filter(h => h.hour >= 8 && h.hour <= 21).map(hour => (
              <div key={hour.hour} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-500 font-medium">
                  {hour.hour.toString().padStart(2, '0')}:00
                </span>
                <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-300 to-primary-500 rounded-lg transition-all duration-500"
                    style={{ width: `${(hour.count / maxHourCount) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-gray-700">
                  {hour.count}
                </span>
              </div>
            ))}
          </div>

          {!stats?.peakHours.length && (
            <p className="text-center text-gray-400 py-8">暂无数据</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="text-amber-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">热门桌位排行</h2>
          </div>

          <div className="space-y-3">
            {stats?.popularTables.map((table, index) => (
              <div
                key={table.tableId}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-600' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{table.tableNumber} 号桌</div>
                  <div className="text-xs text-gray-400">
                    {tables.find(t => t.id === table.tableId)?.capacity}人桌
                    {tables.find(t => t.id === table.tableId)?.isWindow && ' · 靠窗'}
                  </div>
                </div>
                <div className="flex-1 max-w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"
                    style={{ width: `${(table.count / maxTableCount) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-right font-semibold text-gray-700">
                  {table.count} 次
                </div>
              </div>
            ))}
          </div>

          {!stats?.popularTables.length && (
            <p className="text-center text-gray-400 py-8">暂无数据</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">爽约记录</h2>
        </div>

        {stats?.noShowRecords.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">联系电话</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">爽约次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.noShowRecords.map((record, index) => (
                  <tr key={record.phone} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{record.name}</td>
                    <td className="py-3 px-4 text-gray-600">{record.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-red-600 font-semibold">{record.count} 次</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>暂无爽约记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
