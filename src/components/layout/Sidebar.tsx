import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flower2,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Leaf,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/store";

const NAV_ITEMS = [
  { path: "/", label: "仪表盘", icon: LayoutDashboard },
  { path: "/plants", label: "绿植档案", icon: Flower2 },
  { path: "/service", label: "养护记录", icon: ClipboardCheck },
  { path: "/issues", label: "问题追踪", icon: AlertTriangle },
  { path: "/stats", label: "统计报表", icon: BarChart3 },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const unreadCount = useStore((s) => s.unreadReminderCount());
  const resetData = useStore((s) => s.resetData);

  const handleReset = () => {
    if (confirm("确定要重置所有示例数据吗？您的修改将会丢失。")) {
      resetData();
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-forest-100 shadow-sm flex flex-col z-50">
      <div
        className="h-20 flex items-center gap-3 px-6 cursor-pointer hover:bg-forest-50 transition-colors"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold text-forest-800 leading-tight">
            绿植管家
          </h1>
          <p className="text-xs text-forest-500">Plant Care System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
          >
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-forest-700 to-forest-800 text-white shadow-md shadow-forest-200"
                    : "text-forest-700 hover:bg-forest-50 hover:text-forest-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {path === "/issues" && unreadCount > 0 && (
                  <span
                    className={`ml-auto w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                      isActive
                        ? "bg-white text-forest-700"
                        : "bg-amber-warning text-white"
                    }`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-forest-100 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-100">
          <img
            src="https://api.dicebear.com/7.x/initials/svg?seed=AD"
            alt="avatar"
            className="w-10 h-10 rounded-full bg-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-forest-800 truncate">
              行政管理员
            </p>
            <p className="text-xs text-forest-500">系统管理</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-2 px-3 rounded-xl text-xs text-forest-500 hover:bg-forest-50 hover:text-forest-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重置示例数据
        </button>
      </div>
    </aside>
  );
}
