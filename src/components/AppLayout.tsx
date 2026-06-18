import { LayoutDashboard, BookOpen, ArrowLeftRight, Sparkles, Menu, X, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../store';

const navItems = [
  { path: '/', label: '看板', icon: LayoutDashboard, emoji: '🏠' },
  { path: '/books', label: '绘本档案', icon: BookOpen, emoji: '📚' },
  { path: '/borrow', label: '借阅管理', icon: ArrowLeftRight, emoji: '🔄' },
  { path: '/recommend', label: '智能推荐', icon: Sparkles, emoji: '✨' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { families, selectedFamilyId, setSelectedFamily } = useStore();
  const selectedFamily = families.find((f) => f.id === selectedFamilyId);

  return (
    <div className="min-h-screen flex">
      {/* 侧边导航 */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-cream-200 z-40 flex flex-col transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl shadow-soft animate-float">
              📖
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-800">绘本部落</h1>
              <p className="text-xs text-gray-400">儿童绘本轮换借阅</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 家庭选择 */}
        <div className="p-4 border-t border-cream-200">
          <p className="text-xs text-gray-400 font-medium mb-2 px-2">当前家庭</p>
          <div className="relative">
            <select
              value={selectedFamilyId || ''}
              onChange={(e) => setSelectedFamily(e.target.value || null)}
              className="w-full appearance-none px-4 py-3 pr-10 bg-cream-50 border-2 border-cream-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:border-orange-400 transition-all cursor-pointer"
            >
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  👨‍👩‍👧 {f.name}（{f.childAge}岁）
                </option>
              ))}
            </select>
            <UserCircle2 className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {selectedFamily && (
            <p className="text-xs text-gray-400 mt-2 px-2 truncate">{selectedFamily.contact}</p>
          )}
        </div>
      </aside>

      {/* 遮罩层 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-20 bg-cream-100/70 backdrop-blur-xl border-b border-cream-200 px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <button
            className="lg:hidden btn-ghost p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">今天也要快乐阅读哦 🌈</span>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
