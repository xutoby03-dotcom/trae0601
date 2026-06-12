import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import ReminderCard from '@/components/reminder/ReminderCard';
import {
  Users,
  Syringe,
  CalendarClock,
  Award,
  PlusCircle,
  CalendarCheck,
  Bell,
  ArrowRight,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react';
import ChildCard from '@/components/child/ChildCard';
import VaccineFormModal from '@/components/vaccine/VaccineFormModal';
import AppointModal from '@/components/vaccine/AppointModal';
import type { Vaccine } from '@/types';
import { today } from '@/utils/date';

export default function Dashboard() {
  const initialize = useAppStore((s) => s.initialize);
  const children = useAppStore((s) => s.children);
  const vaccines = useAppStore((s) => s.vaccines);
  const updateVaccineStatus = useAppStore((s) => s.updateVaccineStatus);
  const getStatistics = useAppStore((s) => s.getStatistics);
  const addVaccine = useAppStore((s) => s.addVaccine);
  const appointVaccine = useAppStore((s) => s.appointVaccine);
  const getChildById = useAppStore((s) => s.getChildById);
  const getVaccinesByChildId = useAppStore((s) => s.getVaccinesByChildId);

  const navigate = useNavigate();

  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [targetVaccine, setTargetVaccine] = useState<Vaccine | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    updateVaccineStatus();
    const interval = setInterval(updateVaccineStatus, 60000);
    return () => clearInterval(interval);
  }, [updateVaccineStatus]);

  const stats = useMemo(() => getStatistics(), [getStatistics, vaccines, children]);

  const overdueVaccines = vaccines.filter((v) => v.status === 'overdue');
  const upcomingVaccines = stats.upcomingVaccines.filter((v) => v.status !== 'overdue');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return { text: '夜深了', Icon: Moon, color: 'text-indigo-500' };
    if (h < 11) return { text: '早上好', Icon: Sun, color: 'text-amber-500' };
    if (h < 14) return { text: '中午好', Icon: Sun, color: 'text-orange-500' };
    if (h < 18) return { text: '下午好', Icon: CloudSun, color: 'text-sky-500' };
    return { text: '晚上好', Icon: Moon, color: 'text-indigo-500' };
  };
  const { text: greetText, Icon: GreetIcon, color: greetColor } = greeting();

  const monthVaccines = vaccines.filter((v) => {
    const mk = v.suggestedDate.slice(0, 7);
    return mk === today().slice(0, 7) && v.status !== 'completed';
  });
  const completionRate =
    stats.totalVaccines > 0
      ? Math.round((stats.completedVaccines / stats.totalVaccines) * 100)
      : 0;

  const statCards = [
    {
      label: '孩子档案',
      value: stats.totalChildren,
      icon: Users,
      bg: 'from-sky-400 to-sky-500',
      sub: '位宝贝',
    },
    {
      label: '待接种',
      value: stats.pendingVaccines + stats.overdueVaccines,
      icon: Syringe,
      bg: 'from-accent-400 to-accent-500',
      sub: '针疫苗',
    },
    {
      label: '本月待接',
      value: monthVaccines.length,
      icon: CalendarClock,
      bg: 'from-violet-400 to-violet-500',
      sub: '针计划',
    },
    {
      label: '完成率',
      value: `${completionRate}%`,
      icon: Award,
      bg: 'from-primary-400 to-primary-500',
      sub: `已完成 ${stats.completedVaccines} 针`,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-emerald-500 to-teal-400 p-7 text-white shadow-glow">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-8 bottom-0 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute left-1/2 -bottom-20 w-72 h-72 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GreetIcon className={`w-5 h-5 ${greetColor}`} />
              <span className="text-white/90 text-sm">
                {greetText} · {today()}
              </span>
            </div>
            <h1 className="font-display text-3xl mb-2">疫苗接种管家</h1>
            <p className="text-white/80 text-sm max-w-md">
              一目了然掌握疫苗进度，{overdueVaccines.length > 0 ? `有 ${overdueVaccines.length} 针已逾期需要处理` : upcomingVaccines.length > 0 ? `有 ${upcomingVaccines.length} 针即将到期` : '一切顺利，无需担心 🌿'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {children.slice(0, 4).map((c) => (
              <img
                key={c.id}
                src={
                  c.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`
                }
                alt={c.name}
                className="w-12 h-12 rounded-2xl border-2 border-white/50 object-cover bg-white shadow-card hover:scale-105 transition-transform"
              />
            ))}
            {children.length > 4 && (
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-medium border-2 border-white/50">
                +{children.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => (
          <div
            key={s.label}
            className="card p-5 relative overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br ${s.bg} opacity-10 -translate-y-8 translate-x-8`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center text-white shadow-soft`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-800">{s.value}</span>
              <span className="text-xs text-slate-400">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {(overdueVaccines.length > 0 || upcomingVaccines.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent-500" />
                  重要提醒
                </h2>
                <button
                  onClick={() => navigate('/vaccines')}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  查看全部 <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {overdueVaccines.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-danger-600 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse-soft" />
                    已逾期 · {overdueVaccines.length} 针
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {overdueVaccines.map((v) => (
                      <ReminderCard
                        key={v.id}
                        vaccine={v}
                        child={getChildById(v.childId)}
                        variant="overdue"
                        onAppoint={() => {
                          setTargetVaccine(v);
                          setShowAppointModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {upcomingVaccines.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-accent-600 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-500" />
                    7 天内即将到期 · {upcomingVaccines.length} 针
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {upcomingVaccines.slice(0, 4).map((v) => (
                      <ReminderCard
                        key={v.id}
                        vaccine={v}
                        child={getChildById(v.childId)}
                        variant="upcoming"
                        onAppoint={() => {
                          setTargetVaccine(v);
                          setShowAppointModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">快捷操作</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/children/new')}
                className="card card-hover p-5 flex flex-col items-center gap-2 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white shadow-soft group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-700">新增孩子档案</span>
              </button>
              <button
                onClick={() => setShowVaccineModal(true)}
                className="card card-hover p-5 flex flex-col items-center gap-2 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white shadow-soft group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-700">添加疫苗计划</span>
              </button>
              <button
                onClick={() => navigate('/vaccines')}
                className="card card-hover p-5 flex flex-col items-center gap-2 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center text-white shadow-soft group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span className="font-medium text-slate-700">登记预约</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title !mb-0">孩子档案</h2>
              <button
                onClick={() => navigate('/children')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                全部 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {children.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无孩子档案</p>
              </div>
            ) : (
              <div className="space-y-3">
                {children.slice(0, 3).map((c) => {
                  const cvs = getVaccinesByChildId(c.id);
                  return (
                    <ChildCard
                      key={c.id}
                      child={c}
                      vaccineCount={cvs.length}
                      completedCount={cvs.filter((v) => v.status === 'completed').length}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {stats.delayedVaccines.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title !mb-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger-500" />
                  延期记录
                </h2>
                <button
                  onClick={() => navigate('/statistics')}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  统计 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {stats.delayedVaccines.slice(0, 5).map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-danger-50/40 border border-danger-100 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700">
                        {v.name} 第{v.dose}剂
                      </span>
                      <span className="text-xs text-danger-600">延期 {v.delayedCount} 次</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {getChildById(v.childId)?.name} · {v.delayedReason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <VaccineFormModal
        open={showVaccineModal}
        onClose={() => setShowVaccineModal(false)}
        onSubmit={(data) => addVaccine(data)}
        children={children.map((c) => ({ id: c.id, name: c.name }))}
      />

      <AppointModal
        open={showAppointModal}
        onClose={() => {
          setShowAppointModal(false);
          setTargetVaccine(null);
        }}
        onSubmit={(data) => {
          if (targetVaccine) appointVaccine(targetVaccine.id, data);
        }}
        vaccine={targetVaccine}
        defaultLocation={
          targetVaccine ? getChildById(targetVaccine.childId)?.vaccinationSite : ''
        }
      />
    </div>
  );
}
