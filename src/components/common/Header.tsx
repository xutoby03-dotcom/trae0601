import { Scissors, Plus, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-brown-900 leading-tight">
              萌宠美美容
            </h1>
            <p className="text-xs text-brown-700/60">Pet Grooming Queue</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              location.pathname === "/"
                ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                : "text-brown-700 hover:bg-cream-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            看板
          </Link>
          <Link to="/order/new" className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" />
            新建订单
          </Link>
        </nav>
      </div>
    </header>
  );
}
