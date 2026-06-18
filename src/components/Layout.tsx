import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: '仪表盘', subtitle: '数据概览与待办事项' },
  '/rooms': { title: '会议室管理', subtitle: '管理所有会议室档案' },
  '/rooms/new': { title: '新增会议室', subtitle: '创建新的会议室档案' },
  '/inventory': { title: '库存管理', subtitle: '查看和管理用品库存' },
  '/inspection': { title: '巡检中心', subtitle: '执行巡检与检查用品状态' },
  '/tasks': { title: '补给任务', subtitle: '跟踪补给任务处理' },
  '/statistics': { title: '统计报表', subtitle: '消耗统计与采购建议' },
  '/feedback': { title: '员工反馈', subtitle: '扫码反馈用品问题' },
};

export default function Layout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitles).find(
    (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
  );
  const pageInfo = pageTitles[pathKey || '/'] || { title: '白板补给系统' };

  const isFeedbackPage = location.pathname === '/feedback';

  if (isFeedbackPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
