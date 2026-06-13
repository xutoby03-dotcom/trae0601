import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/": "仪表盘",
  "/instruments": "乐器档案",
  "/repairs": "报修单",
  "/workbench": "维修工作台",
  "/analytics": "统计分析",
};

export default function Header() {
  const location = useLocation();
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );

  const segments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { label: routeTitles["/"] ?? "首页", to: "/" },
    ...segments.map((_, idx) => {
      const path = "/" + segments.slice(0, idx + 1).join("/");
      return {
        label: routeTitles[path] ?? segments[idx],
        to: path,
      };
    }),
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-walnut-100/80">
      <div className="h-full px-5 md:px-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0 pl-12 md:pl-0">
          <nav className="flex items-center gap-1.5 text-sm truncate">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.to} className="flex items-center gap-1.5">
                  <Link
                    to={crumb.to}
                    className={cn(
                      "truncate max-w-[160px]",
                      isLast
                        ? "text-walnut-800 font-semibold"
                        : "text-walnut-500 hover:text-walnut-700 transition-colors"
                    )}
                  >
                    {crumb.label}
                  </Link>
                  {!isLast && (
                    <ChevronRight className="w-3.5 h-3.5 text-walnut-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/repairs/new"
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新建报修</span>
          </Link>

          <button
            type="button"
            className="btn-ghost !p-2.5"
            aria-label="用户菜单"
            title={`当前用户: ${currentUser?.name ?? "未登录"}`}
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
