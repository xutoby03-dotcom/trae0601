import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '仪表盘', subtitle: '茶品库存概览与预警提醒' },
  '/batches': { title: '批次管理', subtitle: '茶叶批次信息录入与维护' },
  '/batches/new': { title: '新增批次', subtitle: '录入新的茶叶批次' },
  '/jars': { title: '封罐管理', subtitle: '封罐记录与罐状态追踪' },
  '/jars/new': { title: '新增封罐', subtitle: '执行分装封罐操作' },
  '/statistics': { title: '数据统计', subtitle: '库存分析与补货建议' },
};

export default function AppLayout() {
  const location = useLocation();
  const pathKey = Object.keys(pageTitles).find(
    (key) => location.pathname === key || location.pathname.startsWith(key + '/')
  ) || '/';
  const pageInfo = pageTitles[pathKey === '/' ? '/' : pathKey] || pageTitles['/'];

  const isDetailPage =
    location.pathname.includes('/jars/') && location.pathname !== '/jars/new' && location.pathname !== '/jars/';
  const isEditPage = location.pathname.includes('/edit');

  const getTitle = () => {
    if (isDetailPage) return { title: '罐详情', subtitle: '查看单罐信息与操作历史' };
    if (isEditPage) return { title: '编辑批次', subtitle: '修改茶叶批次信息' };
    return pageInfo;
  };

  const { title, subtitle } = getTitle();

  return (
    <div className="flex min-h-screen bg-tea-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
