import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, PlusCircle, Heart } from "lucide-react";

const navItems = [
  { path: "/", label: "总览", icon: LayoutDashboard },
  { path: "/reports", label: "体检报告", icon: FileText },
  { path: "/reports/new", label: "新增报告", icon: PlusCircle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-800">健康管家</h1>
              <p className="text-xs text-gray-500">复查提醒助手</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-200"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="p-4 bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">💡 健康小贴士</p>
            <p className="text-xs text-gray-500">定期复查，关注身体的每一个信号</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
