import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  User,
  Cable,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { rooms } from '@/data/rooms';
import { formatDateTime, isOverdue } from '@/utils/date';
import { BorrowStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusFilters: (BorrowStatus | 'all')[] = [
  'all',
  'borrowed',
  'pending',
  'returned',
  'overdue',
];

const Records = () => {
  const { borrowRecords, getDeviceById } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | 'all'>('all');

  const filteredRecords = useMemo(() => {
    return borrowRecords
      .filter((record) => {
        const device = getDeviceById(record.deviceId);
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matches =
            record.borrowerName.toLowerCase().includes(term) ||
            record.purpose.toLowerCase().includes(term) ||
            device?.name.toLowerCase().includes(term) ||
            device?.serialNumber.toLowerCase().includes(term);
          if (!matches) return false;
        }
        
        if (statusFilter !== 'all') {
          if (statusFilter === 'overdue') {
            return isOverdue(record.endTime, record.status);
          }
          if (record.status !== statusFilter) return false;
        }
        
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  }, [borrowRecords, searchTerm, statusFilter, getDeviceById]);

  const getStatusLabel = (status: string, endTime: string) => {
    if (isOverdue(endTime, status)) return 'overdue' as const;
    return status as BorrowStatus;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">借用记录</h1>
          <p className="text-slate-500 mt-1">
            共 {borrowRecords.length} 条记录
          </p>
        </div>
        
        <Link
          to="/borrow"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
        >
          <Calendar className="w-4 h-4" />
          发起借用
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索借用人、设备、用途..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    statusFilter === status
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {status === 'all' && '全部'}
                  {status === 'borrowed' && '借出中'}
                  {status === 'pending' && '待使用'}
                  {status === 'returned' && '已归还'}
                  {status === 'overdue' && '逾期'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const device = getDeviceById(record.deviceId);
              const room = device ? rooms.find((r) => r.id === device.roomId) : null;
              const displayStatus = getStatusLabel(record.status, record.endTime);
              
              return (
                <div
                  key={record.id}
                  className={cn(
                    'p-5 hover:bg-slate-50 transition-colors',
                    displayStatus === 'overdue' && 'bg-red-50/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {device && (
                          <img
                            src={device.photo}
                            alt={device.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {device?.name || '未知设备'}
                          </h3>
                          <StatusBadge status={displayStatus} size="sm" />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {record.borrowerName}
                            <span className="text-slate-400">({record.borrowerDept})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Cable className="w-3.5 h-3.5" />
                            {device?.type}
                          </span>
                          {room && (
                            <span className="flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="inline"
                              >
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {room.name}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 mt-2 truncate">
                          用途：{record.purpose}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            借出：{formatDateTime(record.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            {record.actualReturnTime ? (
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            )}
                            {record.actualReturnTime
                              ? `归还：${formatDateTime(record.actualReturnTime)}`
                              : `预计归还：${formatDateTime(record.endTime)}`}
                          </span>
                        </div>
                        
                        {record.returnNotes && (
                          <p className="text-xs text-amber-600 mt-2">
                            备注：{record.returnNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {device && (
                        <Link
                          to={`/devices/${device.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">没有找到匹配的记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
