import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Clock, AlertTriangle, FlaskConical } from 'lucide-react';
import { usePotStore } from '../store/usePotStore';
import { Card, SoupLevelGauge } from '../components/ui';
import { StatusBadge, TasteBadge, LevelBadge } from '../components/badges';
import { cn } from '../lib/utils';

export default function PotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPotById, getMonthlySpiceMap, pots } = usePotStore();
  const pot = getPotById(id || '');
  const monthlySpiceMap = useMemo(() => getMonthlySpiceMap(), [pots]);
  const monthlySpiceCount = pot ? (monthlySpiceMap[pot.id] || 0) : 0;

  if (!pot) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">未找到该卤锅</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-braised-red-600 hover:underline"
        >
          返回总览
        </button>
      </div>
    );
  }

  const isDanger = pot.status === 'danger';
  const isWarning = pot.status === 'warning';

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{pot.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={pot.status} />
            <span className="text-stone-500 text-sm">
              连续使用 <span className="font-mono font-medium">{pot.continuousUseHours}</span> 小时
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => navigate('/cooking-record')}
            className="px-4 py-2 bg-braised-red-600 hover:bg-braised-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            续煮记录
          </button>
          <button
            onClick={() => navigate('/production')}
            className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-medium transition-colors"
          >
            出品登记
          </button>
        </div>
      </div>

      {isDanger && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">告警事项</h3>
            <div className="mt-1 space-y-1 text-sm text-red-600">
              {pot.soupLevel < 30 && <p>• 剩汤液位过低（{pot.soupLevel}%），请及时续汤</p>}
              {pot.continuousUseHours >= 72 && (
                <p>• 连续使用已达 {pot.continuousUseHours} 小时，建议安排清锅</p>
              )}
              {pot.complaints.filter(c => {
                const t = new Date(c.timestamp).getTime();
                return Date.now() - t < 24 * 60 * 60 * 1000;
              }).length >= 2 && <p>• 24小时内客诉集中，请关注品质</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="汤位状态">
          <div className="flex items-center justify-center py-4">
            <SoupLevelGauge level={pot.soupLevel} size={140} strokeWidth={12} />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
            <div className="text-center">
              <p className="text-stone-500 text-xs">盐度</p>
              <div className="mt-1"><LevelBadge level={pot.salinity} type="salinity" /></div>
            </div>
            <div className="text-center">
              <p className="text-stone-500 text-xs">汤色</p>
              <div className="mt-1"><LevelBadge level={pot.color} type="color" /></div>
            </div>
          </div>
        </Card>

        <Card title="今日记录">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-braised-red-500" />
                <span className="text-stone-600 text-sm">续煮次数</span>
              </div>
              <span className="text-xl font-bold text-stone-800 font-mono">
                {pot.cookingRecords.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-gold-500" />
                <span className="text-stone-600 text-sm">出品批次</span>
              </div>
              <span className="text-xl font-bold text-stone-800 font-mono">
                {pot.productionBatches.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-stone-600 text-sm">本月香料</span>
              </div>
              <span className="text-xl font-bold text-stone-800 font-mono">
                {monthlySpiceCount} 包
              </span>
            </div>
          </div>
        </Card>

        <Card title="其他信息">
          <div className="space-y-4">
            <div>
              <p className="text-stone-500 text-sm mb-2">今日卤过的品类</p>
              <div className="flex flex-wrap gap-2">
                {pot.todayItems.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-braised-red-50 text-braised-red-700 text-sm rounded-full font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100">
              <p className="text-stone-500 text-sm mb-2">上次清锅</p>
              <p className="text-stone-800 font-medium">{pot.lastCleanDate}</p>
            </div>
            {pot.needSkim && (
              <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-500" />
                <span className="text-amber-700 text-sm font-medium">下次续煮建议撇油</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="最近续煮记录">
        {pot.cookingRecords.length === 0 ? (
          <p className="text-stone-400 text-center py-8">暂无续煮记录</p>
        ) : (
          <div className="space-y-3">
            {pot.cookingRecords.slice(0, 5).map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  index === 0
                    ? 'border-braised-red-200 bg-braised-red-50/50'
                    : 'border-stone-200 bg-stone-50/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500">
                      {new Date(record.timestamp).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-stone-300">|</span>
                    <span className="text-sm text-stone-600">{record.operator}</span>
                  </div>
                  <TasteBadge taste={record.tasteResult} size="sm" />
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-stone-500">加水</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">{record.waterAmount}ml</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-500">加盐</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">{record.saltAmount}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-500">糖色</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">{record.sugarAmount}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-500">香料</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">{record.spicePackCount}包</p>
                  </div>
                  <div className="text-center">
                    <p className="text-stone-500">老汤</p>
                    <p className="font-mono font-medium text-stone-700 mt-0.5">{record.stockAmount}ml</p>
                  </div>
                </div>
                {record.remark && (
                  <p className="mt-2 text-xs text-stone-500 border-t border-stone-200 pt-2">
                    备注：{record.remark}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="最近出品">
        {pot.productionBatches.length === 0 ? (
          <p className="text-stone-400 text-center py-8">暂无出品记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-500 border-b border-stone-200">
                  <th className="text-left py-2 px-3 font-medium">出锅时间</th>
                  <th className="text-left py-2 px-3 font-medium">品类</th>
                  <th className="text-right py-2 px-3 font-medium">数量</th>
                  <th className="text-left py-2 px-3 font-medium">操作人</th>
                  <th className="text-center py-2 px-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {pot.productionBatches.slice(0, 5).map((batch) => (
                  <tr key={batch.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="py-2.5 px-3 text-stone-600">
                      {new Date(batch.outTime).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">{batch.itemName}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-stone-700">{batch.quantity} 斤</td>
                    <td className="py-2.5 px-3 text-stone-600">{batch.operator}</td>
                    <td className="py-2.5 px-3 text-center">
                      {batch.hasComplaint ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          有客诉
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
