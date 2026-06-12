import { Bell, User, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';

export default function Header() {
  const location = useLocation();
  const requests = useStore((s) => s.requests);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const getQuickAction = () => {
    if (location.pathname.startsWith('/items')) {
      return { to: '/items/new', label: '新增物品', icon: Plus };
    }
    if (location.pathname.startsWith('/requests')) {
      return { to: '/requests/new', label: '新建申请', icon: Plus };
    }
    return { to: '/requests/new', label: '快速补货', icon: Plus };
  };

  const action = getQuickAction();
  const ActionIcon = action.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
      <div>
        <h2 className="font-display text-xl text-slate-900">
          {getPageTitle(location.pathname)}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <Link to={action.to} className="btn-primary">
          <ActionIcon className="w-4 h-4" />
          {action.label}
        </Link>
        <button className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger-500 text-white text-xs font-medium flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
}

function getPageTitle(path: string): string {
  if (path === '/') return '补给看板';
  if (path.startsWith('/items/new')) return '新增物品';
  if (path.startsWith('/items/')) return '物品详情';
  if (path.startsWith('/items')) return '物品档案';
  if (path.startsWith('/requests/new')) return '新建补货申请';
  if (path.startsWith('/requests')) return '补货申请';
  if (path.startsWith('/purchases')) return '采购处理';
  if (path.startsWith('/stats')) return '统计分析';
  return '补给看板';
}
