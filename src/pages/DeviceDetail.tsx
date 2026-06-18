import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  Monitor,
  Clock,
  User,
  AlertCircle,
  Edit,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { rooms } from '@/data/rooms';
import { formatDateTime, isOverdue } from '@/utils/date';
import { cn } from '@/lib/utils';

const DeviceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeviceById, getRecordsByDeviceId } = useStore();
  
  const device = getDeviceById(id || '');
  const records = getRecordsByDeviceId(id || '');
  
  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">设备不存在</h2>
        <p className="text-slate-500 mb-4">未找到对应的设备信息</p>
        <button
          onClick={() => navigate('/devices')}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          返回设备列表
        </button>
      </div>
    );
  }

  const room = rooms.find((r) => r.id === device.roomId);
  const activeRecord = records.find((r) => r.status === 'borrowed' || r.status === 'pending');

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/devices')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{device.name}</h1>
          <p className="text-slate-500 mt-1">设备详情与借用历史</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="aspect-square bg-slate-100">
              <img
                src={device.photo}
                alt={device.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-800">{device.name}</h2>
                <StatusBadge status={device.status} />
              </div>
              <p className="text-sm text-slate-500">{device.type} 转接头</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">设备信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">设备编号</p>
                  <p className="text-sm font-medium text-slate-700 font-mono">{device.serialNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">所在会议室</p>
                  <p className="text-sm font-medium text-slate-700">
                    {room?.name || '未分配'}
                    {room && <span className="text-slate-400 ml-1">({room.floor})</span>}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">适配设备</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {device.compatibleDevices.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">入库时间</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDateTime(device.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {device.status === 'available' && (
              <Link
                to={`/borrow?deviceId=${device.id}`}
                className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium text-center hover:from-teal-600 hover:to-cyan-700 transition-all"
              >
                立即借用
              </Link>
            )}
            <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" />
              标记故障
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeRecord && (
            <div className={cn(
              'rounded-2xl border p-5',
              isOverdue(activeRecord.endTime, activeRecord.status)
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">当前借用</h3>
                <StatusBadge
                  status={isOverdue(activeRecord.endTime, activeRecord.status) ? 'overdue' : activeRecord.status}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">借用人</p>
                  <p className="font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {activeRecord.borrowerName}
                    <span className="text-sm text-slate-500">({activeRecord.borrowerDept})</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">用途</p>
                  <p className="font-medium text-slate-700">{activeRecord.purpose}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">借出时间</p>
                  <p className="font-medium text-slate-700">
                    {formatDateTime(activeRecord.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">预计归还</p>
                  <p className={cn(
                    'font-medium',
                    isOverdue(activeRecord.endTime, activeRecord.status)
                      ? 'text-red-600'
                      : 'text-slate-700'
                  )}>
                    {formatDateTime(activeRecord.endTime)}
                  </p>
                </div>
              </div>
              
              {(activeRecord.status === 'borrowed' || activeRecord.status === 'overdue') && (
                <Link
                  to={`/return?recordId=${activeRecord.id}`}
                  className="mt-4 w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-center hover:bg-slate-50 transition-colors"
                >
                  归还设备
                </Link>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">借用历史</h3>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {records.length > 0 ? (
                records.map((record, index) => {
                  const overdue = isOverdue(record.endTime, record.status);
                  
                  return (
                    <div key={record.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className={cn(
                              'w-3 h-3 rounded-full mt-1.5',
                              record.status === 'returned' ? 'bg-slate-300' :
                              overdue ? 'bg-red-500' : 'bg-blue-500'
                            )} />
                            {index < records.length - 1 && (
                              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                {record.borrowerName}
                              </span>
                              <span className="text-sm text-slate-500">
                                {record.borrowerDept}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{record.purpose}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(record.startTime)} - {formatDateTime(record.endTime)}
                              </span>
                            </div>
                            {record.actualReturnTime && (
                              <p className="text-xs text-slate-400 mt-1">
                                实际归还：{formatDateTime(record.actualReturnTime)}
                              </p>
                            )}
                            {record.returnNotes && (
                              <p className="text-xs text-amber-600 mt-1">
                                备注：{record.returnNotes}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusBadge
                          status={overdue ? 'overdue' : record.status}
                          size="sm"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">暂无借用记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;
