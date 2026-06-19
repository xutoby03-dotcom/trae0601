import { ShoppingBag, RefreshCw, Package, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDateTime } from '@/utils/format';

export default function RecordsPage() {
  const { records } = useStore();

  const sortedRecords = [...records].sort((a, b) => b.createdAt - a.createdAt);

  const stats = {
    total: records.length,
    withPurchase: records.filter(r => r.purchasedCount > 0).length,
    withExchange: records.filter(r => r.exchangedCount > 0).length,
    withLeftItems: records.filter(r => r.leftItems.length > 0).length,
    cleaned: records.filter(r => r.cleaned).length,
    totalPurchased: records.reduce((sum, r) => sum + r.purchasedCount, 0),
    totalExchanged: records.reduce((sum, r) => sum + r.exchangedCount, 0),
  };

  const statCards = [
    { label: '总记录数', value: stats.total, icon: CheckCircle, color: 'text-burgundy-500', bg: 'bg-burgundy-500/10' },
    { label: '有购买', value: stats.withPurchase, icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: '有换码', value: stats.withExchange, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: '有遗落物', value: stats.withLeftItems, icon: Package, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-cream-100">试衣记录</h2>
        <p className="text-cream-400 mt-1">购买记录、换码记录、遗落物追踪</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-charcoal-500 text-sm">{stat.label}</p>
                  <p className={`font-display text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-5 h-5 text-green-500" />
            <h3 className="font-display text-lg text-charcoal-800">销售总览</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-charcoal-600">总售出件数</span>
              <span className="font-display text-3xl font-bold text-green-600">{stats.totalPurchased}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-600">总换码件数</span>
              <span className="font-display text-3xl font-bold text-blue-600">{stats.totalExchanged}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-600">已清洁房间</span>
              <span className="font-display text-3xl font-bold text-charcoal-700">{stats.cleaned}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-yellow-600" />
            <h3 className="font-display text-lg text-charcoal-800">遗落物品待处理</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
            {records.filter(r => r.leftItems.length > 0).length === 0 ? (
              <div className="text-center py-4 text-charcoal-400">暂无遗落物品</div>
            ) : (
              records.filter(r => r.leftItems.length > 0).map(record => (
                <div key={record.id} className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-charcoal-700">
                      {record.roomNumber}号 · {record.queueNumber}号
                    </span>
                    <span className="text-charcoal-500">{formatDateTime(record.createdAt)}</span>
                  </div>
                  <div className="text-yellow-700 mt-1">{record.leftItems.join('、')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-xl text-charcoal-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-champagne-500" />
          详细记录
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-300">
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">时间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">号码</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">顾客</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">试衣间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">导购</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-charcoal-600">购买</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-charcoal-600">换码</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">遗落物</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-charcoal-600">已清洁</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-charcoal-400">
                    暂无试衣记录
                  </td>
                </tr>
              ) : (
                sortedRecords.map(record => (
                  <tr key={record.id} className="border-b border-cream-100 hover:bg-cream-100 transition-colors">
                    <td className="py-3 px-4 text-sm text-charcoal-600">{formatDateTime(record.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className="font-display text-lg font-bold text-charcoal-800">{record.queueNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-charcoal-700">{record.customerName || '-'}</td>
                    <td className="py-3 px-4 text-charcoal-700">{record.roomNumber}</td>
                    <td className="py-3 px-4 text-charcoal-700">{record.assistantName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${record.purchasedCount > 0 ? 'text-green-600' : 'text-charcoal-400'}`}>
                        {record.purchasedCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${record.exchangedCount > 0 ? 'text-blue-600' : 'text-charcoal-400'}`}>
                        {record.exchangedCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {record.leftItems.length > 0 ? (
                        <span className="text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-sm">
                          {record.leftItems.join('、')}
                        </span>
                      ) : (
                        <span className="text-charcoal-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {record.cleaned ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-red-500">×</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
