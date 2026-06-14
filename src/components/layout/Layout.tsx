import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: '首页概览',
    subtitle: '查看所有空调状态和清洗统计',
  },
  '/air-conditioners': {
    title: '空调档案',
    subtitle: '管理家里的空调设备信息',
  },
  '/air-conditioners/new': {
    title: '新增空调',
    subtitle: '添加一台新的空调设备',
  },
  '/cleaning-records': {
    title: '清洗记录',
    subtitle: '查看所有历史清洗记录',
  },
};

export function Layout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitles).find((key) => {
    if (key === '/') return location.pathname === '/';
    if (key === '/air-conditioners/new') return location.pathname === '/air-conditioners/new';
    if (key === '/air-conditioners') return location.pathname.startsWith('/air-conditioners/');
    return location.pathname.startsWith(key);
  }) || '/';

  const { title, subtitle } = pageTitles[pathKey] || {
    title: '空调清洗管理',
    subtitle: '',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
