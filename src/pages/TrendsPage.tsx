import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MapPin, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import WaterChart from '@/components/WaterChart';
import StatCard from '@/components/StatCard';
import { buildDailyStats, calculateAverageWater, getAllLocationChangeComparisons } from '@/utils/waterCalculator';
import { getLastNDays, formatDateChinese } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import { LocationChangeComparison } from '@/types';

export default function TrendsPage() {
  const navigate = useNavigate();
  const { pet, records, initDefaultPet } = usePetStore();
  
  const [selectedChangeIndex, setSelectedChangeIndex] = useState(0);
  
  useEffect(() => {
    initDefaultPet();
  }, [initDefaultPet]);
  
  if (!pet) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  const last30Days = getLastNDays(30);
  const last30Records = last30Days
    .map(date => records.find(r => r.date === date))
    .filter(Boolean) as typeof records;
  
  const dailyStats = buildDailyStats(last30Records, pet);
  
  const last7Stats = dailyStats.slice(-7);
  const prev7Stats = dailyStats.slice(-14, -7);
  
  const avg7Days = calculateAverageWater(last7Stats);
  const avgPrev7Days = calculateAverageWater(prev7Stats);
  
  const trend = avgPrev7Days > 0 
    ? avg7Days > avgPrev7Days * 1.05 ? 'up' : avg7Days < avgPrev7Days * 0.95 ? 'down' : 'neutral'
    : 'neutral';
  const trendValue = avgPrev7Days > 0 
    ? `${Math.round(((avg7Days - avgPrev7Days) / avgPrev7Days) * 100)}%`
    : '-';
  
  const normalDays = dailyStats.filter(s => s.status === 'normal').length;
  const lowDays = dailyStats.filter(s => s.status === 'low').length;
  const highDays = dailyStats.filter(s => s.status === 'high' || s.status === 'consecutive_abnormal').length;
  
  const allComparisons = getAllLocationChangeComparisons(dailyStats);
  const currentComparison: LocationChangeComparison | null = allComparisons[selectedChangeIndex] || null;
  
  return (
    <div className="pb-24 md:pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">趋势分析</h1>
          <p className="text-sm text-gray-500">详细了解猫咪的饮水趋势</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="7日平均"
          value={avg7Days}
          unit="ml"
          icon={<TrendingUp size={20} />}
          color="primary"
          trend={trend}
          trendValue={trendValue}
          delay={100}
        />
        <StatCard
          title="正常天数"
          value={normalDays}
          unit="天"
          icon={<BarChart3 size={20} />}
          color="success"
          delay={200}
        />
        <StatCard
          title="偏少天数"
          value={lowDays}
          unit="天"
          icon={<BarChart3 size={20} />}
          color="warning"
          delay={300}
        />
        <StatCard
          title="偏多天数"
          value={highDays}
          unit="天"
          icon={<BarChart3 size={20} />}
          color="danger"
          delay={400}
        />
      </div>
      
      <div className="mb-6">
        <WaterChart data={last7Stats} title="最近7天饮水量" height={300} />
      </div>
      
      <div className="mb-6">
        <WaterChart data={dailyStats} title="最近饮水量趋势" height={280} />
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-primary-500" />
          <h3 className="text-lg font-bold text-gray-800">水盆位置对比</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          自动检测换水盆的日期，对比变更前 7 天和变更当日起 7 天的饮水量变化
        </p>
        
        {allComparisons.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <MapPin size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">还没有检测到换水盆的记录</p>
            <p className="text-gray-400 text-xs mt-1">在记录页面更改水盆位置，变更前后各需 1 天以上记录才能对比</p>
          </div>
        ) : (
          <>
            {allComparisons.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {allComparisons.map((comp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedChangeIndex(idx)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm transition-all
                      ${selectedChangeIndex === idx
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {formatDateChinese(comp.changePoint.date)} 换位置
                  </button>
                ))}
              </div>
            )}
            
            {currentComparison && (
              <>
                <div className="bg-primary-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">变更前</p>
                      <p className="font-semibold text-gray-800">{currentComparison.changePoint.fromLocation}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight size={20} className="text-primary-500" />
                      <p className="text-xs text-primary-600 font-medium">{formatDateChinese(currentComparison.changePoint.date)} 更换</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">变更后</p>
                      <p className="font-semibold text-gray-800">{currentComparison.changePoint.toLocation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      变更前 {currentComparison.beforeDays >= 7 ? '满 7 天' : `${currentComparison.beforeDays}/7 天`}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">{currentComparison.changePoint.fromLocation}</p>
                    <p className="text-3xl font-bold text-gray-800">{currentComparison.beforeAvg}</p>
                    <p className="text-sm text-gray-500">ml / 天</p>
                    {currentComparison.beforeDays < 7 && (
                      <p className="text-xs text-warning-600 mt-1">
                        还差 {7 - currentComparison.beforeDays} 天数据
                      </p>
                    )}
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-primary-600 mb-1">
                      变更后 {currentComparison.afterDays >= 7 ? '满 7 天' : `${currentComparison.afterDays}/7 天`}
                    </p>
                    <p className="text-sm text-primary-700 mb-1">{currentComparison.changePoint.toLocation}</p>
                    <p className="text-3xl font-bold text-primary-600">{currentComparison.afterAvg}</p>
                    <p className="text-sm text-primary-500">ml / 天</p>
                    {currentComparison.afterDays < 7 && (
                      <p className="text-xs text-warning-600 mt-1">
                        还差 {7 - currentComparison.afterDays} 天数据
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">差值</p>
                    <p className={`text-lg font-bold ${
                      currentComparison.diffMl > 0 ? 'text-success-600' :
                      currentComparison.diffMl < 0 ? 'text-danger-600' : 'text-gray-600'
                    }`}>
                      {currentComparison.diffMl > 0 ? '+' : ''}{currentComparison.diffMl} ml
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">变化幅度</p>
                    <p className={`text-lg font-bold ${
                      currentComparison.diffPercent > 0 ? 'text-success-600' :
                      currentComparison.diffPercent < 0 ? 'text-danger-600' : 'text-gray-600'
                    }`}>
                      {currentComparison.diffPercent > 0 ? '+' : ''}{currentComparison.diffPercent}%
                    </p>
                  </div>
                </div>
                
                {currentComparison.betterLocation ? (
                  <div className="mt-4 p-3 rounded-xl bg-success-50 border border-success-100 flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-success-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-success-700">
                        <span className="font-semibold">{currentComparison.betterLocation}</span> 的饮水量更高
                        （多 {Math.abs(currentComparison.diffMl)} ml，{Math.abs(currentComparison.diffPercent)}%）
                      </p>
                      {(currentComparison.beforeDays < 7 || currentComparison.afterDays < 7) && (
                        <p className="text-xs text-success-600 mt-1">
                          ⚠️ 数据未满 7 天，结论仅供参考，建议继续观察
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-600 text-center">
                      {currentComparison.beforeDays < 3 || currentComparison.afterDays < 3
                        ? '数据太少，暂无法判断哪个位置更好，建议再记录几天'
                        : '两个位置的饮水量差异不明显，建议继续观察几天'
                      }
                    </p>
                    {(currentComparison.beforeDays < 7 || currentComparison.afterDays < 7) && (
                      <p className="text-xs text-gray-500 text-center mt-1">
                        变更前还差 {Math.max(0, 7 - currentComparison.beforeDays)} 天，
                        变更后还差 {Math.max(0, 7 - currentComparison.afterDays)} 天凑满 7 天
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">每日状态详情</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dailyStats.slice().reverse().map((stat) => (
            <div key={stat.date} className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{formatDateChinese(stat.date)}</p>
                  {stat.locationChanged && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700">
                      <MapPin size={10} />
                      换位置
                    </span>
                  )}
                </div>
                <StatusBadge status={stat.status} size="sm" />
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span>{stat.waterConsumed} ml</span>
                <span>·</span>
                <span>
                  {stat.locationChanged && stat.previousLocation ? (
                    <>
                      <span className="line-through text-gray-400">{stat.previousLocation}</span>
                      <span className="mx-1">→</span>
                      <span className="text-primary-600 font-medium">{stat.bowlLocation}</span>
                    </>
                  ) : (
                    stat.bowlLocation
                  )}
                </span>
                <span>·</span>
                <span>{stat.urineClumps} 个尿团</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
