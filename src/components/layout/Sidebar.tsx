import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileImage,
  FileText,
  ClipboardCheck,
  ListChecks,
  MapPin,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePostingStore } from '../../store/usePostingStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { usePosterStore } from '../../store/usePosterStore';

const navItems = [
  {
    path: '/dashboard',
    label: '系统看板',
    icon: LayoutDashboard,
  },
  {
    path: '/posters',
    label: '海报档案',
    icon: FileImage,
  },
  {
    path: '/applications',
    label: '张贴申请',
    icon: FileText,
  },
  {
    path: '/audit',
    label: '审核管理',
    icon: ClipboardCheck,
  },
  {
    path: '/posting-list',
    label: '张贴清单',
    icon: ListChecks,
  },
  {
    path: '/execution',
    label: '张贴执行',
    icon: MapPin,
  },
  {
    path: '/exceptions',
    label: '异常管理',
    icon: AlertTriangle,
  },
  {
    path: '/reminders',
    label: '到期提醒',
    icon: Bell,
  },
];

export default function Sidebar() {
  const applications = useApplicationStore((state) => state.applications);
  const postingItems = usePostingStore((state) => state.postingItems);
  const exceptions = useExceptionStore((state) => state.exceptions);
  const posters = usePosterStore((state) => state.posters);

  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const pendingPosting = postingItems.filter(p => p.status === 'pending').length;
  const pendingExceptions = exceptions.filter(e => e.status !== 'resolved').length;
  
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  const expiringSoon = posters.filter((p) => {
    if (p.status !== 'posted' && p.status !== 'posting') return false;
    const endDate = new Date(p.endDate);
    return endDate >= today && endDate <= threeDaysLater;
  }).length;

  const getBadgeCount = (path: string) => {
    switch (path) {
      case '/audit':
        return pendingApplications;
      case '/execution':
        return pendingPosting;
      case '/exceptions':
        return pendingExceptions;
      case '/reminders':
        return expiringSoon;
      default:
        return 0;
    }
  };

  return (
    <aside className="w-64 bg-secondary-500 text-white min-h-screen shadow-xl">
      <div className="p-6 border-b border-secondary-400">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileImage className="w-5 h-5" />
          </div>
          <span>海报管理系统</span>
        </h1>
        <p className="text-sm text-secondary-200 mt-1">校园社团活动海报管理平台</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge = getBadgeCount(item.path);
            
            return (
              <li key={item.path}>
                <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-secondary-100 hover:bg-secondary-400 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {badge > 0 && (
                  <span
                    className="ml-auto bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse-soft"
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-secondary-400">
        <div className="bg-secondary-400 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">管</span>
            </div>
            <div>
              <p className="font-medium">管理员</p>
              <p className="text-xs text-secondary-200">admin@school.edu</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
