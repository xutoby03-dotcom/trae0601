import { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Library,
  Music,
  Wrench,
  LayoutGrid,
  BarChart3,
  ChevronDown,
  Menu,
  X,
  UserRound,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "仪表盘", icon: Library },
  { to: "/instruments", label: "乐器档案", icon: Music },
  { to: "/repairs", label: "报修单", icon: Wrench },
  { to: "/workbench", label: "维修工作台", icon: LayoutGrid },
  { to: "/analytics", label: "统计分析", icon: BarChart3 },
];

const roleLabels: Record<string, string> = {
  teacher: "教师",
  repair_staff: "维修员",
  admin: "管理员",
};

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const setCurrentUser = useUserStore((s) => s.setCurrentUser);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        type="button"
        className="fixed top-4 left-4 z-50 md:hidden btn-secondary !p-2.5"
        onClick={() => setMobileOpen(true)}
        aria-label="打开菜单"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-walnut-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-walnut-800 text-white flex flex-col z-50",
          "transition-transform duration-300 ease-out",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-walnut-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-walnut-500 to-walnut-700 flex items-center justify-center shadow-md">
              <Music className="w-5 h-5 text-walnut-100" />
            </div>
            <div>
              <h1 className="font-serif text-base font-semibold tracking-wide">
                乐器维修中心
              </h1>
              <p className="text-[10px] text-walnut-300 leading-none mt-0.5">
                Instrument Repair
              </p>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg hover:bg-walnut-700/60 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="关闭菜单"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-walnut-700/60" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "hover:bg-walnut-700/40 transition-all duration-200",
                userDropdownOpen && "bg-walnut-700/50"
              )}
              onClick={() => setUserDropdownOpen((v) => !v)}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-walnut-600"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-walnut-600 flex items-center justify-center ring-2 ring-walnut-500">
                  <UserRound className="w-4 h-4 text-walnut-100" />
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.name ?? "未登录"}
                </p>
                <p className="text-[11px] text-walnut-300 truncate">
                  {currentUser ? roleLabels[currentUser.role] : ""}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-walnut-300 shrink-0 transition-transform duration-200",
                  userDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-2 rounded-xl bg-walnut-700 border border-walnut-600/60 shadow-xl overflow-hidden animate-fade-in-up">
                <div className="px-3 py-2 text-[10px] font-medium text-walnut-300 tracking-wider uppercase border-b border-walnut-600/40">
                  切换用户
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left",
                        "hover:bg-walnut-600/50 transition-colors",
                        user.id === currentUserId && "bg-walnut-600/70"
                      )}
                      onClick={() => {
                        setCurrentUser(user.id);
                        setUserDropdownOpen(false);
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-walnut-500 flex items-center justify-center">
                          <UserRound className="w-3.5 h-3.5 text-walnut-100" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-walnut-300 truncate">
                          {roleLabels[user.role]} · {user.phone}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export { Sidebar };
