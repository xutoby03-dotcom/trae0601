import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Backpack,
  CalendarDays,
  Sun,
  Wrench,
  Menu,
  X,
  TreePine,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store";
import { getCategory } from "@/data/constants";

const NAV_ITEMS = [
  { to: "/", label: "首页仪表板", icon: LayoutDashboard },
  { to: "/equipment", label: "装备档案", icon: Backpack },
  { to: "/trips", label: "露营活动", icon: CalendarDays },
  { to: "/drying", label: "晾晒管理", icon: Sun },
  { to: "/maintenance", label: "维修补购", icon: Wrench },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const dryingCount = useStore((s) => s.getDryingCount());
  const repairCount = useStore((s) => s.getRepairCount());
  const purchaseCount = useStore((s) => s.getPurchaseCount());
  const equipment = useStore((s) => s.equipment);

  const statsBadge = (to: string) => {
    if (to === "/drying" && dryingCount > 0) return dryingCount;
    if (to === "/maintenance" && (repairCount + purchaseCount) > 0)
      return repairCount + purchaseCount;
    return null;
  };

  return (
    <div className="min-h-screen bg-cream relative">
      <div className="fixed inset-0 bg-noise pointer-events-none" />

      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-forest-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TreePine className="w-6 h-6 text-forest-700" />
          <span className="font-serif font-bold text-lg text-forest-800">露营管家</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-forest-50 text-forest-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex">
        <aside
          className={`${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky lg:top-0 left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur border-r border-forest-100 z-30 transition-transform duration-300 flex flex-col`}
        >
          <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-forest-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-soft">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-forest-800 leading-tight">
                露营管家
              </h1>
              <p className="text-xs text-forest-500">装备全生命周期管理</p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badge = statsBadge(item.to);
              const isActive =
                (item.to === "/" && location.pathname === "/") ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`sidebar-link ${isActive ? "sidebar-link-active" : ""} relative`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span
                      className={`badge ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-forest-100">
            <div className="rounded-xl bg-gradient-to-br from-forest-50 to-earth-50 p-4 border border-forest-100">
              <div className="text-xs text-forest-600 mb-1">装备总数</div>
              <div className="font-serif font-bold text-2xl text-forest-800">
                {equipment.length}
                <span className="text-sm font-normal text-forest-500 ml-1">件</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["tent", "tarp", "sleepingbag", "stove", "furniture", "lighting"].map(
                  (c) => {
                    const cat = getCategory(c);
                    const count = equipment.filter((e) => e.category === c).length;
                    return (
                      <span
                        key={c}
                        className={`badge ${cat.bgColor} ${cat.color}`}
                        title={`${cat.name} ${count}件`}
                      >
                        {cat.emoji} {count}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="container max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
