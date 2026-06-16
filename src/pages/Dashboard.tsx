import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Umbrella, Droplets, Wrench, Clock, MapPin, User, Phone, ChevronRight, RotateCcw } from 'lucide-react';
import { useStore } from '@/store';
import StatCard from '@/components/StatCard';
import { OverdueBadge } from '@/components/StatusBadge';
import { isOverdue, formatDateTime, isToday, getOverdueHours } from '@/utils/date';

export default function Dashboard() {
  const { canopies, borrowRecords, resetStore } = useStore();

  const stats = useMemo(() => {
    const borrowed = canopies.filter((c) => c.status === 'borrowed').length;
    const drying = canopies.filter((c) => c.status === 'drying').length;
    const repairing = canopies.filter((c) => c.status === 'repairing').length;
    const available = canopies.filter((c) => c.status === 'available').length;
    return { borrowed, drying, repairing, available };
  }, [canopies]);

  const activeRecords = useMemo(() => {
    return borrowRecords
      .filter((r) => r.status === 'active')
      .map((r) => ({
        ...r,
        isOverdue: isOverdue(r.dueTime),
      }))
      .sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
      });
  }, [borrowRecords]);

  const todayRecords = useMemo(() => {
    return borrowRecords.filter(
      (r) => isToday(r.borrowTime) || (r.returnTime && isToday(r.returnTime))
    );
  }, [borrowRecords]);

  const getCanopy = (id: string) => canopies.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">今日概览</h2>
          <p className="text-sm text-gray-500 mt-0.5">今日共处理 {todayRecords.length} 笔借用记录</p>
        </div>
        <button onClick={resetStore} className="btn-ghost text-gray-500 text-xs">
          <RotateCcw size={14} />
          重置数据
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="在借中" value={stats.borrowed} icon={Umbrella} color="blue" subtitle="正在使用的雨棚" />
        <StatCard title="待晾干" value={stats.drying} icon={Droplets} color="amber" subtitle="湿收后禁止借出" />
        <StatCard title="维修中" value={stats.repairing} icon={Wrench} color="red" subtitle="配件损坏或缺件" />
        <StatCard title="可借出" value={stats.available} icon={Umbrella} color="emerald" subtitle="状态正常可用" />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">今日借用列表</h3>
            <p className="text-xs text-gray-500 mt-0.5">按归还时间紧急程度排序</p>
          </div>
          <Link to="/borrow" className="btn-primary">
            <Clock size={16} />
            新建借用
          </Link>
        </div>

        {activeRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Umbrella size={48} className="mx-auto text-gray-300 mb-3" />
            <div className="text-gray-500">暂无正在借用的雨棚</div>
            <Link to="/borrow" className="btn-primary mt-4">
              登记第一笔借用
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">雨棚</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活动名称</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">楼栋点位</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">借用时间</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">应归还</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeRecords.map((record) => {
                  const canopy = getCanopy(record.canopyId);
                  const overdueHrs = getOverdueHours(record.dueTime);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{canopy?.name || '-'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">{record.activityName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          {record.location}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <User size={14} className="text-gray-400" />
                            {record.contact.split(' ')[0]}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                            <Phone size={12} className="text-gray-300" />
                            {record.contact.split(' ')[1] || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDateTime(record.borrowTime)}
                      </td>
                      <td className="px-5 py-4">
                        <div className={`text-sm font-medium ${record.isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDateTime(record.dueTime)}
                        </div>
                        {record.isOverdue && (
                          <div className="text-xs text-red-500 mt-0.5">超时 {overdueHrs} 小时</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <OverdueBadge overdue={record.isOverdue} />
                        {!record.isOverdue && (
                          <span className="badge bg-blue-100 text-blue-700">借用中</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/return/${record.id}`}
                          className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-800 font-medium text-sm"
                        >
                          归还验收
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
