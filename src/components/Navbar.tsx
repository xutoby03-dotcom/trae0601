import { Link, useLocation } from "react-router-dom";
import { Cat, Home, BarChart3, Plus } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/80 border-b border-ink-100/60">
      <div className="container py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center shadow-warm group-hover:scale-105 transition-transform">
            <Cat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-ink-800 leading-tight">
              驱虫管家
            </h1>
            <p className="text-xs text-ink-400">宠物健康守护</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive("/")
                ? "bg-warm-500 text-white shadow-warm"
                : "text-ink-500 hover:text-ink-700 hover:bg-white"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">首页</span>
          </Link>
          <Link
            to="/statistics"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive("/statistics")
                ? "bg-mint-500 text-white shadow-soft"
                : "text-ink-500 hover:text-ink-700 hover:bg-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">统计</span>
          </Link>
          <Link
            to="/pet/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-ink-800 text-white hover:bg-ink-700 transition-all ml-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">添加宠物</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
