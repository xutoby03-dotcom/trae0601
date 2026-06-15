import { User, Clock, Package, Building2, FileText } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { formatDateTime } from '../utils/time';

export default function MyClaims() {
  const { getMyClaims, currentUserName, currentUserDept } = useFoodStore();
  const myClaims = getMyClaims(currentUserName);

  const totalClaimed = myClaims.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">我的认领</h1>
            <p className="text-coffee-500 text-sm">查看您的认领历史记录</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="text-sm text-coffee-500 mb-2">认领次数</div>
            <div className="text-3xl font-bold text-coffee-800">{myClaims.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="text-sm text-coffee-500 mb-2">认领份数</div>
            <div className="text-3xl font-bold text-primary-600">{totalClaimed}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="text-sm text-coffee-500 mb-2">所属部门</div>
            <div className="text-xl font-bold text-blue-600">{currentUserDept}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-warm-100">
            <h2 className="font-semibold text-coffee-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-coffee-500" />
              认领记录
            </h2>
          </div>

          {myClaims.length > 0 ? (
            <div className="divide-y divide-warm-100">
              {myClaims.map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 flex items-center gap-4 hover:bg-warm-50 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-coffee-800 mb-1">
                      {record.foodName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-coffee-500">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {record.quantity} 份
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {record.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        取走: {formatDateTime(record.pickupTime)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-coffee-400">认领时间</div>
                    <div className="text-sm text-coffee-600">
                      {formatDateTime(record.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-coffee-300" />
              </div>
              <h3 className="text-lg font-semibold text-coffee-700 mb-2">暂无认领记录</h3>
              <p className="text-coffee-500 mb-4">去认领大厅看看有什么好吃的吧～</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
