import { TrendingUp, Route, Clock, ArrowRight, Flag, MapPin } from 'lucide-react';
import { useCheckpointStore } from '@/store/useCheckpointStore';
import { calculateRouteInfo, getDifficultyText, getDifficultyBarColor, formatDistance } from '@/utils/helpers';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/types';

export default function RouteDisplay() {
  const { checkpoints } = useCheckpointStore();
  const sortedCheckpoints = [...checkpoints].sort((a, b) => a.orderIndex - b.orderIndex);
  const routeInfo = calculateRouteInfo(checkpoints);

  const difficultyPercentage = routeInfo.maxDifficulty * 20;

  return (
    <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-terrain-100 rounded-xl flex items-center justify-center">
          <Route className="w-5 h-5 text-terrain-600" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-forest-800">路线信息</h2>
          <p className="text-sm text-gray-500">整体路线难度、距离与撤点顺序</p>
        </div>
      </div>

      {checkpoints.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无检查点数据</p>
          <p className="text-sm">请先添加检查点以查看路线信息</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-forest-600 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>点位数量</span>
              </div>
              <div className="text-3xl font-display font-bold text-forest-800">
                {checkpoints.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">个检查点</div>
            </div>

            <div className="bg-gradient-to-br from-terrain-50 to-terrain-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-terrain-600 text-sm mb-2">
                <Route className="w-4 h-4" />
                <span>总距离</span>
              </div>
              <div className="text-3xl font-display font-bold text-terrain-700">
                {formatDistance(routeInfo.totalDistance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">平均间距 {formatDistance(routeInfo.averageDistance)}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
                <Clock className="w-4 h-4" />
                <span>预计用时</span>
              </div>
              <div className="text-3xl font-display font-bold text-blue-700">
                {Math.round(routeInfo.totalDistance / 80)}
              </div>
              <div className="text-xs text-gray-500 mt-1">分钟 (约 {Math.round(routeInfo.totalDistance / 80 / 60 * 10) / 10} 小时)</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-600 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>路线难度</span>
              </div>
              <div className="text-3xl font-display font-bold text-orange-700">
                {getDifficultyText(routeInfo.difficultyLevel)}
              </div>
              <div className="text-xs text-gray-500 mt-1">最高 {DIFFICULTY_LABELS[routeInfo.maxDifficulty]}</div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">整体难度评估</h3>
              <span className={`badge ${
                routeInfo.difficultyLevel === 'easy' ? 'bg-green-100 text-green-700' :
                routeInfo.difficultyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                routeInfo.difficultyLevel === 'hard' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getDifficultyText(routeInfo.difficultyLevel)}
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getDifficultyBarColor(routeInfo.difficultyLevel)} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${difficultyPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>入门</span>
              <span>进阶</span>
              <span>专业</span>
              <span>挑战</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-forest-600" />
              相邻点距离
            </h3>
            <div className="space-y-2">
              {sortedCheckpoints.slice(0, -1).map((cp, idx) => (
                <div key={cp.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
                  <div className={`w-8 h-8 rounded-full ${DIFFICULTY_COLORS[cp.difficulty]} text-white flex items-center justify-center text-sm font-bold`}>
                    {cp.orderIndex}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-forest-700">{cp.pointNumber}</span>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <span className="font-mono text-gray-500">{sortedCheckpoints[idx + 1]?.pointNumber}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{cp.terrainDescription}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-terrain-600">{formatDistance(cp.distanceToNext)}</div>
                    <div className="text-xs text-gray-400">约 {Math.round(cp.distanceToNext / 80)} 分钟</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-alert-orange" />
              撤点顺序 (从后往前)
            </h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-alert-orange to-gray-200" />
              {routeInfo.withdrawalOrder.map((pointNum, idx) => {
                const cp = checkpoints.find(c => c.pointNumber === pointNum);
                return (
                  <div key={pointNum} className="relative flex items-center gap-3 py-2">
                    <div className={`absolute -left-[22px] w-5 h-5 rounded-full border-2 border-white shadow ${
                      idx === 0 ? 'bg-alert-orange' : 'bg-gray-300'
                    } flex items-center justify-center text-white text-[10px] font-bold`}>
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${
                        idx === 0 ? 'text-alert-orange' : 'text-gray-600'
                      }`}>
                        {pointNum}
                      </span>
                      {cp && (
                        <span className="text-xs text-gray-400">
                          {cp.terrainDescription} · {cp.hideMethod}
                        </span>
                      )}
                    </div>
                    {idx === 0 && (
                      <span className="badge bg-alert-orange/10 text-alert-orange text-[10px]">
                        最先撤点
                      </span>
                    )}
                    {idx === routeInfo.withdrawalOrder.length - 1 && routeInfo.withdrawalOrder.length > 1 && (
                      <span className="badge bg-forest-100 text-forest-600 text-[10px]">
                        最后撤点
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
