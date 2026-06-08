import { NavLink, Outlet } from "react-router-dom";
import { Home, Plus, ShoppingCart, ChefHat, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "首页", icon: Home },
  { to: "/add", label: "入库", icon: Plus },
  { to: "/shopping", label: "购物清单", icon: ShoppingCart },
  { to: "/recipes", label: "做饭建议", icon: ChefHat },
  { to: "/stats", label: "统计", icon: BarChart3 },
];

export default function Layout() {
  return (
    <div
      className="min-h-screen font-['Noto_Sans_SC',sans-serif]"
      style={{
        background: "linear-gradient(135deg, #f0f9ff 0%, #e8f4f8 100%)",
      }}
    >
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center bg-white py-6 shadow-lg md:flex">
        <div className="mb-8 text-2xl">🧊</div>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-xs transition-all duration-200",
                  isActive
                    ? "text-[#4ECDC4]"
                    : "text-gray-400 hover:text-gray-600"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-[#4ECDC4]/15 shadow-sm"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive ? "text-[#4ECDC4]" : "text-gray-400"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "font-medium transition-colors duration-200",
                      isActive ? "text-[#4ECDC4]" : "text-gray-400"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="pb-20 md:pl-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white/90 px-2 py-2 backdrop-blur-lg md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-all duration-200",
                isActive
                  ? "text-[#4ECDC4]"
                  : "text-gray-400 active:text-gray-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                    isActive ? "bg-[#4ECDC4]/15" : ""
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4.5 w-4.5 transition-colors duration-200",
                      isActive ? "text-[#4ECDC4]" : "text-gray-400"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium transition-colors duration-200",
                    isActive ? "text-[#4ECDC4]" : "text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
