import { Bell, Search, User } from "lucide-react";
import { useStore } from "@/store";
import { ALERT_TYPE_LABEL } from "@/types";
import { SeverityTag } from "../StatusTag";
import { formatDateTime } from "@/utils/date";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const allAlerts = useStore((s) => s.alerts);
  const alerts = useMemo(() => allAlerts.filter((a) => !a.resolved), [allAlerts]);
  const resolveAlert = useStore((s) => s.resolveAlert);
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索笼盒编号、负责人..."
            className="w-72 pl-9 pr-4 py-2 rounded-lg bg-slate-100/80 border-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in-up">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  告警通知
                </h3>
                <span className="text-xs text-slate-500">
                  未处理 {alerts.length} 条
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无告警
                  </div>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3"
                    >
                      <SeverityTag severity={a.severity} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 mb-0.5">
                          {ALERT_TYPE_LABEL[a.type]}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {a.message}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDateTime(a.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => resolveAlert(a.id)}
                        className="shrink-0 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        标记已读
                      </button>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/tasks"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-xs font-medium text-primary-600 hover:bg-primary-50 border-t border-slate-100"
              >
                查看全部任务
              </Link>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-slate-900">管理员</p>
            <p className="text-xs text-slate-500">饲养管理</p>
          </div>
        </div>
      </div>
    </header>
  );
}
