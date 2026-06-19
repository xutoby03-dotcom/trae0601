import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import SessionSelector from '@/components/SessionSelector';
import AnimatedNumber from '@/components/AnimatedNumber';
import ProgressRing from '@/components/ProgressRing';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  CloudSun,
  Umbrella,
  Thermometer,
  Wind,
  Sun,
  Baby,
  Accessibility,
  Heart,
  Armchair,
} from 'lucide-react';

export default function Dashboard() {
  const { selectedSessionId, dashboard, fetchDashboard, fetchSessions } = useAppStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (selectedSessionId) fetchDashboard(selectedSessionId);
  }, [selectedSessionId, fetchDashboard]);

  const checkinRate = dashboard && dashboard.totalRegistered > 0
    ? Math.round((dashboard.checkedIn / dashboard.totalRegistered) * 100)
    : 0;

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('雨')) return <Umbrella className="text-blue-500" size={28} />;
    if (weather.includes('云') || weather.includes('阴')) return <CloudSun className="text-gray-500" size={28} />;
    if (weather.includes('风')) return <Wind className="text-night-teal-500" size={28} />;
    if (parseInt(weather) >= 32) return <Thermometer className="text-red-500" size={28} />;
    return <Sun className="text-warm-orange-500" size={28} />;
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-night-teal-800 via-night-teal-700 to-night-teal-900 text-white">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: 2 + Math.random() * 3 + 's',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-night-teal-200 text-sm mb-2">社区露天电影 · 实时数据</p>
            <h1 className="font-display text-4xl md:text-5xl mb-3">星空下的观影时光</h1>
            <p className="text-night-teal-200">让每一个社区夜晚都充满温暖与欢笑</p>
          </div>
          <div className="shrink-0">
            <SessionSelector />
          </div>
        </div>
      </div>

      {dashboard ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              icon={<Users size={24} />}
              iconBg="bg-night-teal-100 text-night-teal-700"
              label="已报名人数"
              value={dashboard.totalRegistered}
              suffix="人"
              stagger="stagger-1"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              iconBg="bg-forest/15 text-forest"
              label="已签到入场"
              value={dashboard.checkedIn}
              suffix="人"
              stagger="stagger-2"
            />
            <StatCard
              icon={<Clock size={24} />}
              iconBg="bg-warm-orange-100 text-warm-orange-600"
              label="未签到"
              value={dashboard.notCheckedIn}
              suffix="人"
              stagger="stagger-3"
              warning={dashboard.notCheckedIn > 10}
            />
            <div className="card p-6 opacity-0 animate-fade-in-up stagger-4 flex items-center gap-5">
              <ProgressRing
                value={dashboard.checkedIn}
                max={dashboard.totalRegistered}
                label={`${checkinRate}%`}
                sublabel="签到率"
                size={110}
                strokeWidth={9}
              />
              <div>
                <p className="text-sm text-night-teal-500 mb-1">现场签到进度</p>
                <p className="font-display text-2xl text-night-teal-800">
                  {dashboard.checkedIn}/{dashboard.totalRegistered}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-6 opacity-0 animate-fade-in-up stagger-1 lg:col-span-2">
              <h2 className="section-title mb-5 flex items-center gap-2">
                <Heart className="text-warm-orange-500" size={22} />
                特殊座位需求
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <DemandCard
                  icon={<Heart size={26} />}
                  iconBg="bg-warm-orange-100 text-warm-orange-600"
                  label="老人陪同"
                  value={dashboard.elderlyDemands}
                  desc="安排A区前排"
                />
                <DemandCard
                  icon={<Baby size={26} />}
                  iconBg="bg-night-teal-100 text-night-teal-700"
                  label="儿童需求"
                  value={dashboard.childDemands}
                  desc="配备儿童椅"
                />
                <DemandCard
                  icon={<Accessibility size={26} />}
                  iconBg="bg-forest/15 text-forest"
                  label="无障碍位"
                  value={dashboard.wheelchairDemands}
                  desc="轮椅专用区"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-night-teal-50">
                <h3 className="font-display text-xl text-night-teal-800 mb-4 flex items-center gap-2">
                  <Armchair size={20} className="text-night-teal-600" />
                  区域分配概览
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <AreaBadge area="A" label="A区 · 老人亲子区" desc="前排靠近屏幕" color="from-warm-orange-400 to-warm-orange-500" />
                  <AreaBadge area="B" label="B区 · 普通观众区" desc="中部观影区" color="from-night-teal-500 to-night-teal-700" />
                  <AreaBadge area="C" label="C区 · 野餐垫区" desc="后方草坪区" color="from-forest to-forest/70" />
                  <AreaBadge area="♿" label="无障碍专区" desc="入口侧预留位" color="from-night-teal-400 to-night-teal-600" />
                </div>
              </div>
            </div>

            <div className="card p-6 opacity-0 animate-fade-in-up stagger-2">
              <h2 className="section-title mb-5 flex items-center gap-2">
                {getWeatherIcon(dashboard.weather)}
                天气与备选方案
              </h2>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-night-teal-50 to-cream mb-5">
                <p className="text-3xl font-display text-night-teal-800 mb-1">{dashboard.weather}</p>
                <p className="text-sm text-night-teal-500">当日天气预报</p>
              </div>
              <div className={`rounded-2xl p-5 border-2 ${
                dashboard.weatherBackup.includes('雨') || dashboard.weatherBackup.includes('高温')
                  ? 'bg-warm-orange-50 border-warm-orange-200'
                  : 'bg-forest/5 border-forest/20'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    dashboard.weatherBackup.includes('雨') || dashboard.weatherBackup.includes('高温')
                      ? 'bg-warm-orange-500 text-white'
                      : 'bg-forest text-white'
                  }`}>
                    {(dashboard.weatherBackup.includes('雨') && <Umbrella size={18} />) ||
                     (dashboard.weatherBackup.includes('高温') && <Thermometer size={18} />) ||
                     <CloudSun size={18} />}
                  </div>
                  <div>
                    <p className="font-medium text-night-teal-800 mb-1">
                      {dashboard.weatherBackup.includes('雨') || dashboard.weatherBackup.includes('高温')
                        ? '⚠️ 建议启动备选方案'
                        : '✓ 天气适宜，正常放映'}
                    </p>
                    <p className="text-sm text-night-teal-600 leading-relaxed">{dashboard.weatherBackup}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 opacity-0 animate-fade-in-up stagger-3">
            <h2 className="section-title mb-5 flex items-center gap-2">
              <AlertTriangle size={22} className="text-warm-orange-500" />
              库存缺口预警
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboard.inventoryGaps.map((item) => {
                const hasGap = item.gap > 0;
                const percent = item.available > 0 ? Math.min(100, Math.round((item.needed / item.available) * 100)) : 100;
                return (
                  <div
                    key={item.type}
                    className={`rounded-2xl p-5 border-2 transition-all ${
                      hasGap
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-cream/50 border-night-teal-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-night-teal-800">{item.name}</p>
                      {hasGap && (
                        <span className="badge bg-red-500 text-white">缺口 {item.gap}</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-display text-3xl text-night-teal-800">{item.needed}</span>
                      <span className="text-sm text-night-teal-500">/ {item.available} 可用</span>
                    </div>
                    <div className="h-2 rounded-full bg-night-teal-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          hasGap ? 'bg-red-500' : percent > 80 ? 'bg-warm-orange-500' : 'bg-forest'
                        }`}
                        style={{ width: percent + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-night-teal-500">请选择场次查看实时数据</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  suffix,
  stagger,
  warning,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  suffix?: string;
  stagger: string;
  warning?: boolean;
}) {
  return (
    <div className={`card p-6 opacity-0 animate-fade-in-up ${stagger}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${iconBg}`}>{icon}</div>
        {warning && (
          <span className="badge bg-warm-orange-500 text-white flex items-center gap-1">
            <AlertTriangle size={12} /> 注意
          </span>
        )}
      </div>
      <p className="text-sm text-night-teal-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <AnimatedNumber value={value} className="stat-number" />
        {suffix && <span className="text-night-teal-500">{suffix}</span>}
      </div>
    </div>
  );
}

function DemandCard({
  icon,
  iconBg,
  label,
  value,
  desc,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  desc: string;
}) {
  return (
    <div className="rounded-2xl p-5 bg-cream/70 border border-night-teal-50 text-center">
      <div className={`inline-flex p-3 rounded-2xl mb-3 ${iconBg}`}>{icon}</div>
      <p className="text-sm text-night-teal-500 mb-1">{label}</p>
      <p className="font-display text-3xl text-night-teal-800 mb-1">{value}</p>
      <p className="text-xs text-night-teal-400">{desc}</p>
    </div>
  );
}

function AreaBadge({ area, label, desc, color }: { area: string; label: string; desc: string; color: string }) {
  return (
    <div className="rounded-xl p-4 border border-night-teal-50 bg-white">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white font-display text-lg mb-2`}>
        {area}
      </div>
      <p className="text-sm font-medium text-night-teal-800">{label}</p>
      <p className="text-xs text-night-teal-400">{desc}</p>
    </div>
  );
}
