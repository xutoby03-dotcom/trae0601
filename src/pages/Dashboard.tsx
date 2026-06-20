import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  User,
  MapPin,
  ChevronRight,
  Scissors,
  Plus,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Users,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import { StatusBadge } from "../components/StatusBadge";
import { formatTime, formatDate } from "../utils/date";
import {
  serviceTypeLabels,
  statusLabels,
} from "../types/appointment";
import type { AppointmentStatus, Appointment } from "../types/appointment";

interface StatCardProps {
  title: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

function StatCard({ title, count, icon: Icon, color, bgColor, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${bgColor} rounded-2xl p-5 cursor-pointer hover:shadow-card-hover transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{count}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );
}

interface BoardColumnProps {
  title: string;
  status: AppointmentStatus;
  appointments: Appointment[];
  color: string;
  bgColor: string;
  onCardClick: (id: string) => void;
  getElder: (id: string) => any;
  getBarber: (id: string) => any;
}

function BoardColumn({
  title,
  appointments,
  color,
  bgColor,
  onCardClick,
  getElder,
  getBarber,
}: BoardColumnProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card flex flex-col flex-1 min-w-0">
      <div className={`${bgColor} rounded-t-2xl px-5 py-4`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${color}`}>{title}</h3>
          <span className={`text-sm font-medium ${color} bg-white/70 px-2.5 py-0.5 rounded-full`}>
            {appointments.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[500px]">
        {appointments.map((apt) => {
          const elder = getElder(apt.elderId);
          const barber = getBarber(apt.barberId);

          return (
            <div
              key={apt.id}
              onClick={() => onCardClick(apt.id)}
              className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 hover:shadow-card transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-sm">
                  {elder?.photo ? (
                    <img
                      src={elder.photo}
                      alt={elder.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <User size={18} className="text-primary-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {elder?.name || "未知"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Clock size={12} />
                    <span>{formatTime(apt.scheduledTime)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Scissors size={12} />
                    {serviceTypeLabels[apt.serviceType]}
                  </span>
                  {barber && (
                    <span className="text-xs text-gray-500">
                      {barber.name}
                    </span>
                  )}
                </div>
                {(apt.needsWheelchair || apt.needsCompanion) && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {apt.needsWheelchair && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                        需轮椅位
                      </span>
                    )}
                    {apt.needsCompanion && (
                      <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full flex items-center gap-1">
                        <Users size={10} />
                        家属陪同
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无记录
          </div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const {
    appointments,
    getTodayAppointments,
    getPendingAppointments,
    getOverdueAppointments,
    getRecallReminders,
    getAppointmentsByStatus,
    loadAppointments,
  } = useAppointmentStore();
  const { getElder, loadElders } = useElderStore();
  const { getBarber, loadBarbers } = useBarberStore();

  useEffect(() => {
    loadAppointments();
    loadElders();
    loadBarbers();
  }, [loadAppointments, loadElders, loadBarbers]);

  const todayAppointments = getTodayAppointments();
  const pendingAppointments = getPendingAppointments();
  const overdueAppointments = getOverdueAppointments();
  const recallReminders = getRecallReminders();

  const specialNeedsCount = appointments.filter(
    (a) =>
      a.needsWheelchair &&
      a.status !== "completed" &&
      a.status !== "cancelled"
  ).length;

  const boardColumns: Array<{
    title: string;
    status: AppointmentStatus;
    color: string;
    bgColor: string;
  }> = [
    {
      title: "待确认",
      status: "pending",
      color: "text-warning-600",
      bgColor: "bg-warning-50",
    },
    {
      title: "已确认",
      status: "confirmed",
      color: "text-info-600",
      bgColor: "bg-info-50",
    },
    {
      title: "已出发",
      status: "departed",
      color: "text-primary-600",
      bgColor: "bg-primary-50",
    },
    {
      title: "服务中",
      status: "in_progress",
      color: "text-primary-700",
      bgColor: "bg-primary-100",
    },
    {
      title: "已完成",
      status: "completed",
      color: "text-success-600",
      bgColor: "bg-success-50",
    },
  ];

  const handleCardClick = (id: string) => {
    navigate(`/appointments/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据看板</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/appointments/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          新建预约
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="今日上门"
          count={todayAppointments.length}
          icon={Calendar}
          color="text-primary-600"
          bgColor="bg-primary-50"
          onClick={() => navigate("/appointments")}
        />
        <StatCard
          title="待确认"
          count={pendingAppointments.length}
          icon={Clock}
          color="text-warning-600"
          bgColor="bg-warning-50"
          onClick={() => navigate("/appointments")}
        />
        <StatCard
          title="特殊需求"
          count={specialNeedsCount}
          icon={AlertTriangle}
          color="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => navigate("/appointments")}
        />
        <StatCard
          title="超时未到"
          count={overdueAppointments.length}
          icon={Bell}
          color="text-danger-600"
          bgColor="bg-danger-50"
          onClick={() => navigate("/appointments")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles size={20} className="text-primary-500" />
                预约看板
              </h2>
              <button
                onClick={() => navigate("/appointments")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                查看全部
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {boardColumns.map((col) => (
                <BoardColumn
                  key={col.status}
                  title={col.title}
                  status={col.status}
                  appointments={getAppointmentsByStatus(col.status).slice(0, 3)}
                  color={col.color}
                  bgColor={col.bgColor}
                  onCardClick={handleCardClick}
                  getElder={getElder}
                  getBarber={getBarber}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <RotateCcw size={20} className="text-primary-500" />
              常客复约提醒
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recallReminders.length > 0 ? (
                recallReminders.slice(0, 5).map((apt) => {
                  const elder = getElder(apt.elderId);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleCardClick(apt.id)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden flex-shrink-0">
                        {elder?.photo ? (
                          <img
                            src={elder.photo}
                            alt={elder.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={18} className="text-primary-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {elder?.name || "未知"}
                        </p>
                        <p className="text-xs text-gray-500">
                          上次：{formatDate(apt.scheduledTime)}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs px-2 py-1 bg-danger-50 text-danger-600 rounded-full">
                          需复约
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto text-success-300 mb-2" size={36} />
                  <p className="text-sm text-gray-400">暂无复约提醒</p>
                </div>
              )}
            </div>

            {recallReminders.length > 5 && (
              <button
                onClick={() => navigate("/appointments")}
                className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                查看全部 ({recallReminders.length})
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-2">快捷操作</h3>
            <p className="text-primary-100 text-sm mb-4">
              快速创建新的理发预约
            </p>
            <button
              onClick={() => navigate("/appointments/new")}
              className="w-full py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              立即预约
            </button>
          </div>
        </div>
      </div>

      {overdueAppointments.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-danger-500" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-danger-700">
                超时未到提醒
              </h3>
              <p className="text-sm text-danger-600 mt-1">
                有 {overdueAppointments.length} 个预约已超时30分钟未到，请及时联系确认
              </p>
            </div>
            <button
              onClick={() => navigate("/appointments")}
              className="text-sm text-danger-600 hover:text-danger-700 font-medium flex items-center gap-1"
            >
              查看详情
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
