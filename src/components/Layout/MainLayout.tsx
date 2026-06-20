import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ClipboardCheck,
  ClipboardList,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Sparkles,
  Droplets,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { Avatar, Badge, Breadcrumb, Input, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

interface MenuItem {
  key: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const menuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: 'counters',
    label: '柜台管理',
    path: '/counters',
    icon: <Store size={20} />,
  },
  {
    key: 'inventory',
    label: '库存管理',
    path: '/inventory',
    icon: <Package size={20} />,
  },
  {
    key: 'inspection',
    label: '巡查补给',
    icon: <ClipboardCheck size={20} />,
    children: [
      {
        key: 'inspection-form',
        label: '巡查登记',
        path: '/inspection',
        icon: <ClipboardCheck size={18} />,
      },
      {
        key: 'inspection-records',
        label: '巡查记录',
        path: '/inspection/records',
        icon: <ClipboardList size={18} />,
      },
      {
        key: 'tasks',
        label: '补给任务',
        path: '/tasks',
        icon: <ClipboardList size={18} />,
      },
    ],
  },
  {
    key: 'activities',
    label: '活动设置',
    path: '/activities',
    icon: <Calendar size={20} />,
  },
  {
    key: 'statistics',
    label: '数据统计',
    icon: <BarChart3 size={20} />,
    children: [
      {
        key: 'consumption',
        label: '耗材消耗',
        path: '/statistics/consumption',
        icon: <Droplets size={18} />,
      },
      {
        key: 'shortage',
        label: '缺货分析',
        path: '/statistics/shortage',
        icon: <AlertTriangle size={18} />,
      },
      {
        key: 'purchase',
        label: '采购建议',
        path: '/statistics/purchase',
        icon: <ShoppingCart size={18} />,
      },
    ],
  },
];

const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['工作台'],
  '/counters': ['柜台管理', '柜台列表'],
  '/inventory': ['库存管理', '库存概览'],
  '/inspection': ['巡查补给', '巡查登记'],
  '/inspection/records': ['巡查补给', '巡查记录'],
  '/tasks': ['巡查补给', '补给任务'],
  '/activities': ['活动设置'],
  '/statistics/consumption': ['数据统计', '耗材消耗'],
  '/statistics/shortage': ['数据统计', '缺货分析'],
  '/statistics/purchase': ['数据统计', '采购建议'],
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    const toExpand: string[] = [];
    menuConfig.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.path || pathname.startsWith(child.path + '/')
        );
        if (hasActiveChild) {
          toExpand.push(item.key);
        }
      }
    });
    setExpandedKeys(toExpand);
  }, [location.pathname]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getBreadcrumbItems = () => {
    const pathname = location.pathname;
    let matched: string[] = [];
    for (const [path, crumbs] of Object.entries(breadcrumbMap)) {
      if (pathname === path || pathname.startsWith(path + '/')) {
        matched = crumbs;
        break;
      }
    }
    if (location.pathname.startsWith('/counters/') && location.pathname !== '/counters') {
      matched = ['柜台管理', '柜台详情'];
    } else if (location.pathname.startsWith('/tasks/') && location.pathname !== '/tasks') {
      matched = ['巡查补给', '补给任务', '任务详情'];
    }
    return matched;
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
    },
  ];

  return (
    <div className="flex h-screen bg-cream-100 overflow-hidden">
      <aside
        className="flex flex-col bg-gradient-to-b from-wine-800 via-wine-700 to-wine-800 text-white flex-shrink-0 overflow-hidden relative"
        style={{ width: 240 }}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-gold-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="text-wine-800" size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-white tracking-wide">
                试香耗材补给
              </h1>
              <p className="text-gold-300/80 text-xs mt-0.5">Perfume Bar Supplies</p>
            </div>
          </div>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto py-4 px-3">
          {menuConfig.map((item) => (
            <div key={item.key} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                      item.children.some((c) => isActive(c.path || ''))
                        ? 'bg-white/10 text-gold-300'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className={`${
                        item.children.some((c) => isActive(c.path || ''))
                          ? 'text-gold-400'
                          : 'text-white/70 group-hover:text-gold-300'
                      } transition-colors`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    <span
                      className={`transition-transform duration-200 ${
                        expandedKeys.includes(item.key) ? 'rotate-180' : ''
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  {expandedKeys.includes(item.key) && (
                    <div className="mt-1 ml-4 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.key}
                          to={child.path || '#'}
                          onClick={() => child.path && navigate(child.path)}
                          className={({ isActive: active }) =>
                            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              active
                                ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-300 border-l-2 border-gold-400'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`
                          }
                        >
                          <span className="opacity-80">{child.icon}</span>
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path || '#'}
                  onClick={() => item.path && navigate(item.path)}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-gold-500/20 to-transparent text-gold-300 border-l-2 border-gold-400 shadow-inner'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <span
                    className={`${
                      isActive(item.path || '')
                        ? 'text-gold-400'
                        : 'text-white/70 group-hover:text-gold-300'
                    } transition-colors`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive(item.path || '') && (
                    <ChevronRight size={16} className="ml-auto text-gold-400" />
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="relative z-10 border-t border-white/10 p-4">
          <Dropdown menu={{ items: userMenuItems }} placement="topLeft" trigger={['click']}>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group">
              <Avatar
                size={40}
                style={{
                  backgroundColor: '#C9A962',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
                icon={<User size={20} />}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-gold-300 transition-colors">
                  李店长
                </p>
                <p className="text-xs text-white/50 truncate">南京德基广场店</p>
              </div>
            </div>
          </Dropdown>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-wine-100/50 flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Breadcrumb
              items={getBreadcrumbItems().map((item, index) => ({
                title: (
                  <span
                    className={`${
                      index === getBreadcrumbItems().length - 1
                        ? 'text-wine-700 font-medium'
                        : 'text-cream-500'
                    }`}
                  >
                    {item}
                  </span>
                ),
              }))}
              separator={<span className="text-gold-400">/</span>}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                prefix={<Search size={16} className="text-cream-400" />}
                placeholder="搜索柜台、耗材..."
                className="!w-64 !rounded-full !bg-cream-50 !border-wine-100"
                style={{ borderRadius: 9999 }}
              />
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold-50 to-cream-100 border border-gold-200/60">
              <span className="text-wine-600 font-serif text-sm">
                {currentTime.format('M月D日 dddd')}
              </span>
              <span className="text-cream-400">·</span>
              <span className="text-gold-700 font-mono text-sm">
                {currentTime.format('HH:mm')}
              </span>
            </div>

            <Tooltip title="待处理通知">
              <Badge count={5} size="small" offset={[-2, 2]}>
                <button
                  className="relative w-10 h-10 rounded-full bg-cream-50 border border-wine-100 flex items-center justify-center text-wine-600 hover:bg-gold-50 hover:border-gold-300 hover:text-wine-700 transition-all duration-200"
                >
                  <Bell size={18} />
                </button>
              </Badge>
            </Tooltip>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
