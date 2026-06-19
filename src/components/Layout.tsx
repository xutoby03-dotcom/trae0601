import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const titles: Record<string, { title: string; desc: string }> = {
  "/": { title: "数据看板", desc: "一眼掌握拼场全局状态" },
  "/players": { title: "玩家档案", desc: "管理队友信息与偏好" },
  "/sessions": { title: "场次管理", desc: "组织与追踪所有密室场次" },
};

export default function Layout() {
  const location = useLocation();
  const current = titles[location.pathname] ?? { title: "密室拼场", desc: "" };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-60 pb-24 lg:pb-0">
        <div className="px-6 lg:px-10 pt-6 pb-4 sticky top-0 z-40 bg-ink-950/70 backdrop-blur-md border-b border-ink-800/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
                {current.title}
              </h1>
              <p className="text-sm text-ink-400 mt-1">{current.desc}</p>
            </div>
          </div>
        </div>
        <div className="px-6 lg:px-10 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
