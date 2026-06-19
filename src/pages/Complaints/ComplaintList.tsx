import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MessageSquareWarning,
  Thermometer,
  Droplets,
  Zap,
  Flame,
  Building2,
  User,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useRoomStore } from '@/store/useRoomStore';
import {
  getComplaintTypeLabel,
  getComplaintStatusLabel,
} from '@/utils/status';
import { cn } from '@/lib/utils';

const ComplaintList = () => {
  const { complaints } = useComplaintStore();
  const { rooms } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'not_hot' | 'unstable' | 'tripping' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'resolved' | 'closed'>('all');

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const room = rooms.find((r) => r.id === complaint.roomId);
      const matchesSearch =
        room?.roomNumber.includes(searchTerm) ||
        complaint.guestName.includes(searchTerm) ||
        complaint.orderNumber.includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || complaint.complaintType === filterType;
      const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [complaints, rooms, searchTerm, filterType, filterStatus]);

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.roomNumber || '未知';
  };

  const complaintIconMap = {
    not_hot: Thermometer,
    unstable: Droplets,
    tripping: Zap,
    other: Flame,
  };

  const statusStats = useMemo(() => {
    return {
      all: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      processing: complaints.filter((c) => c.status === 'processing').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
    };
  }, [complaints]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">投诉管理</h1>
          <p className="text-dark-400 mt-1">管理客人反馈和投诉处理</p>
        </div>
        <Link
          to="/complaints/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          记录投诉
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '全部投诉', value: statusStats.all, variant: 'info' as const, status: 'all' },
          { label: '待处理', value: statusStats.pending, variant: 'danger' as const, status: 'pending' },
          { label: '处理中', value: statusStats.processing, variant: 'warning' as const, status: 'processing' },
          { label: '已解决', value: statusStats.resolved, variant: 'success' as const, status: 'resolved' },
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
            placeholder="搜索房间号、客人姓名、订单号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-dark-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="px-3 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 transition-colors cursor-pointer"
          >
            <option value="all">全部类型</option>
            <option value="not_hot">水不热</option>
            <option value="unstable">忽冷忽热</option>
            <option value="tripping">跳闸</option>
            <option value="other">其他</option>
          </select>
        </div>
      </div>

      <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">投诉类型</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">房间</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">客人</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">订单号</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">日期</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint, index) => {
                  const Icon = complaintIconMap[complaint.complaintType];
                  return (
                    <tr
                      key={complaint.id}
                      className="hover:bg-dark-800/30 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-danger-500/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-danger-400" />
                          </div>
                          <span className="text-white font-medium">
                            {getComplaintTypeLabel(complaint.complaintType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-dark-400" />
                          <span className="text-white">{getRoomNumber(complaint.roomId)} 房</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-dark-400" />
                          <span className="text-dark-300">{complaint.guestName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300 font-mono text-sm">
                          {complaint.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-400">{complaint.complaintDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          label={getComplaintStatusLabel(complaint.status)}
                          variant={
                            complaint.status === 'pending'
                              ? 'danger'
                              : complaint.status === 'processing'
                              ? 'warning'
                              : complaint.status === 'resolved'
                              ? 'success'
                              : 'muted'
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/complaints/${complaint.id}`}
                          className="text-warning-400 hover:text-warning-300 text-sm"
                        >
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <MessageSquareWarning className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-400">没有找到匹配的投诉记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;
