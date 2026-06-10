import { useAppStore } from '@/store';
import { BUILDINGS } from '@/shared/constants';
import {
  Rss,
  Bell,
  Check,
  Plus,
  Minus,
  Building2,
  Users,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Subscribe() {
  const nav = useNavigate();
  const { subscriptions, setSubscriptionOptions, toggleBuildingSubscribe, tickets } = useAppStore();
  const { buildings, notifyOnRecovered, notifyOnStatusChange } = subscriptions;

  const stats = useMemo(() => {
    const relevant = tickets.filter((t) => buildings.includes(t.elevator.building));
    const active = relevant.filter((t) => t.status !== 'recovered' && t.status !== 'repeated').length;
    const recent7d = relevant.filter((t) => t.occurredAt > Date.now() - 7 * 24 * 3600 * 1000).length;
    return { active, recent7d, total: relevant.length };
  }, [buildings, tickets]);

  return (
    <div className="container max-w-4xl py-6 pb-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Rss size={24} className="text-brand-500" />
          楼栋订阅管理
        </h1>
        <p className="text-sm text-slate-500 mt-1">订阅关注楼栋后，故障状态变更时将第一时间收到通知</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="card p-5 bg-gradient-to-br from-brand-50 to-white">
          <div className="text-xs text-slate-500 mb-1">已订阅楼栋</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-brand-600 tabular-nums">{buildings.length}</span>
            <span className="text-sm text-slate-400">/ {BUILDINGS.length}</span>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-orange-50 to-white">
          <div className="text-xs text-slate-500 mb-1">当前未恢复</div>
          <div className="text-3xl font-black text-orange-600 tabular-nums">{stats.active}</div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-white">
          <div className="text-xs text-slate-500 mb-1">近 7 天相关工单</div>
          <div className="text-3xl font-black text-emerald-600 tabular-nums">{stats.recent7d}</div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <h2 className="section-title mb-4">
          <div className="w-1 h-5 rounded-full bg-brand-500" />
          <Bell size={16} />
          通知偏好
        </h2>

        <div className="space-y-3">
          <ToggleRow
            icon={<CheckCircle2 size={18} />}
            title="恢复完成时通知"
            desc="订阅楼栋的电梯恢复正常运行后立即提醒"
            checked={notifyOnRecovered}
            onChange={(v) => setSubscriptionOptions({ notifyOnRecovered: v })}
          />
          <ToggleRow
            icon={<Bell size={18} />}
            title="任意状态变更通知"
            desc="包括：接单、处理中、等配件、已恢复等全部状态"
            checked={notifyOnStatusChange}
            onChange={(v) => setSubscriptionOptions({ notifyOnStatusChange: v })}
          />
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
          <Info size={14} className="mt-0.5 shrink-0" />
          <div>
            提示：目前使用应用内消息中心提醒。若需微信/短信通知，请联系物业管理员绑定账号。
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="section-title">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            <Building2 size={16} />
            订阅楼栋
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => BUILDINGS.forEach((b) => {
                if (!buildings.includes(b.code)) toggleBuildingSubscribe(b.code);
              })}
              className="text-xs text-brand-600 hover:underline px-2 py-1"
            >
              全部订阅
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => buildings.forEach((b) => toggleBuildingSubscribe(b))}
              className="text-xs text-slate-500 hover:underline px-2 py-1"
            >
              清空
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUILDINGS.map((b) => {
            const subbed = buildings.includes(b.code);
            const buildingTickets = tickets.filter((t) => t.elevator.building === b.code);
            const activeCount = buildingTickets.filter(
              (t) => t.status !== 'recovered' && t.status !== 'repeated',
            ).length;
            const totalCount = buildingTickets.length;

            return (
              <button
                key={b.code}
                onClick={() => toggleBuildingSubscribe(b.code)}
                className={`group relative text-left p-4 rounded-2xl border-2 transition-all overflow-hidden ${subbed
                  ? 'border-brand-500 bg-brand-50/60 shadow-card'
                  : 'border-slate-100 bg-white hover:border-brand-300 hover:bg-brand-50/30'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${subbed
                        ? 'bg-brand-500 text-white shadow-pop'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-500'}`}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-800">{b.name}</div>
                        {subbed && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-brand-500 text-white text-[10px] font-bold">
                            <Check size={10} />
                            已订阅
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        <Users size={11} className="inline mr-1 -mt-0.5" />
                        {b.floors} 层 · 共 {totalCount} 次故障记录
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${subbed
                      ? 'bg-white text-brand-500 border border-brand-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 group-hover:border-brand-300 group-hover:text-brand-500 group-hover:bg-white'}`}
                  >
                    {subbed ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </div>

                {activeCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-slow" />
                      {activeCount} 起当前未恢复
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        nav('/');
                      }}
                      className="text-xs text-brand-600 hover:underline flex items-center gap-0.5"
                    >
                      查看
                      <ChevronRight size={12} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {buildings.length === 0 && (
        <section className="card p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Rss size={28} />
          </div>
          <h3 className="font-bold text-slate-700 mb-1">尚未订阅任何楼栋</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            订阅您居住或经常出入的楼栋，故障发生和恢复时第一时间收到消息通知。
          </p>
          <button
            onClick={() => BUILDINGS.slice(0, 2).forEach((b) => toggleBuildingSubscribe(b.code))}
            className="btn-primary"
          >
            <Plus size={16} />
            一键推荐（订阅前 2 栋）
          </button>
        </section>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${checked
        ? 'border-brand-200 bg-brand-50/50'
        : 'border-slate-100 bg-white hover:border-slate-200'}`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${checked ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-800">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
      <div
        className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${checked ? 'bg-brand-500' : 'bg-slate-300'}`}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </div>
    </button>
  );
}
