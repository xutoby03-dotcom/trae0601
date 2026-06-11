import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, MapPin, BarChart3 } from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import WaterChart from '@/components/WaterChart';
import StatCard from '@/components/StatCard';
import { buildDailyStats, calculateAverageWater, getLocationComparison } from '@/utils/waterCalculator';
import { getLastNDays } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import { DailyWaterStats } from '@/types';

export default function TrendsPage() {
  const navigate = useNavigate();
  const { pet, records, initDefaultPet } = usePetStore();
  
  const [selectedLocationA, setSelectedLocationA] = useState('');
  const [selectedLocationB, setSelectedLocationB] = useState('');
  
  useEffect(() => {
    initDefaultPet();
  }, [initDefaultPet]);
  
  useEffect(() => {
    if (records.length > 0) {
      const locations = [...new Set(records.map(r => r.bowlLocation))].filter(Boolean);
      if (locations.length >= 1) setSelectedLocationA(locations[0]);
      if (locations.length >= 2) setSelectedLocationB(locations[1]);
      else if (locations.length >= 1) setSelectedLocationB(locations[0]);
    }
  }, [records]);
  
  if (!pet) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  const last14Days = getLastNDays(14);
  const last14Records = last14Days
    .map(date => records.find(r => r.date === date))
    .filter(Boolean) as typeof records;
  
  const dailyStats = buildDailyStats(last14Records, pet);
  
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
  
  const allLocations = [...new Set(records.map(r => r.bowlLocation))].filter(Boolean);
  
  const locationComparison = getLocationComparison(dailyStats, selectedLocationA, selectedLocationB);
  const avgLocationA = calculateAverageWater(locationComparison.locationA);
  const avgLocationB = calculateAverageWater(locationComparison.locationB);
  
  const normalDays = dailyStats.filter(s => s.status === 'normal').length;
  const lowDays = dailyStats.filter(s => s.status === 'low').length;
  const highDays = dailyStats.filter(s => s.status === 'high' || s.status === 'consecutive_abnormal').length;
  
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
        <WaterChart data={dailyStats} title="最近14天饮水量" height={280} />
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-primary-500" />
          <h3 className="text-lg font-bold text-gray-800">水盆位置对比</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          对比不同位置的饮水量，找到猫咪最喜欢的喝水位置
        </p>
        
        {allLocations.length < 2 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <MapPin size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">至少需要 2 个不同位置的记录才能对比</p>
            <p className="text-gray-400 text-xs mt-1">在记录页面更改水盆位置即可</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">位置 A</label>
                <select
                  value={selectedLocationA}
                  onChange={(e) => setSelectedLocationA(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                >
                  {allLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">位置 B</label>
                <select
                  value={selectedLocationB}
                  onChange={(e) => setSelectedLocationB(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                >
                  {allLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">{selectedLocationA}</p>
                <p className="text-2xl font-bold text-primary-600">{avgLocationA} ml</p>
                <p className="text-xs text-gray-500 mt-1">
                  {locationComparison.locationA.length} 天记录
                </p>
              </div>
              <div className="bg-secondary-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">{selectedLocationB}</p>
                <p className="text-2xl font-bold text-secondary-600">{avgLocationB} ml</p>
                <p className="text-xs text-gray-500 mt-1">
                  {locationComparison.locationB.length} 天记录
                </p>
              </div>
            </div>
            
            {avgLocationA > 0 && avgLocationB > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-success-50 border border-success-100">
                <p className="text-sm text-success-700 text-center">
                  {avgLocationA > avgLocationB ? selectedLocationA : selectedLocationB} 的饮水量更高
                  （多 {Math.round(Math.abs(avgLocationA - avgLocationB))} ml，
                  {Math.round(Math.abs(avgLocationA - avgLocationB) / Math.min(avgLocationA, avgLocationB) * 100)}%）
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">每日状态详情</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {dailyStats.slice().reverse().map((stat) => (
            <div key={stat.date} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-800">{stat.date}</p>
                <p className="text-sm text-gray-500">{stat.waterConsumed} ml · {stat.bowlLocation}</p>
              </div>
              <StatusBadge status={stat.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
