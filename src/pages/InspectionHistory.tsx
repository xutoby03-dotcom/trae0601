import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  ClipboardCheck,
  Clock,
  User,
  Building,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { COLOR_OPTIONS } from '@/types';
import ColorBadge from '@/components/ColorBadge';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, cn } from '@/utils';

export default function InspectionHistory() {
  const meetingRooms = useAppStore((state) => state.meetingRooms);
  const inspectionRecords = useAppStore((state) => state.inspectionRecords);

  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return inspectionRecords.filter((record) => {
      const matchSearch =
        record.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.bookingDepartment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRoom = !roomFilter || record.roomId === roomFilter;
      return matchSearch && matchRoom;
    });
  }, [inspectionRecords, searchTerm, roomFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getColorHex = (color: string) => {
    return COLOR_OPTIONS.find((c) => c.color === color)?.hex || '#6b7280';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/inspection"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡检历史</h1>
          <p className="mt-1 text-slate-500">
            共 {filteredRecords.length} 条记录
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索会议室、巡检人、部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all appearance-none bg-white"
            >
              <option value="">全部会议室</option>
              {meetingRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>暂无巡检记录</p>
            </div>
          ) : (
            filteredRecords.map((record, index) => {
              const isExpanded = expandedId === record.id;
              const shortageCount = record.colorStocks.filter((cs) => cs.belowMin).length +
                [record.eraserBelowMin, record.sprayBelowMin, record.magnetBelowMin].filter(Boolean).length;

              return (
                <div
                  key={record.id}
                  className="group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => toggleExpand(record.id)}
                    className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            record.needReplenish
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-emerald-100 text-emerald-600'
                          )}
                        >
                          {record.needReplenish ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 truncate">
                              {record.roomName}
                            </h3>
                            {record.needReplenish && (
                              <StatusBadge
                                status="shortage"
                                label={`缺${shortageCount}项`}
                                variant="warning"
                                size="sm"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDateTime(new Date(record.createdAt))}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {record.inspector}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5" />
                              {record.bookingDepartment}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1">
                          {record.colorStocks.slice(0, 4).map((cs) => (
                            <div
                              key={cs.color}
                              className={cn(
                                'w-6 h-6 rounded-full border-2 border-white shadow-sm',
                                cs.belowMin && 'ring-2 ring-red-300'
                              )}
                              style={{ backgroundColor: getColorHex(cs.color) }}
                              title={`${cs.colorName}: ${cs.count}支`}
                            />
                          ))}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top">
                      <div className="ml-14 p-4 bg-slate-50 rounded-xl space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2">
                            白板笔库存
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                            {record.colorStocks.map((cs) => (
                              <div
                                key={cs.color}
                                className={cn(
                                  'flex items-center justify-between p-2 rounded-lg',
                                  cs.belowMin ? 'bg-red-50' : 'bg-white'
                                )}
                              >
                                <ColorBadge color={cs.color} colorName={cs.colorName} size="sm" />
                                <div className="flex items-center gap-1">
                                  <span
                                    className={cn(
                                      'font-mono font-bold',
                                      cs.belowMin ? 'text-red-600' : 'text-slate-700'
                                    )}
                                  >
                                    {cs.count}
                                  </span>
                                  <span className="text-xs text-slate-400">支</span>
                                  {cs.consecutiveShortage >= 2 && (
                                    <span className="text-xs text-red-500 font-medium">
                                      ⚠
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div
                            className={cn(
                              'p-3 rounded-lg text-center',
                              record.eraserBelowMin ? 'bg-amber-50' : 'bg-white'
                            )}
                          >
                            <p className="text-xs text-slate-500">橡皮</p>
                            <p
                              className={cn(
                                'text-lg font-bold font-mono',
                                record.eraserBelowMin ? 'text-amber-600' : 'text-slate-700'
                              )}
                            >
                              {record.eraserCount}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'p-3 rounded-lg text-center',
                              record.sprayBelowMin ? 'bg-amber-50' : 'bg-white'
                            )}
                          >
                            <p className="text-xs text-slate-500">清洁喷雾</p>
                            <p
                              className={cn(
                                'text-lg font-bold font-mono',
                                record.sprayBelowMin ? 'text-amber-600' : 'text-slate-700'
                              )}
                            >
                              {record.sprayCount}
                            </p>
                          </div>
                          <div
                            className={cn(
                              'p-3 rounded-lg text-center',
                              record.magnetBelowMin ? 'bg-amber-50' : 'bg-white'
                            )}
                          >
                            <p className="text-xs text-slate-500">磁贴</p>
                            <p
                              className={cn(
                                'text-lg font-bold font-mono',
                                record.magnetBelowMin ? 'text-amber-600' : 'text-slate-700'
                              )}
                            >
                              {record.magnetCount}
                            </p>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">备注</p>
                            <p className="text-sm text-slate-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
