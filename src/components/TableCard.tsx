import { Ruler, MapPin, Scissors, Footprints, Calendar } from 'lucide-react';
import type { FoldingTable } from '@/types';
import StatusBadge from './StatusBadge';
import { cn, formatDate } from '@/utils/helpers';
import useTableStore from '@/store/useTableStore';

interface TableCardProps {
  table: FoldingTable;
  onBorrow?: () => void;
  onReturn?: () => void;
}

export default function TableCard({ table, onBorrow, onReturn }: TableCardProps) {
  const getActiveBorrowForTable = useTableStore((state) => state.getActiveBorrowForTable);
  const activeBorrow = getActiveBorrowForTable(table.id);

  const isAvailable = table.status === 'available';
  const isBorrowed = table.status === 'borrowed';
  const isMaintenance = table.status === 'maintenance';

  return (
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg group',
        isAvailable && 'border-gray-100 hover:border-teal-200',
        isBorrowed && 'border-blue-100',
        isMaintenance && 'border-gray-200 opacity-75'
      )}
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={table.photo}
          alt={`折叠桌 ${table.id}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge type="status" value={table.status} pulse={table.status === 'borrowed'} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2.5 py-1 rounded-full text-sm font-semibold">
            {table.id}
          </span>
        </div>
        {table.issueTags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {table.issueTags.map((tag) => (
              <StatusBadge key={tag} type="issue" value={tag} pulse={tag === 'overdue'} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Ruler className="w-4 h-4 text-gray-400" />
            <span>{table.size}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{table.storageCabinet}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scissors className="w-4 h-4 text-gray-400" />
            <span>划痕 {table.scratchCount} 处</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Footprints className="w-4 h-4 text-gray-400" />
            <span>
              脚垫 {table.footPadCount}/{table.totalFootPads}
            </span>
          </div>
        </div>

        {activeBorrow && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-900 mb-1">
              {activeBorrow.residentName} · {activeBorrow.residentRoom}
            </p>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              预计归还：{formatDate(activeBorrow.expectedReturn)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {isAvailable && (
            <button
              onClick={onBorrow}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              我要借
            </button>
          )}
          {isBorrowed && (
            <button
              onClick={onReturn}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              去归还
            </button>
          )}
          {isMaintenance && (
            <div className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-500 text-sm font-medium rounded-xl text-center">
              维修中
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
