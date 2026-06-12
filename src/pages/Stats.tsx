import { useMemo } from 'react';
import { BarChart3, Coffee, Droplets, AlertTriangle } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import StatCard from '../components/stats/StatCard';
import OriginChart from '../components/stats/OriginChart';
import ValueRanking from '../components/stats/ValueRanking';
import CommonParams from '../components/stats/CommonParams';

const Stats = () => {
  const { getStats, beans, brewRecords } = useCoffeeStore();
  const stats = useMemo(() => getStats(), [beans, brewRecords]);

  return (
    <div className="min-h-screen bg-[#F5EFE6] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-[#4A3728] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            数据统计
          </h1>
          <p className="text-[#6B5748]">看看你的咖啡口味偏好</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="咖啡豆总数"
            value={stats.totalBeans}
            icon={<Coffee className="w-5 h-5" />}
            subtitle="款豆子"
            accent="primary"
          />
          <StatCard
            title="冲煮记录"
            value={stats.totalBrews}
            icon={<Droplets className="w-5 h-5" />}
            subtitle="杯咖啡"
            accent="success"
          />
          <StatCard
            title="库存预警"
            value={stats.lowStockCount}
            icon={<AlertTriangle className="w-5 h-5" />}
            subtitle="款快喝完了"
            accent="warning"
          />
          <StatCard
            title="最爱产区"
            value={stats.favoriteOrigin}
            icon={<BarChart3 className="w-5 h-5" />}
            subtitle="冲煮最多"
            accent="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OriginChart />
          <ValueRanking />
        </div>

        <div className="mb-8">
          <CommonParams />
        </div>
      </div>
    </div>
  );
};

export default Stats;
