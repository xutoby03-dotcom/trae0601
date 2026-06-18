import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '仪表板', subtitle: '查看实验服管理数据概览和统计分析' },
  '/coats': { title: '实验服档案', subtitle: '管理所有实验服的基本信息和状态' },
  '/lendings': { title: '领用登记', subtitle: '登记学生实验服领用信息' },
  '/return': { title: '归还检查', subtitle: '检查归还实验服的状况并记录破损' },
  '/cleaning': { title: '清洗管理', subtitle: '管理实验服清洗批次和流程' },
};

export function Layout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitles).find(
    (key) => location.pathname === key || location.pathname.startsWith(key + '/')
  );
  const pageInfo = pathKey ? pageTitles[pathKey] : { title: '实验服管理', subtitle: '' };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-8 py-5">
          <h2 className="text-xl font-bold text-gray-900">{pageInfo.title}</h2>
          {pageInfo.subtitle && <p className="text-sm text-gray-500 mt-0.5">{pageInfo.subtitle}</p>}
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
