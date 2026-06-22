import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Home, Settings, ArrowLeft, User, Trophy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function AppLayout() {
  const navigate = useNavigate();
  const { userRole, currentStudent } = useAppStore();

  return (
    <div className="min-h-screen bg-equestrian-sand-50">
      <header className="bg-equestrian-brown-700 text-white shadow-elegant">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-equestrian-brown-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-equestrian-gold-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-equestrian-brown-800" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold">马术路线记忆板</h1>
                  <p className="text-xs text-equestrian-brown-200">Equestrian Course Memory</p>
                </div>
              </Link>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-equestrian-brown-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">首页</span>
              </Link>
              {userRole === 'coach' && (
                <Link
                  to="/designer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-equestrian-brown-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">路线设计</span>
                </Link>
              )}
              <Link
                to="/report"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-equestrian-brown-600 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm">训练报告</span>
              </Link>
            </nav>
            <div className="flex items-center gap-2 px-4 py-2 bg-equestrian-brown-600 rounded-lg">
              <User className="w-4 h-4 text-equestrian-gold-400" />
              <span className="text-sm">
                {userRole === 'coach' ? '教练模式' : currentStudent?.name || '学员模式'}
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
