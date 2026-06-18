import { Link } from 'react-router-dom';
import { Users, PenTool, User } from 'lucide-react';
import type { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  supplyCount: number;
  lowStockCount: number;
}

export default function RoomCard({ room, supplyCount, lowStockCount }: RoomCardProps) {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="card overflow-hidden group animate-slide-up hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={room.photoUrl}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-semibold text-white">{room.name}</h3>
          <p className="text-sm text-white/80">{room.floor}</p>
        </div>
        {lowStockCount > 0 && (
          <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {lowStockCount} 项告警
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-slate-50">
            <Users className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <p className="text-xs text-slate-500">容量</p>
            <p className="text-sm font-semibold text-slate-700">{room.capacity}人</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <PenTool className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <p className="text-xs text-slate-500">白板</p>
            <p className="text-sm font-semibold text-slate-700">{room.whiteboardCount}块</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <User className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <p className="text-xs text-slate-500">用品</p>
            <p className="text-sm font-semibold text-slate-700">{supplyCount}项</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">责任人</span>
          <span className="text-sm font-medium text-slate-700">{room.responsiblePerson}</span>
        </div>
      </div>
    </Link>
  );
}
