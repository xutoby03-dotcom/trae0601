import { NavLink, Link } from "react-router-dom";
import { BookOpen, LayoutGrid, Library, BarChart3 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-teal-500 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl text-white tracking-wide">图书漂流箱</h1>
              <p className="text-xs text-white/80 -mt-0.5">让每本书都找到下一位读者</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-2xl p-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-amber-600 shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`
              }
            >
              <LayoutGrid className="w-4 h-4" />
              <span>看板</span>
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-amber-600 shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`
              }
            >
              <Library className="w-4 h-4" />
              <span>图书管理</span>
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-amber-600 shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span>统计中心</span>
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
              管
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="bg-white/60 border-t border-amber-100 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          📚 图书漂流箱管理系统 · 让阅读漂流起来
        </div>
      </footer>
    </div>
  );
}
