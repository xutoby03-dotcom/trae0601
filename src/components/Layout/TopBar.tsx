import { useLocation } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Bell,
  Search,
  X,
} from "lucide-react";
import { useEmployeeStore } from "@/store/employee";
import { useExceptionStore } from "@/store/exception";
import { cn } from "@/lib/utils";
import { exceptionTypeLabel } from "@/utils/formatters";

const PATH_TITLES: Record<string, { title: string; crumbs: string[] }> = {
  "/orders": { title: "团购订单", crumbs: ["首页", "团购订单"] },
  "/packing": { title: "到货分装", crumbs: ["首页", "到货分装"] },
  "/pickup": { title: "取餐确认", crumbs: ["首页", "取餐确认"] },
  "/employees": { title: "员工档案", crumbs: ["首页", "员工档案"] },
  "/stats": { title: "数据统计", crumbs: ["首页", "数据统计"] },
};

export default function TopBar() {
  const location = useLocation();
  const pageInfo = useMemo(() => {
    const key = Object.keys(PATH_TITLES).find((k) =>
      location.pathname.startsWith(k)
    );
    return PATH_TITLES[key ?? "/orders"];
  }, [location.pathname]);

  const employees = useEmployeeStore((s) => s.employees);
  const exceptions = useExceptionStore((s) => s.exceptions);
  const currentUser = useMemo(
    () => employees.find((e) => e.role === "admin") ?? employees[0],
    [employees]
  );
  const pendingExceptions = useMemo(
    () => exceptions.filter((e) => e.status === "pending").length,
    [exceptions]
  );
  const notifications = useMemo(
    () => exceptions.filter((e) => e.status === "pending").slice(0, 5),
    [exceptions]
  );
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setShowBell(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${
      weekdays[d.getDay()]
    }`;
  }, []);

  const markRead = (id: string) => {
    useExceptionStore.getState().updateException(id, { status: "processing" });
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-8 flex items-center gap-6 shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        {pageInfo.crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />}
            <span
              className={cn(
                i === pageInfo.crumbs.length - 1
                  ? "text-neutral-800 font-semibold"
                  : "text-neutral-400"
              )}
            >
              {c}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div className="text-sm text-neutral-500 hidden md:flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
        {todayStr}
      </div>

      <div className="relative" ref={bellRef}>
        <button
          onClick={() => setShowBell((v) => !v)}
          className="relative w-10 h-10 rounded-xl bg-neutral-50 hover:bg-brand-50 flex items-center justify-center transition-all"
        >
          <Bell className="w-5 h-5 text-neutral-600" />
          {pendingExceptions > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
              {pendingExceptions > 9 ? "9+" : pendingExceptions}
            </span>
          )}
        </button>
        {showBell && (
          <div className="absolute right-0 top-12 w-80 rounded-card bg-white shadow-card-hover border border-neutral-100 overflow-hidden z-30 animate-fade-in-up">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="font-semibold text-neutral-800 text-sm">
                异常通知
              </span>
              <span className="text-xs text-danger-500 font-medium">
                {pendingExceptions} 条待处理
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto scroll-thin">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  暂无异常通知 ✨
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-danger-50 text-danger-500 flex items-center justify-center shrink-0 text-xs font-bold">
                      !
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 font-medium">
                        {exceptionTypeLabel(n.type)}异常
                      </p>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {n.description}
                      </p>
                      <button
                        onClick={() => markRead(n.id)}
                        className="mt-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
                      >
                        标记处理中 →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {currentUser && (
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-100">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-neutral-800 leading-tight">
              {currentUser.name}
            </p>
            <p className="text-xs text-neutral-400 leading-tight mt-0.5">
              {currentUser.department}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
