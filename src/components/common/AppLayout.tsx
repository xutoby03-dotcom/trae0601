import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Fish,
  Utensils,
  Droplets,
  BarChart3,
  Plus,
  Bell,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { greetByTime } from "@/utils/formatters";
import { buildAlerts } from "@/utils/alertChecker";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import type { Alert } from "@/types";

const navItems = [
  { to: "/", label: "控制面板", icon: LayoutDashboard, end: true },
  { to: "/aquariums", label: "鱼缸档案", icon: Fish },
  { to: "/feeding", label: "喂食记录", icon: Utensils },
  { to: "/water", label: "换水水质", icon: Droplets },
  { to: "/statistics", label: "数据统计", icon: BarChart3 },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const aquariums = useAquariumStore((s) => s.aquariums);
  const ensureTodayPlansForAll = useFeedingStore(
    (s) => s.ensureTodayPlansForAll
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    ensureTodayPlansForAll();
    const tick = () => setAlerts(buildAlerts());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [ensureTodayPlansForAll]);

  const urgentCount = useMemo(
    () => alerts.filter((a) => a.level !== "info").length,
    [alerts]
  );

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const clockStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/40 bg-white/40 backdrop-blur-xl p-5">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-700 to-water-600 flex items-center justify-center shadow-lg shadow-brand-900/20">
            <span className="text-2xl animate-ripple-bg">🐠</span>
            <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full px-1 shadow">
              🫧
            </span>
          </div>
          <div>
            <div className="font-display font-bold text-lg text-brand-900">
              鱼管家
            </div>
            <div className="text-[11px] text-brand-600">科学喂食 · 健康养鱼</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-brand-800/90 to-water-700/90 text-white shadow-lg">
          <div className="text-xs opacity-80 mb-1">今日鱼缸</div>
          <div className="text-2xl font-bold font-display">
            {aquariums.length} <span className="text-sm font-normal opacity-80">个</span>
          </div>
          <button
            onClick={() => navigate("/aquariums/new")}
            className="mt-3 w-full text-xs py-2 rounded-xl bg-white/15 hover:bg-white/25 transition flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> 新增鱼缸
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/40 bg-white/40 backdrop-blur-xl">
          <div>
            <div className="text-xs text-brand-600">
              {greetByTime()} · {dateStr}
            </div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-brand-900">
              您的水族箱管理中心
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-white/60 shadow-sm">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-water-500 flex items-center justify-center text-white font-bold text-sm">
                {clockStr.split(":")[0]}
              </div>
              <div className="leading-tight">
                <div className="text-lg font-bold text-brand-900 tabular-nums">
                  {clockStr}
                </div>
                <div className="text-[10px] text-brand-600">
                  {["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()]}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="relative w-11 h-11 rounded-xl bg-white/70 border border-white/60 flex items-center justify-center text-brand-800 hover:bg-white shadow-sm transition"
              title="提醒通知"
            >
              <Bell className="w-5 h-5" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow animate-pulse-soft">
                  {urgentCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <nav className="lg:hidden sticky top-[77px] z-20 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/40 bg-white/30 backdrop-blur">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `shrink-0 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive
                    ? "bg-brand-800 text-white shadow"
                    : "bg-white/60 text-brand-700"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-5 md:p-8 container max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
