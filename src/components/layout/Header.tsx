import { Music, LayoutDashboard, Users, Shirt, QrCode, ClipboardList } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const mobileTabs = [
  { to: "/", label: "看板", icon: LayoutDashboard },
  { to: "/students", label: "学生", icon: Users },
  { to: "/inventory", label: "库存", icon: Shirt },
  { to: "/distribute", label: "发放", icon: QrCode },
  { to: "/records", label: "记录", icon: ClipboardList },
];

const pageTitles: Record<string, string> = {
  "/": "仪表板",
  "/students": "学生档案管理",
  "/students/new": "新增学生",
  "/inventory": "服装库存管理",
  "/distribute": "服装发放中心",
  "/records": "流程记录中心",
};

export default function Header() {
  const location = useLocation();
  const getTitle = () => {
    if (location.pathname.startsWith("/students/") && location.pathname !== "/students/new") {
      return "编辑学生";
    }
    return pageTitles[location.pathname] || "合唱服装管理";
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-md shadow-primary-600/30">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-slate-900">{getTitle()}</h1>
          </div>
        </div>
      </header>

      <header className="hidden lg:flex sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center justify-between w-full px-8 py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">{getTitle()}</h1>
            <p className="text-sm text-slate-500 mt-0.5">校园合唱比赛服装管理</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-semibold shadow-md shadow-accent-500/30">
              李
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">李老师</p>
              <p className="text-xs text-slate-500">管理员</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 safe-area-pb">
        <div className="flex justify-around py-2">
          {mobileTabs.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "text-primary-600" : "text-slate-400"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
