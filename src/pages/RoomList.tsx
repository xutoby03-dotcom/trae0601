import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import RoomCard from '@/components/RoomCard';
import { LOW_STOCK_THRESHOLDS } from '@/utils/constants';

export default function RoomList() {
  const navigate = useNavigate();
  const { rooms, supplies } = useAppStore();
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  const filteredRooms = rooms.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.responsiblePerson.toLowerCase().includes(search.toLowerCase());
    const matchFloor = floorFilter === '' || r.floor === floorFilter;
    return matchSearch && matchFloor;
  });

  const getRoomSupplyStats = (roomId: string) => {
    const roomSupplies = supplies.filter((s) => s.roomId === roomId);
    const lowStockCount = roomSupplies.filter((s) => {
      const threshold = LOW_STOCK_THRESHOLDS[s.type];
      return s.type === 'cleaner'
        ? (s.remainingPercent ?? 0) <= threshold
        : s.quantity <= threshold;
    }).length;
    return {
      supplyCount: roomSupplies.length,
      lowStockCount,
    };
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="relative flex-1 md:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索会议室名称或责任人..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="input-field pl-10 pr-10 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">全部楼层</option>
                {floors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={() => navigate('/rooms/new')} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            新增会议室
          </button>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="card p-16 text-center">
          <Search className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">未找到会议室</h3>
          <p className="text-slate-400">请尝试调整搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const stats = getRoomSupplyStats(room.id);
            return (
              <RoomCard
                key={room.id}
                room={room}
                supplyCount={stats.supplyCount}
                lowStockCount={stats.lowStockCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
