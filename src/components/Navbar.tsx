import { Link, useLocation } from 'react-router-dom';
import { Home, Brain, History, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-l-0 border-r-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-neon-pink" />
            <span className="font-display font-bold text-xl gradient-text">
              MBTI
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`p-3 rounded-full transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-neon-pink/20 text-neon-pink'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/history"
              className={`p-3 rounded-full transition-all duration-300 ${
                location.pathname === '/history'
                  ? 'bg-neon-pink/20 text-neon-pink'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-5 h-5" />
            </Link>
            {!isHome && (
              <button
                onClick={() => window.history.back()}
                className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
