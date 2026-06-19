import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Building2,
  User,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useRepairStore } from '@/store/useRepairStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getRepairStatusLabel,
} from '@/utils/status';
import { cn } from '@/lib/utils';
import { mockRepairers } from '@/utils/mockData';

const RepairList = () => {
  const { repairs } = useRepairStore();
  const { rooms } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'>('all');

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const room = rooms.find((r) => r.id === repair.roomId);
      const matchesSearch =
        room?.roomNumber.includes(searchTerm) ||
        repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.assignee.includes(searchTerm) ||
        repair.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [repairs, rooms, searchTerm, filterStatus]);

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.roomNumber || '未知';
  };

  const statusStats = useMemo(() => {
    return {
      all: repairs.length,
      pending: repairs.filter((r) => r.status === 'pending').length,
      assigned: repairs.filter((r) => r.status === 'assigned').length,
      in_progress: repairs.filter((r) => r.status === 'in_progress').length,
      completed: repairs.filter((r) => r.status === 'completed').length,
    };
  }, [repairs]);

  const progressMap = {
    pending: 10,
    assigned: 30,
    in_progress: 60,
    completed: 100,
    cancelled: 0,
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inspection: '巡检发现',
      complaint: '客人投诉',
      routine: '定期维护',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">维修管理</h1>
          <p className="text-dark-400 mt-1">管理所有维修任务和进度</p>
        </div>
        <button
          onClick={() => {
            alert('请从巡检或投诉页面生成维修工单');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 text-white rounded-xl font-medium hover:bg-dark-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增维修
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '全部', value: statusStats.all, status: 'all' },
          { label: '待派单', value: statusStats.pending, status: 'pending' },
          { label: '已派单', value: statusStats.assigned, status: 'assigned' },
          { label: '维修中', value: statusStats.in_progress, status: 'in_progress' },
          { label: '已完成', value: statusStats.completed, status: 'completed' },
        ].map((item) => (
          <button
            key={item.status}
            onClick={() => setFilterStatus(item.status as typeof filterStatus)}
            className={cn(
              'p-4 rounded-xl border transition-all text-left',
              filterStatus === item.status
                ? 'bg-warning-500/10 border-warning-500/30'
                : 'bg-dark-900/50 border-dark-800 hover:border-dark-700'
            )}
          >
            <p className="text-dark-400 text-sm">{item.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="搜索房间号、维修内容、负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepairs.length > 0 ? (
          filteredRepairs.map((repair, index) => {
            const room = rooms.find((r) => r.id === repair.roomId);
            const progress = progressMap[repair.status];

            return (
              <Link
                key={repair.id}
                to={`/repairs/${repair.id}`}
                className="group bg-dark-900/50 rounded-2xl border border-dark-800 p-5 hover:border-warning-500/30 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/15 rounded-xl flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-warning-400 transition-colors">
                        {repair.title}
                      </h3>
                      <p className="text-xs text-dark-500">
                        {getSourceTypeLabel(repair.sourceType)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    label={getRepairStatusLabel(repair.status)}
                    variant={
                      repair.status === 'completed'
                        ? 'success'
                        : repair.status === 'in_progress'
                        ? 'warning'
                        : repair.status === 'cancelled'
                        ? 'muted'
                        : 'info'
                    }
                    size="sm"
                  />
                </div>

                <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                  {repair.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-dark-400">
                      <Building2 className="w-4 h-4" />
                      <span>{room?.roomNumber} 房</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-400">
                      <User className="w-4 h-4" />
                      <span>{repair.assignee || '待指派'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-dark-400">
                      <Calendar className="w-4 h-4" />
                      <span>{repair.scheduledDate}</span>
                    </div>
                    {repair.cost > 0 && (
                      <div className="flex items-center gap-2 text-dark-400">
                        <DollarSign className="w-4 h-4" />
                        <span>¥{repair.cost}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-dark-500 mb-1.5">
                      <span>进度</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          repair.status === 'completed'
                            ? 'bg-success-500'
                            : 'bg-primary-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <Wrench className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">没有找到匹配的维修任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairList;
