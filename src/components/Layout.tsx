import { NavLink, Outlet, useLocation } from "react-router-dom";
import { navItems, BrandIcon } from "@/constants/nav";
import { Bell } from "lucide-react";
import { useAppStore } from "@/store/app";
import { useEffect } from "react";
import { destructionApi, incidentsApi } from "@/services/api";

export default function Layout() {
  const location = useLocation();
  const { setPendingDestruction, setActiveIncidents } = useAppStore();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [pending, incidents] = await Promise.all([
          destructionApi.getPending(),
          incidentsApi.list({ status: "pending" }),
        ]);
        const investigating = await incidentsApi.list({ status: "investigating" });
        setPendingDestruction(pending.length);
        setActiveIncidents(incidents.length + investigating.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBadges();
  }, [location.pathname, setPendingDestruction, setActiveIncidents]);

  const pendingDestruction = useAppStore((s) => s.pendingDestruction);
  const activeIncidents = useAppStore((s) => s.activeIncidents);

  return (
    <div className="flex min-h-screen bg-warm-50">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <BrandIcon size={22} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-gray-800">
                卤味留样
              </h1>
              <p className="text-xs text-gray-500">安全管理系统</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              <item.icon size={20} />
              <span className="flex-1">{item.label}</span>
              {item.path === "/destruction" && pendingDestruction > 0 && (
                <span className="bg-danger-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingDestruction}
                </span>
              )}
              {item.path === "/incidents" && activeIncidents > 0 && (
                <span className="bg-warning-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeIncidents}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warm-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
              管
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                系统管理员
              </p>
              <p className="text-xs text-gray-500 truncate">熟食小店总店</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-serif text-xl font-semibold text-gray-800">
            {navItems.find((n) => n.path === location.pathname)?.label ||
              "数据看板"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={20} className="text-gray-600" />
              {(pendingDestruction + activeIncidents) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              )}
            </button>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
