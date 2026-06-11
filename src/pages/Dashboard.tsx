import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Plus, CircleDot, MapPin } from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { buildDailyStats, calculateWaterConsumed, calculateReferenceWater } from '@/utils/waterCalculator';
import { getLastNDays, getTodayString, formatDateChinese } from '@/utils/date';
import PetCard from '@/components/PetCard';
import WaterChart from '@/components/WaterChart';
import RecordCard from '@/components/RecordCard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { calculateStatus } from '@/utils/waterCalculator';

export default function Dashboard() {
  const navigate = useNavigate();
  const { pet, records, initDefaultPet, getRecordByDate } = usePetStore();
  
  useEffect(() => {
    initDefaultPet();
  }, [initDefaultPet]);
  
  if (!pet) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  const today = getTodayString();
  const todayRecord = getRecordByDate(today);
  const last7Days = getLastNDays(7);
  
  const last7Records = last7Days
    .map(date => records.find(r => r.date === date))
    .filter(Boolean) as typeof records;
  
  const dailyStats = buildDailyStats(last7Records, pet);
  
  const todayStats = dailyStats.find(s => s.date === today);
  const referenceWater = calculateReferenceWater(pet.weight, pet.waterBaseCoefficient);
  
  const todayWaterConsumed = todayRecord 
    ? calculateWaterConsumed(todayRecord.waterAdded, todayRecord.waterRemaining)
    : 0;
  const todayStatus = todayStats?.status || calculateStatus(todayWaterConsumed, referenceWater);
  
  const avgWater = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, s) => sum + s.waterConsumed, 0) / dailyStats.length)
    : 0;
  
  const totalUrineClumps = dailyStats.reduce((sum, s) => sum + s.urineClumps, 0);
  
  const allLocations = [...new Set(records.map(r => r.bowlLocation))].filter(Boolean);
  
  return (
    <div className="pb-24 md:pb-8">
      <div className="mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          你好，<span className="text-primary-500">{pet.name}</span>的铲屎官 👋
        </h1>
        <p className="text-gray-500 mt-1">今天也要好好喝水哦～</p>
      </div>
      
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 md:p-6 text-white mb-6 shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-100 text-sm">今日饮水状态</p>
            <div className="mt-2">
              <StatusBadge status={todayStatus} size="lg" animate={todayStatus !== 'normal'} />
            </div>
          </div>
          <button
            onClick={() => navigate('/record')}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors backdrop-blur-sm"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">记录</span>
          </button>
        </div>
        
        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl md:text-5xl font-bold">{todayWaterConsumed}</span>
          <span className="text-primary-100 mb-1">ml</span>
        </div>
        
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-white rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min((todayWaterConsumed / referenceWater) * 100, 100)}%` }}
          />
        </div>
        <p className="text-primary-100 text-sm">
          参考饮水量 {referenceWater} ml · 已完成 {Math.round((todayWaterConsumed / referenceWater) * 100)}%
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="日均饮水"
          value={avgWater}
          unit="ml"
          icon={<Droplets size={20} />}
          color="secondary"
          delay={200}
        />
        <StatCard
          title="七日尿团"
          value={totalUrineClumps}
          unit="个"
          icon={<CircleDot size={20} />}
          color="primary"
          delay={300}
        />
        <StatCard
          title="记录天数"
          value={dailyStats.length}
          unit="天"
          icon={<Droplets size={20} />}
          color="success"
          delay={400}
        />
        <StatCard
          title="水盆位置"
          value={allLocations.length}
          unit="处"
          icon={<MapPin size={20} />}
          color="warning"
          delay={500}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WaterChart data={dailyStats} title="最近七天饮水量" />
        </div>
        <div className="space-y-6">
          <PetCard pet={pet} onEdit={() => navigate('/profile')} delay={300} />
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">最近记录</h3>
          <button
            onClick={() => navigate('/record')}
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            查看全部 →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyStats.slice(-3).reverse().map((stat, index) => {
            const record = records.find(r => r.date === stat.date);
            if (!record) return null;
            return (
              <RecordCard
                key={stat.date}
                record={record}
                pet={pet}
                onClick={() => navigate(`/record?date=${stat.date}`)}
                delay={index * 100 + 400}
              />
            );
          })}
        </div>
        
        {dailyStats.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Droplets size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">还没有饮水记录</p>
            <button
              onClick={() => navigate('/record')}
              className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
            >
              添加第一条记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
