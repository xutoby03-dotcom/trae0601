import { Camera, Home, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink-950/70 border-b border-ink-700/50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-copper-400 hover:bg-ink-800/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-copper-500 to-copper-600 flex items-center justify-center shadow-glow">
                <Camera className="w-5 h-5 text-ink-950" strokeWidth={2.2} />
              </div>
              <div className="absolute inset-0 rounded-lg bg-copper-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-white leading-tight">
                LensCheck
              </h1>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5 tracking-wider uppercase">
                二手镜头检测工具
              </p>
            </div>
          </Link>
        </div>

        {!isHome && (
          <Link to="/" className="text-sm text-gray-400 hover:text-copper-400 transition-colors flex items-center gap-1.5">
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        )}
      </div>
    </header>
  );
}
