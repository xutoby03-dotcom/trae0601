import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, ClipboardList, Home as HomeIcon, CloudSun } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "首页概览", icon: Home, end: true },
    { to: "/records", label: "晾晒记录", icon: ClipboardList },
    { to: "/balcony", label: "阳台档案", icon: HomeIcon },
  ];

  return (
    <div className="min-h-screen relative z-10">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/60 border-b border-white/40 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-sun-400 flex items-center justify-center shadow-md animate-float-slow">
              <CloudSun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-sky-800 leading-none">晾衣小管家</h1>
              <p className="text-xs text-sky-500 mt-1">防雨防风好帮手</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 bg-white/70 backdrop-blur rounded-2xl p-1.5 shadow-sm border border-white/60">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <nav className="md:hidden px-4 pb-3 flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-sky-400 text-white shadow-md"
                    : "text-sky-600 hover:bg-sky-100/60"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-sky-500/70 relative z-10">
        <p>☀️ 晾衣小管家 · 让每件衣服都干爽到家</p>
        <p className="mt-1" style={{ display: location.pathname === "/" ? "block" : "none" }}>
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </footer>
    </div>
  );
}
