import TodayRecommendedCard from '@/components/Dashboard/TodayRecommendedCard';
import LastFailureCard from '@/components/Dashboard/LastFailureCard';
import CalibrationAlert from '@/components/Dashboard/CalibrationAlert';
import { useCoffeeStore } from '@/store/coffeeStore';
import { Link } from 'react-router-dom';
import { List, Plus } from 'lucide-react';

export default function Dashboard() {
  const records = useCoffeeStore((s) => s.records);
  const totalCount = records.length;
  const negativeCount = records.filter((r) => r.negativeReason !== null).length;
  const uniqueBeans = new Set(records.map((r) => r.beanName)).size;

  return (
    <div className="animate-fade-in-up">
      <CalibrationAlert />

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-coffee-800 mb-1">吧台仪表盘</h1>
        <p className="text-coffee-500">今天的手冲参数都在这里了</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-full bg-coffee-100 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-coffee-700">{totalCount}</span>
          </div>
          <div>
            <p className="text-sm text-coffee-500">总记录数</p>
            <p className="font-semibold text-coffee-800">组参数</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-amber">{negativeCount}</span>
          </div>
          <div>
            <p className="text-sm text-coffee-500">改版记录</p>
            <p className="font-semibold text-coffee-800">次调整</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-full bg-matcha/10 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-matcha">{uniqueBeans}</span>
          </div>
          <div>
            <p className="text-sm text-coffee-500">在用豆子</p>
            <p className="font-semibold text-coffee-800">支豆款</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TodayRecommendedCard />
        <LastFailureCard />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-coffee-800">快速操作</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/records"
          className="card p-5 card-hover flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-lg bg-coffee-100 flex items-center justify-center group-hover:bg-coffee-200 transition-colors">
            <List className="w-6 h-6 text-coffee-600" />
          </div>
          <div>
            <p className="font-semibold text-coffee-800 group-hover:text-coffee-900">查看完整参数表</p>
            <p className="text-sm text-coffee-500">按豆子、磨豆机、滤杯筛选查看</p>
          </div>
        </Link>
        <Link
          to="/records/new"
          className="card p-5 card-hover flex items-center gap-4 group border-2 border-dashed border-coffee-300"
        >
          <div className="w-12 h-12 rounded-lg bg-matcha/10 flex items-center justify-center group-hover:bg-matcha/20 transition-colors">
            <Plus className="w-6 h-6 text-matcha" />
          </div>
          <div>
            <p className="font-semibold text-coffee-800 group-hover:text-coffee-900">新增参数记录</p>
            <p className="text-sm text-coffee-500">记录新豆子的冲煮参数</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
