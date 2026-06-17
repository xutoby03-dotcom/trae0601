import { Link } from 'react-router-dom';
import { Armchair, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useSeatStore } from '@/store/useSeatStore';
import SeatCard from '@/components/common/SeatCard';
import { getAllSeatExpiryInfo } from '@/utils/statistics';

export default function SeatList() {
  const { seats } = useSeatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSeats = seats.filter(s => 
    s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.weightRange.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const expiryInfo = getAllSeatExpiryInfo(seats);

  const getSeatInfo = (seatId: string) => {
    return expiryInfo.find(info => info.seat.id === seatId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">座椅管理</h1>
          <p className="text-gray-500 mt-1">
            共 {seats.length} 个安全座椅
          </p>
        </div>
        <Link to="/seats/new" className="btn-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          新增座椅
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索座椅品牌、型号或适用体重..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {filteredSeats.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Armchair className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? '未找到匹配的座椅' : '暂无座椅档案'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? '请尝试其他搜索关键词' : '添加您的第一个安全座椅开始使用'}
          </p>
          <Link to="/seats/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            新增座椅
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeats.map((seat) => {
            const info = getSeatInfo(seat.id);
            return (
              <SeatCard
                key={seat.id}
                seat={seat}
                daysUntilExpiry={info?.daysUntilExpiry}
                expiryStatus={info?.status || 'normal'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
