import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

const breadcrumbMap: Record<string, string[]> = {
  "/": ["数据看板"],
  "/areas": ["区域管理"],
  "/vehicles": ["车辆管理"],
  "/patrols": ["巡查记录"],
  "/disposals": ["处理清单"],
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const paths = breadcrumbMap[location.pathname] || ["首页"];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {paths.map((p, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">/</span>}
                <span className={i === paths.length - 1 ? "text-slate-800 font-medium" : ""}>
                  {p}
                </span>
              </span>
            ))}
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
