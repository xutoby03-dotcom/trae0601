import { useState, useMemo } from 'react';
import { Search, Filter, Music } from 'lucide-react';
import RoomCard from '@/components/RoomCard';
import { useAppStore } from '@/store/useAppStore';
import { PIANO_TYPE_LABELS, FLOORS, PianoType, RoomStatus } from '@/types';

export default function Home() {
  const { rooms } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [pianoTypeFilter, setPianoTypeFilter] = useState<PianoType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
      const matchesPianoType = pianoTypeFilter === 'all' || room.pianoType === pianoTypeFilter;
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      
      return matchesSearch && matchesFloor && matchesPianoType && matchesStatus;
    });
  }, [rooms, searchQuery, floorFilter, pianoTypeFilter, statusFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-wood-900 mb-2">琴房列表</h1>
        <p className="text-wood-600">共 {rooms.length} 间琴房，{filteredRooms.filter(r => r.status === 'available').length} 间可预约</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="text"
              placeholder="搜索琴房编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2 text-wood-500">
            <Filter className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium text-wood-600">筛选：</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFloorFilter('all')}
              className={`filter-btn ${floorFilter === 'all' ? 'filter-btn-active' : ''}`}
            >
              全部楼层
            </button>
            {FLOORS.map(floor => (
              <button
                key={floor}
                onClick={() => setFloorFilter(floor)}
                className={`filter-btn ${floorFilter === floor ? 'filter-btn-active' : ''}`}
              >
                {floor}楼
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-cream-200">
          <div className="flex items-center gap-2 text-wood-500">
            <Music className="w-4 h-4" />
            <span className="text-sm">钢琴类型：</span>
          </div>
          <button
            onClick={() => setPianoTypeFilter('all')}
            className={`filter-btn text-xs ${pianoTypeFilter === 'all' ? 'filter-btn-active' : ''}`}
          >
            全部
          </button>
          {Object.entries(PIANO_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPianoTypeFilter(value as PianoType)}
              className={`filter-btn text-xs ${pianoTypeFilter === value ? 'filter-btn-active' : ''}`}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-6 bg-cream-200 mx-2 hidden sm:block" />

          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-btn text-xs ${statusFilter === 'all' ? 'filter-btn-active' : ''}`}
          >
            全部状态
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={`filter-btn text-xs ${statusFilter === 'available' ? 'filter-btn-active' : ''}`}
          >
            可预约
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`filter-btn text-xs ${statusFilter === 'maintenance' ? 'filter-btn-active' : ''}`}
          >
            维修中
          </button>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-wood-400" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-wood-900 mb-2">没有找到琴房</h3>
          <p className="text-wood-600">请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
