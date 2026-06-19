import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MessageSquareWarning,
  Wrench,
  AlertTriangle,
  ChevronRight,
  Thermometer,
  Droplets,
  Zap,
  Flame,
  Clock,
  CheckCircle2,
  Play,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard/StatsCard';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { useRoomStore } from '@/store/useRoomStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useRepairStore } from '@/store/useRepairStore';
import {
  calculateLifespan,
  getComplaintTypeLabel,
  getComplaintStatusColor,
  getComplaintStatusLabel,
  getHeaterTypeLabel,
  getRepairStatusColor,
  getRepairStatusLabel,
  isPeakSeasonCheck,
} from '@/utils/status';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { rooms } = useRoomStore();
  const { inspections } = useInspectionStore();
  const { complaints, getRecentComplaints } = useComplaintStore();
  const { repairs, getActiveRepairs } = useRepairStore();

  const recentComplaints = useMemo(() => getRecentComplaints(7), [getRecentComplaints]);
  const activeRepairs = useMemo(() => getActiveRepairs(), [getActiveRepairs]);

  const pendingInspectionRooms = useMemo(() => {
    const today = formatDate(new Date());
    const inspectedToday = new Set(
      inspections
        .filter((i) => i.inspectionDate === today)
        .map((i) => i.roomId)
    );
    return rooms.filter(
      (r) => r.status === 'active' && !inspectedToday.has(r.id)
    );
  }, [rooms, inspections]);

  const lifespanWarnings = useMemo(() => {
    return rooms
      .map((room) => ({
        room,
        lifespan: calculateLifespan(room),
      }))
      .filter((item) => item.lifespan.level !== 'normal')
      .sort((a, b) => b.lifespan.percentage - a.lifespan.percentage)
      .slice(0, 5);
  }, [rooms]);

  const peakSeasonChecklist = useMemo(() => {
    const roomRepairMap = new Map<string, string>();
    repairs.forEach((repair) => {
      if (repair.status === 'completed' && repair.completedDate) {
        roomRepairMap.set(repair.roomId, repair.completedDate);
      }
    });

    const roomComplaintMap = new Map<string, number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    complaints
      .filter((c) => new Date(c.complaintDate) >= thirtyDaysAgo)
      .forEach((c) => {
        roomComplaintMap.set(c.roomId, (roomComplaintMap.get(c.roomId) || 0) + 1);
      });

    return rooms
      .filter((room) => {
        const lastRepairDate = roomRepairMap.get(room.id);
        const recentComplaintCount = roomComplaintMap.get(room.id) || 0;
        return isPeakSeasonCheck(room, lastRepairDate, recentComplaintCount);
      })
      .slice(0, 6);
  }, [rooms, repairs, complaints]);

  const complaintIconMap = {
    not_hot: Thermometer,
    unstable: Droplets,
    tripping: Zap,
    other: Flame,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">设备巡检看板</h1>
        <p className="text-dark-400 mt-1">实时监控所有热水器设备状态</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="待巡检房间"
          value={pendingInspectionRooms.length}
          icon={ClipboardList}
          color="orange"
          trend={{ value: 12, label: '较昨日', direction: 'up' }}
        />
        <StatsCard
          title="近7天投诉"
          value={recentComplaints.length}
          icon={MessageSquareWarning}
          color="red"
          trend={{ value: 8, label: '较上周', direction: 'down' }}
        />
        <StatsCard
          title="设备预警"
          value={lifespanWarnings.length}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="进行中维修"
          value={activeRepairs.length}
          icon={Wrench}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">待巡检房间</h2>
              <p className="text-sm text-dark-400">今日需完成保洁后巡检</p>
            </div>
            <Link
              to="/inspections"
              className="text-sm text-warning-400 hover:text-warning-300 flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-dark-800 max-h-96 overflow-y-auto">
            {pendingInspectionRooms.length > 0 ? (
              pendingInspectionRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-warning-500/10 rounded-xl flex items-center justify-center">
                      <span className="text-warning-400 font-bold">{room.floor}F</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{room.roomNumber} 房</p>
                      <p className="text-sm text-dark-400">
                        {getHeaterTypeLabel(room.heaterType)} · {room.capacityLiters}L
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/inspections/new?roomId=${room.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-warning-500 text-white rounded-lg text-sm font-medium hover:bg-warning-600 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    开始巡检
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-3" />
                <p className="text-dark-400">所有房间已完成今日巡检</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">近期投诉</h2>
              <p className="text-sm text-dark-400">最近7天客人反馈</p>
            </div>
            <Link
              to="/complaints"
              className="text-sm text-warning-400 hover:text-warning-300 flex items-center gap-1"
            >
              全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint, index) => {
                const Icon = complaintIconMap[complaint.complaintType];
                const room = rooms.find((r) => r.id === complaint.roomId);
                return (
                  <div
                    key={complaint.id}
                    className="p-4 bg-dark-800/30 rounded-xl hover:bg-dark-800/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-danger-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-5 h-5 text-danger-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {getComplaintTypeLabel(complaint.complaintType)}
                            </span>
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
                          <p className="text-sm text-dark-400 mt-1">
                            {room?.roomNumber}房 · {complaint.guestName}
                          </p>
                          <p className="text-xs text-dark-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {complaint.complaintDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                <p className="text-dark-400 text-sm">近期无投诉</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">设备寿命预警</h2>
              <p className="text-sm text-dark-400">接近或超过使用年限的设备</p>
            </div>
            <Link
              to="/rooms"
              className="text-sm text-warning-400 hover:text-warning-300 flex items-center gap-1"
            >
              查看档案 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {lifespanWarnings.length > 0 ? (
              lifespanWarnings.map((item, index) => (
                <div
                  key={item.room.id}
                  className="p-4 bg-dark-800/30 rounded-xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-white">
                        {item.room.roomNumber} 房
                      </p>
                      <p className="text-sm text-dark-400">{item.room.heaterModel}</p>
                    </div>
                    <StatusBadge
                      label={`${item.lifespan.years}年`}
                      variant={
                        item.lifespan.level === 'critical' ? 'danger' : 'warning'
                      }
                    />
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        item.lifespan.level === 'critical'
                          ? 'bg-gradient-to-r from-danger-500 to-danger-400'
                          : 'bg-gradient-to-r from-warning-500 to-warning-400'
                      )}
                      style={{ width: `${item.lifespan.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-dark-500">
                    <span>已使用 {item.lifespan.years} 年</span>
                    <span>
                      寿命 {item.lifespan.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                <p className="text-dark-400 text-sm">所有设备状态良好</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">维修进度</h2>
              <p className="text-sm text-dark-400">当前进行中的维修任务</p>
            </div>
            <Link
              to="/repairs"
              className="text-sm text-warning-400 hover:text-warning-300 flex items-center gap-1"
            >
              全部维修 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {activeRepairs.length > 0 ? (
              activeRepairs.map((repair, index) => {
                const room = rooms.find((r) => r.id === repair.roomId);
                const progressMap = {
                  pending: 10,
                  assigned: 30,
                  in_progress: 60,
                  completed: 100,
                  cancelled: 0,
                };
                return (
                  <div
                    key={repair.id}
                    className="p-4 bg-dark-800/30 rounded-xl"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-white">{repair.title}</p>
                        <p className="text-sm text-dark-400">
                          {room?.roomNumber}房 · {repair.assignee}
                        </p>
                      </div>
                      <StatusBadge
                        label={getRepairStatusLabel(repair.status)}
                        variant={
                          repair.status === 'in_progress'
                            ? 'warning'
                            : repair.status === 'completed'
                            ? 'success'
                            : 'info'
                        }
                        size="sm"
                      />
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressMap[repair.status]}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-dark-500">
                      <span>计划日期: {repair.scheduledDate}</span>
                      <span>{progressMap[repair.status]}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                <p className="text-dark-400 text-sm">暂无进行中的维修</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-dark-900/50 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white">旺季前必查清单</h2>
          <p className="text-sm text-dark-400">需要重点关注的设备，建议旺季前全面检修</p>
        </div>
        <div className="p-6">
          {peakSeasonChecklist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {peakSeasonChecklist.map((room, index) => {
                const lifespan = calculateLifespan(room);
                return (
                  <div
                    key={room.id}
                    className="p-4 bg-dark-800/30 rounded-xl border border-warning-500/20 hover:border-warning-500/40 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-warning-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{room.roomNumber} 房</p>
                          <span className="text-xs text-dark-400">{room.floor}F</span>
                        </div>
                        <p className="text-sm text-dark-400 truncate">
                          {room.heaterModel}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-dark-500">
                            已使用 {lifespan.years}年
                          </span>
                          {lifespan.level !== 'normal' && (
                            <StatusBadge
                              label={
                                lifespan.level === 'critical' ? '高龄预警' : '注意'
                              }
                              variant={
                                lifespan.level === 'critical' ? 'danger' : 'warning'
                              }
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
              <p className="text-dark-400">所有设备状态良好，无需重点关注</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
