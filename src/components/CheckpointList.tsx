import { Edit3, Trash2, ChevronUp, ChevronDown, Battery, Shield, Clock, MapPin } from 'lucide-react';
import { useCheckpointStore } from '@/store/useCheckpointStore';
import { getBatteryStatus, formatTime, formatDistance } from '@/utils/helpers';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types';

export default function CheckpointList() {
  const { checkpoints, setEditingId, deleteCheckpoint, moveCheckpoint } = useCheckpointStore();
  const sorted = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-forest-800">检查点列表</h2>
            <p className="text-sm text-gray-500">
              共 {checkpoints.length} 个检查点 · 按顺序排列
            </p>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">还没有添加检查点</p>
          <p className="text-sm mt-1">使用上方表单添加第一个检查点</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-forest-100">
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">顺序</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">编号</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">地貌</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">隐藏方式</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  预计时间
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Battery className="w-3.5 h-3.5 inline mr-1" />
                  电量
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  备用
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">难度</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">距下一点</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((cp, idx) => {
                const batteryStatus = getBatteryStatus(cp.batteryLevel);
                return (
                  <tr
                    key={cp.id}
                    className="hover:bg-forest-50/50 transition-colors group"
                  >
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveCheckpoint(cp.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        </button>
                        <div className={`w-7 h-7 rounded-full ${DIFFICULTY_COLORS[cp.difficulty]} text-white flex items-center justify-center text-sm font-bold`}>
                          {cp.orderIndex}
                        </div>
                        <button
                          onClick={() => moveCheckpoint(cp.id, 'down')}
                          disabled={idx === sorted.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-mono font-bold text-forest-700 bg-forest-50 px-2 py-1 rounded">
                        {cp.pointNumber}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-sm text-gray-700 max-w-[160px] truncate" title={cp.terrainDescription}>
                      {cp.terrainDescription}
                    </td>
                    <td className="py-4 px-3 text-sm text-gray-600">
                      {cp.hideMethod}
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-mono text-gray-700">
                        {formatTime(cp.estimatedArrival)}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cp.batteryLevel >= 80 ? 'bg-alert-green' :
                              cp.batteryLevel >= 50 ? 'bg-yellow-400' :
                              cp.batteryLevel >= 20 ? 'bg-alert-orange' :
                              'bg-alert-red'
                            }`}
                            style={{ width: `${cp.batteryLevel}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${batteryStatus.color}`}>
                          {cp.batteryLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      {cp.hasBackup ? (
                        <Shield className="w-5 h-5 text-alert-green" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`badge ${DIFFICULTY_COLORS[cp.difficulty]} text-white`}>
                        {DIFFICULTY_LABELS[cp.difficulty]}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-medium text-terrain-600">
                        {cp.distanceToNext > 0 ? formatDistance(cp.distanceToNext) : '终点'}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingId(cp.id)}
                          className="p-2 hover:bg-forest-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4 text-forest-600" />
                        </button>
                        <button
                          onClick={() => deleteCheckpoint(cp.id)}
                          className="p-2 hover:bg-alert-red/10 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-alert-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span>极易</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-lime-400" />
            <span>较易</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>中等</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span>较难</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>极难</span>
          </div>
        </div>
      )}
    </div>
  );
}
