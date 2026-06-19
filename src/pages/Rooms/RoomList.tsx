import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Flame,
  Zap,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useRoomStore } from '@/store/useRoomStore';
import {
  calculateLifespan,
  getHeaterTypeLabel,
  getRoomStatusColor,
  getRoomStatusLabel,
} from '@/utils/status';
import { cn } from '@/lib/utils';

const RoomList = () => {
  const { rooms } = useRoomStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gas' | 'electric'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'disabled'>('all');

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.roomNumber.includes(searchTerm) ||
        room.heaterModel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || room.heaterType === filterType;
      const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, filterType, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">房间档案</h1>
          <p className="text-dark-400 mt-1">管理所有房间的热水器设备信息</p>
        </div>
        <Link
          to="/rooms/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-warning-500 text-white rounded-xl font-medium hover:bg-warning-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新增房间
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="搜索房间号或设备型号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-warning-500/50 focus:ring-2 focus:ring-warning-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-dark-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'gas' | 'electric')}
            className="px-3 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 transition-colors cursor-pointer"
          >
            <option value="all">全部类型</option>
            <option value="gas">燃气热水器</option>
            <option value="electric">电热水器</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'maintenance' | 'disabled')}
            className="px-3 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-warning-500/50 transition-colors cursor-pointer"
          >
            <option value="all">全部状态</option>
            <option value="active">正常营业</option>
            <option value="maintenance">维修中</option>
            <option value="disabled">已停用</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room, index) => {
          const lifespan = calculateLifespan(room);
          return (
            <Link
              key={room.id}
              to={`/rooms/${room.id}`}
              className="group relative bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden hover:border-warning-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="aspect-video bg-dark-800 relative overflow-hidden">
                <img
                  src={room.photoUrl}
                  alt={room.roomNumber}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <StatusBadge
                    label={getRoomStatusLabel(room.status)}
                    variant={
                      room.status === 'active'
                        ? 'success'
                        : room.status === 'maintenance'
                        ? 'warning'
                        : 'muted'
                    }
                  />
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg">
                    <Building2 className="w-3.5 h-3.5 text-dark-300" />
                    <span className="text-xs text-dark-200">{room.floor}F</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {room.roomNumber} 房
                  </h3>
                  {room.heaterType === 'gas' ? (
                    <Flame className="w-5 h-5 text-warning-400" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary-400" />
                  )}
                </div>

                <p className="text-sm text-dark-400 mb-3 line-clamp-1">
                  {room.heaterModel}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-dark-800/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-dark-500">容量</p>
                    <p className="text-sm font-medium text-white">
                      {room.capacityLiters}L
                    </p>
                  </div>
                  <div className="bg-dark-800/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-dark-500">类型</p>
                    <p className="text-sm font-medium text-white">
                      {getHeaterTypeLabel(room.heaterType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-dark-400">
                    <Calendar className="w-4 h-4" />
                    <span>{room.installDate}</span>
                  </div>
                  {lifespan.level !== 'normal' && (
                    <StatusBadge
                      label={lifespan.level === 'critical' ? '高龄' : '注意'}
                      variant={lifespan.level === 'critical' ? 'danger' : 'warning'}
                      size="sm"
                    />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-sm text-dark-400">查看详情</span>
                  <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-warning-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">没有找到匹配的房间</p>
        </div>
      )}
    </div>
  );
};

export default RoomList;
