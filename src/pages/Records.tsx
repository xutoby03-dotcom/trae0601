import { FileText, Clock, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { formatDateTime } from '../utils/time';

export default function Records() {
  const { disposalRecords } = useFoodStore();

  const reasonLabels: Record<string, string> = {
    expired: '过期下架',
    unclaimed: '无人认领',
  };

  const reasonColors: Record<string, string> = {
    expired: 'bg-red-100 text-red-700 border-red-200',
    unclaimed: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">处理记录</h1>
            <p className="text-coffee-500 text-sm">所有过期或无人认领的食品处理记录</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {disposalRecords.length > 0 ? (
            <div className="divide-y divide-warm-100">
              {disposalRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 flex items-center gap-4 hover:bg-warm-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-12 h-12 bg-warm-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-coffee-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-coffee-800 truncate">
                        {record.foodName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          reasonColors[record.reason]
                        }`}
                      >
                        {reasonLabels[record.reason]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-coffee-500">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {record.quantity} 份
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(record.disposedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-coffee-300" />
              </div>
              <h3 className="text-lg font-semibold text-coffee-700 mb-2">暂无处理记录</h3>
              <p className="text-coffee-500">太好了！目前还没有食品被处理掉</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800 mb-1">温馨提示</div>
              <div className="text-sm text-amber-700">
                开封食品超过可食用时间会自动下架进入处理记录。请各部门合理预订茶歇数量，减少食物浪费。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
