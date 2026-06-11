import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Flame,
  Clock,
  Trophy,
  Calendar,
  Baby,
} from 'lucide-react';
import StatsChart from '@/components/StatsChart';
import UnclaimedList from '@/components/UnclaimedList';
import StrollerForm from '@/components/StrollerForm';
import PatrolModal from '@/components/PatrolModal';
import StrollerDetail from '@/components/StrollerDetail';
import { useStrollerStore } from '@/store/useStrollerStore';

export default function StatsPage() {
  const { getTopBlockingLocations, getLongUnclaimedCars, getTotalStats, patrolRecords } =
    useStrollerStore();

  const topLocations = getTopBlockingLocations(10);
  const unclaimed = getLongUnclaimedCars();
  const stats = getTotalStats();
  const totalBlockingRecords = patrolRecords.filter((r) => r.status === 'blocking').length;

  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-br from-brand-50 via-white to-orange-50/40 border-b border-slate-100">
        <div className="container py-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link to="/" className="btn-ghost -ml-3">
              <ArrowLeft className="w-4 h-4" />
              返回看板
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              数据周期：{monthLabel}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">月度统计看板</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                占道热点分析 & 长期未认领车辆追踪
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard
              label="占道挡路总次数"
              value={totalBlockingRecords}
              unit="次"
              icon={<Flame className="w-6 h-6" />}
              gradient="from-red-500 to-orange-500"
              delay={0}
            />
            <SummaryCard
              label="占道位置热点"
              value={topLocations.length}
              unit="处"
              icon={<Trophy className="w-6 h-6" />}
              gradient="from-amber-500 to-yellow-500"
              delay={80}
            />
            <SummaryCard
              label="长期未认领车辆"
              value={unclaimed.length}
              unit="辆"
              icon={<Clock className="w-6 h-6" />}
              gradient="from-purple-500 to-pink-500"
              delay={160}
            />
            <SummaryCard
              label="登记在册总车辆"
              value={stats.total}
              unit="辆"
              icon={<Baby className="w-6 h-6" />}
              gradient="from-brand-500 to-teal-500"
              delay={240}
            />
          </div>
        </div>
      </div>

      <div className="container py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <section className="card p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">占道次数 Top 位置排行</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    本月累计，消防通道区域以红色高亮显示
                  </p>
                </div>
              </div>
              <div className="text-sm text-slate-400 hidden md:block">
                按次数降序 · Top 10
              </div>
            </div>
            <StatsChart data={topLocations} />
          </section>

          <section className="card p-6 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-brand-50/50 border border-brand-100">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                管理建议
              </h3>
              <ul className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                {topLocations[0] && (
                  <li>
                    📍 <span className="font-semibold">「{topLocations[0].location}」</span>
                    是占道最频繁位置（{topLocations[0].blockingCount} 次），建议设置物理隔离栏或增设临时停车区
                  </li>
                )}
                {unclaimed.length > 0 && (
                  <li>
                    ⏰ 目前有 <span className="font-semibold text-purple-600">{unclaimed.length}</span>
                    辆长期未认领车辆，建议安排专人上门沟通或张贴通知单
                  </li>
                )}
                {totalBlockingRecords > 5 && (
                  <li>
                    📢 本月占道记录已达 <span className="font-semibold text-red-600">{totalBlockingRecords}</span>
                    次，建议在业主群发布月度管理公告提醒规范停放
                  </li>
                )}
                {totalBlockingRecords === 0 && (
                  <li>
                    ✨ 本月暂无占道记录，管理情况良好！建议保持定期巡查。
                  </li>
                )}
              </ul>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="card p-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">长期未认领车辆</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    超过 30 天未更新状态的车辆
                  </p>
                </div>
              </div>
              <span
                className={`badge ${
                  unclaimed.length > 0
                    ? 'bg-purple-500 text-white'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}
              >
                {unclaimed.length} 辆
              </span>
            </div>
            <UnclaimedList cars={unclaimed} />
          </section>
        </div>
      </div>

      <StrollerForm />
      <PatrolModal />
      <StrollerDetail />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  icon,
  gradient,
  delay,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 bg-white shadow-card border border-slate-100 animate-fade-in-up group hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-0.5">
        {value}
        <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
      </div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
