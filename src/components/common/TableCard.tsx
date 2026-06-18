import { MapPin, Clock, Grid3X3, BadgeCheck } from 'lucide-react';
import type { Table } from '../../types';
import { TableStatusBadge } from './StatusBadge';

interface TableCardProps {
  table: Table;
  onClick?: () => void;
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const netStatusText = {
    good: '球网正常',
    damaged: '球网损坏',
    missing: '球网缺失',
  };

  const netStatusColor = {
    good: 'text-floor-500',
    damaged: 'text-yellow-600',
    missing: 'text-red-500',
  };

  return (
    <div
      className="card cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={table.photo}
          alt={table.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <TableStatusBadge status={table.status} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <h3 className="font-display text-xl font-bold">{table.name}</h3>
          <div className="flex items-center gap-1 text-sm text-white/90">
            <MapPin size={14} />
            {table.location}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-table-500" />
            <span>{table.openTimeStart} - {table.openTimeEnd}</span>
          </div>
          <div className={`flex items-center gap-2 ${netStatusColor[table.netStatus]}`}>
            <Grid3X3 size={16} />
            <span>{netStatusText[table.netStatus]}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 col-span-2">
            <BadgeCheck size={16} className="text-primary-500" />
            <span>可用球拍: {table.racketCount} 副</span>
          </div>
        </div>
      </div>
    </div>
  );
}
