import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Flame,
  Zap,
  Calendar,
  Wrench,
  ClipboardList,
  MessageSquareWarning,
  Droplets,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useRoomStore } from '@/store/useRoomStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useRepairStore } from '@/store/useRepairStore';
import {
  calculateLifespan,
  getHeaterTypeLabel,
  getRoomStatusLabel,
  getInspectionStatusColor,
  getInspectionStatusLabel,
  getComplaintTypeLabel,
  getComplaintStatusColor,
  getComplaintStatusLabel,
  getRepairStatusColor,
  getRepairStatusLabel,
} from '@/utils/status';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRoom, deleteRoom, setRoomStatus } = useRoomStore();
  const { getInspectionsByRoom } = useInspectionStore();
  const { getComplaintsByRoom } = useComplaintStore();
  const { getRepairsByRoom } = useRepairStore();
  const [activeTab, setActiveTab] = useState<'inspections' | 'complaints' | 'repairs'>('inspections');

  const room = getRoom(id || '');
  const inspections = id ? getInspectionsByRoom(id) : [];
  const complaints = id ? getComplaintsByRoom(id) : [];
  const repairs = id ? getRepairsByRoom(id) : [];

  if (!room) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <p className="text-dark-400 mb-4">房间不存在</p>
        <Link
          to="/rooms"
          className="text-warning-400 hover:text-warning-300"
        >
          返回房间列表
        </Link>
      </div>
    );
  }

  const lifespan = calculateLifespan(room);

  const handleDelete = () => {
    if (confirm('确定要删除这个房间档案吗？')) {
      deleteRoom(room.id);
      navigate('/rooms');
    }
  };

  const handleToggleStatus = () => {
    if (room.status === 'active') {
      setRoomStatus(room.id, 'maintenance');
    } else if (room.status === 'maintenance') {
      setRoomStatus(room.id, 'active');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/rooms')}
            className="w-10 h-10 rounded-xl bg-dark-800/50 flex items-center justify-center text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{room.roomNumber} 房</h1>
            <p className="text-dark-400">{room.heaterModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStatus}
            className={cn(
              'px-4 py-2 rounded-xl font-medium transition-colors',
              room.status === 'active'
                ? 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30'
                : 'bg-success-500/20 text-success-400 hover:bg-success-500/30'
            )}
          >
            {room.status === 'active' ? '暂停上架' : '恢复上架'}
          </button>
          <Link
            to={`/rooms/${room.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-danger-500/20 text-danger-400 rounded-xl hover:bg-danger-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
            <div className="aspect-[21/9] bg-dark-800 relative">
              <img
                src={room.photoUrl}
                alt={room.roomNumber}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-3">
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
                  <span className="text-white/80 text-sm">
                    {room.floor} 层
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">设备信息</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {room.heaterType === 'gas' ? (
                      <Flame className="w-5 h-5 text-warning-400" />
                    ) : (
                      <Zap className="w-5 h-5 text-primary-400" />
                    )}
                    <span className="text-sm text-dark-400">热水器类型</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {getHeaterTypeLabel(room.heaterType)}
                  </p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-dark-400">容量</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {room.capacityLiters}L
                  </p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-success-400" />
                    <span className="text-sm text-dark-400">安装日期</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(room.installDate)}
                  </p>
                </div>
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5 text-warning-400" />
                    <span className="text-sm text-dark-400">最近保养</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(room.lastMaintenanceDate)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-dark-400">设备寿命</span>
                  <span className="text-sm font-medium text-white">
                    {lifespan.years} 年 / {room.heaterType === 'gas' ? '8' : '10'} 年
                  </span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      lifespan.level === 'critical'
                        ? 'bg-gradient-to-r from-danger-500 to-danger-400'
                        : lifespan.level === 'warning'
                        ? 'bg-gradient-to-r from-warning-500 to-warning-400'
                        : 'bg-gradient-to-r from-success-500 to-success-400'
                    )}
                    style={{ width: `${lifespan.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <StatusBadge
                    label={
                      lifespan.level === 'normal'
                        ? '状态良好'
                        : lifespan.level === 'warning'
                        ? '接近寿命'
                        : '超过寿命'
                    }
                    variant={
                      lifespan.level === 'normal'
                        ? 'success'
                        : lifespan.level === 'warning'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  />
                  <span className="text-xs text-dark-500">
                    寿命 {lifespan.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
            <div className="border-b border-dark-800">
              <div className="flex">
                {[
                  { key: 'inspections', label: '巡检记录', icon: ClipboardList, count: inspections.length },
                  { key: 'complaints', label: '投诉记录', icon: MessageSquareWarning, count: complaints.length },
                  { key: 'repairs', label: '维修记录', icon: Wrench, count: repairs.length },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={cn(
                        'flex items-center gap-2 px-6 py-4 border-b-2 transition-colors',
                        activeTab === tab.key
                          ? 'border-warning-500 text-warning-400'
                          : 'border-transparent text-dark-400 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        activeTab === tab.key
                          ? 'bg-warning-500/20 text-warning-400'
                          : 'bg-dark-700 text-dark-400'
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'inspections' && (
                <div className="space-y-3">
                  {inspections.length > 0 ? (
                    inspections.map((inspection) => (
                      <div
                        key={inspection.id}
                        className="p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">
                              {inspection.inspectionDate}
                            </span>
                            <span className="text-sm text-dark-400">
                              {inspection.inspector}
                            </span>
                          </div>
                          <StatusBadge
                            label={getInspectionStatusLabel(inspection.status)}
                            variant={
                              inspection.status === 'normal'
                                ? 'success'
                                : inspection.status === 'warning'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-dark-500">水温: </span>
                            <span className="text-dark-300">{inspection.waterTemperature}°C</span>
                          </div>
                          <div>
                            <span className="text-dark-500">出水量: </span>
                            <span className="text-dark-300">{inspection.waterFlowRate}L/min</span>
                          </div>
                          <div>
                            <span className="text-dark-500">漏水: </span>
                            <span className={inspection.hasLeak ? 'text-danger-400' : 'text-success-400'}>
                              {inspection.hasLeak ? '是' : '否'}
                            </span>
                          </div>
                        </div>
                        {inspection.notes && (
                          <p className="mt-2 text-sm text-dark-400">
                            备注: {inspection.notes}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ClipboardList className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-dark-400">暂无巡检记录</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'complaints' && (
                <div className="space-y-3">
                  {complaints.length > 0 ? (
                    complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">
                              {getComplaintTypeLabel(complaint.complaintType)}
                            </span>
                            <span className="text-sm text-dark-400">
                              {complaint.guestName}
                            </span>
                          </div>
                          <StatusBadge
                            label={getComplaintStatusLabel(complaint.status)}
                            variant={
                              complaint.status === 'pending'
                                ? 'danger'
                                : complaint.status === 'processing'
                                ? 'warning'
                                : complaint.status === 'resolved'
                                ? 'success'
                                : 'muted'
                            }
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-dark-400 mb-2">
                          订单: {complaint.orderNumber}
                        </p>
                        <p className="text-sm text-dark-300">{complaint.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquareWarning className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-dark-400">暂无投诉记录</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'repairs' && (
                <div className="space-y-3">
                  {repairs.length > 0 ? (
                    repairs.map((repair) => (
                      <div
                        key={repair.id}
                        className="p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">
                              {repair.title}
                            </span>
                          </div>
                          <StatusBadge
                            label={getRepairStatusLabel(repair.status)}
                            variant={
                              repair.status === 'completed'
                                ? 'success'
                                : repair.status === 'in_progress'
                                ? 'warning'
                                : repair.status === 'cancelled'
                                ? 'muted'
                                : 'info'
                            }
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-dark-400 mb-2">
                          <span>负责人: {repair.assignee}</span>
                          <span>计划: {repair.scheduledDate}</span>
                        </div>
                        <p className="text-sm text-dark-300">{repair.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Wrench className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                      <p className="text-dark-400">暂无维修记录</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-semibold text-white mb-4">快速操作</h3>
            <div className="space-y-3">
              <Link
                to={`/inspections/new?roomId=${room.id}`}
                className="flex items-center gap-3 p-3 bg-warning-500/10 rounded-xl text-warning-400 hover:bg-warning-500/20 transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">新增巡检</span>
              </Link>
              <Link
                to={`/complaints/new?roomId=${room.id}`}
                className="flex items-center gap-3 p-3 bg-danger-500/10 rounded-xl text-danger-400 hover:bg-danger-500/20 transition-colors"
              >
                <MessageSquareWarning className="w-5 h-5" />
                <span className="font-medium">记录投诉</span>
              </Link>
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-2xl border border-dark-800 p-6">
            <h3 className="font-semibold text-white mb-4">房间信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">房间号</span>
                <span className="text-white font-medium">{room.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">楼层</span>
                <span className="text-white font-medium">{room.floor} 层</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">设备型号</span>
                <span className="text-white font-medium">{room.heaterModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">容量</span>
                <span className="text-white font-medium">{room.capacityLiters}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">类型</span>
                <span className="text-white font-medium">
                  {getHeaterTypeLabel(room.heaterType)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">安装日期</span>
                <span className="text-white font-medium">
                  {formatDate(room.installDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">最近保养</span>
                <span className="text-white font-medium">
                  {formatDate(room.lastMaintenanceDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">创建时间</span>
                <span className="text-white font-medium">
                  {formatDate(room.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
