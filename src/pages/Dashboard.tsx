import { useEffect, useState } from "react";
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
  X,
  Phone,
  Heart,
  Droplets,
  Armchair,
  FileText,
  Check,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Camera,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import { StatusBadge } from "../components/StatusBadge";
import { StarRating } from "../components/StarRating";
import { formatTime, formatDate, formatDateTime } from "../utils/date";
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
  onCardClick: (apt: Appointment) => void;
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
          const hasSpecialNeeds =
            apt.needsWheelchair || apt.needsCompanion || apt.needsShampoo;

          return (
            <div
              key={apt.id}
              onClick={() => onCardClick(apt)}
              className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 hover:shadow-card transition-all relative"
            >
              {hasSpecialNeeds && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
              )}
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
                <div className="flex-1 min-w-0 pr-2">
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

interface QuickDrawerProps {
  appointment: Appointment | null;
  onClose: () => void;
  getElder: (id: string) => any;
  getBarber: (id: string) => any;
  onConfirmAppointment: (id: string) => void;
  navigate: (path: string, state?: any) => void;
}

function QuickDrawer({
  appointment,
  onClose,
  getElder,
  getBarber,
  onConfirmAppointment,
  navigate,
}: QuickDrawerProps) {
  if (!appointment) return null;

  const elder = getElder(appointment.elderId);
  const barber = getBarber(appointment.barberId);

  const showConfirmBtn = appointment.status === "pending";
  const showDepartureBtn = appointment.status === "confirmed";
  const showStartBtn = appointment.status === "departed";
  const showCompleteBtn = appointment.status === "in_progress";
  const showRecallBtn = appointment.status === "completed";

  const hasSpecialNeeds =
    appointment.needsShampoo ||
    appointment.needsWheelchair ||
    appointment.needsCompanion;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 overflow-hidden flex-shrink-0">
              {elder?.photo ? (
                <img
                  src={elder.photo}
                  alt={elder.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={26} className="text-primary-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                  {elder?.name || "未知"}
                </h2>
                {elder && (
                  <span className="text-sm text-gray-500">
                    {elder.age}岁
                  </span>
                )}
              </div>
              <div className="mt-1">
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                预约信息
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">预约时间</p>
                    <p className="font-medium text-gray-800">
                      {formatDateTime(appointment.scheduledTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Scissors size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">服务项目</p>
                    <p className="font-medium text-gray-800">
                      {serviceTypeLabels[appointment.serviceType]}
                    </p>
                  </div>
                </div>
                {barber && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User size={18} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">理发师</p>
                      <p className="font-medium text-gray-800">
                        {barber.name}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">地址</p>
                    <p className="font-medium text-gray-800">
                      {elder?.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                特殊需求
              </h3>
              {hasSpecialNeeds ? (
                <div className="grid grid-cols-1 gap-2">
                  {appointment.needsShampoo && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Droplets size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          需要洗发
                        </p>
                      </div>
                      <Check
                        size={18}
                        className="ml-auto text-blue-500"
                      />
                    </div>
                  )}
                  {appointment.needsWheelchair && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Armchair size={16} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          需要轮椅位
                        </p>
                      </div>
                      <Check
                        size={18}
                        className="ml-auto text-purple-500"
                      />
                    </div>
                  )}
                  {appointment.needsCompanion && (
                    <div className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl border border-warning-200">
                      <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                        <Users size={16} className="text-warning-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          家属陪同
                        </p>
                        <p className="text-xs text-warning-700">
                          请确认家属在场
                        </p>
                      </div>
                      <AlertTriangle
                        size={18}
                        className="ml-auto text-warning-500"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
                  无特殊需求
                </div>
              )}
            </div>

            {appointment.status === "completed" &&
              (appointment.fee > 0 ||
                appointment.satisfaction > 0 ||
                appointment.hairstylePhoto ||
                appointment.nextSuggestedTime) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    上次服务记录
                  </h3>
                  <div className="space-y-3">
                    {appointment.hairstylePhoto && (
                      <div className="rounded-xl overflow-hidden">
                        <img
                          src={appointment.hairstylePhoto}
                          alt="上次发型"
                          className="w-full h-40 object-cover"
                        />
                        <div className="bg-gray-50 px-3 py-2 flex items-center gap-2">
                          <Camera size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            上次发型照片
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {appointment.fee > 0 && (
                        <div className="p-3 bg-primary-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign
                              size={14}
                              className="text-primary-500"
                            />
                            <span className="text-xs text-primary-600">
                              服务费用
                            </span>
                          </div>
                          <p className="text-xl font-bold text-primary-600">
                            ¥{appointment.fee}
                          </p>
                        </div>
                      )}
                      {appointment.satisfaction > 0 && (
                        <div className="p-3 bg-warning-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating
                              value={appointment.satisfaction}
                              readonly
                              size="sm"
                            />
                          </div>
                          <p className="text-sm text-warning-700 font-medium">
                            {appointment.satisfaction === 5
                              ? "非常满意"
                              : appointment.satisfaction >= 4
                              ? "比较满意"
                              : appointment.satisfaction >= 3
                              ? "一般"
                              : "不太满意"}
                          </p>
                        </div>
                      )}
                    </div>

                    {appointment.nextSuggestedTime && (
                      <div className="flex items-center gap-3 p-3 bg-danger-50 rounded-xl border border-danger-200">
                        <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar
                            size={16}
                            className="text-danger-500"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-danger-600">
                            建议下次时间
                          </p>
                          <p className="font-medium text-gray-800">
                            {formatDate(appointment.nextSuggestedTime)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-danger-100 text-danger-600 rounded-full font-medium">
                          需复约
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                老人档案
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-danger-50 rounded-xl">
                  <div className="w-9 h-9 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-danger-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-danger-600">过敏史</p>
                    <p className="font-medium text-gray-800 mt-0.5">
                      {elder?.allergies || "无"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-600">紧急联系人</p>
                    <p className="font-medium text-gray-800 mt-0.5">
                      {elder?.contactName}
                    </p>
                    <p className="text-xl font-bold text-blue-600 mt-1 tracking-wider">
                      {elder?.contactPhone}
                    </p>
                  </div>
                  <a
                    href={`tel:${elder?.contactPhone}`}
                    className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors flex-shrink-0 self-center"
                  >
                    <Phone size={18} />
                  </a>
                </div>

                {elder?.notes && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">备注</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {elder.notes}
                      </p>
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">预约备注</p>
                      <p className="font-medium text-gray-800 mt-0.5">
                        {appointment.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white space-y-3">
          {showConfirmBtn && (
            <button
              onClick={() => {
                onConfirmAppointment(appointment.id);
              }}
              className="w-full py-3.5 bg-success-500 text-white rounded-xl font-semibold hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              确认预约
            </button>
          )}
          {showDepartureBtn && (
            <button
              onClick={() =>
                navigate(`/appointments/${appointment.id}/confirm-departure`)
              }
              className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              出发确认（工具检查）
            </button>
          )}
          {showStartBtn && (
            <button
              onClick={() => {
                onConfirmAppointment(appointment.id);
                onClose();
              }}
              className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Scissors size={20} />
              开始服务
            </button>
          )}
          {showCompleteBtn && (
            <button
              onClick={() =>
                navigate(`/appointments/${appointment.id}/complete`)
              }
              className="w-full py-3.5 bg-success-500 text-white rounded-xl font-semibold hover:bg-success-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              完成服务（记录结果）
            </button>
          )}
          {showRecallBtn && (
            <button
              onClick={() => {
                onClose();
                navigate("/appointments/new", {
                  state: {
                    elderId: appointment.elderId,
                    fromAppointmentId: appointment.id,
                  },
                });
              }}
              className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              立即复约
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              navigate(`/appointments/${appointment.id}`);
            }}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            查看完整详情
          </button>
        </div>
      </div>
    </>
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
    updateStatus,
  } = useAppointmentStore();
  const { getElder, loadElders } = useElderStore();
  const { getBarber, loadBarbers } = useBarberStore();

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

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
      (a.needsWheelchair || a.needsCompanion) &&
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

  const handleCardClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
  };

  const handleConfirmAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    let newStatus = apt.status;
    if (apt.status === "pending") newStatus = "confirmed";
    else if (apt.status === "departed") newStatus = "in_progress";

    if (newStatus !== apt.status) {
      updateStatus(id, newStatus);
      setSelectedAppointment({ ...apt, status: newStatus });
    }
  };

  const handleRecall = (apt: Appointment) => {
    navigate("/appointments/new", {
      state: {
        elderId: apt.elderId,
        fromAppointmentId: apt.id,
      },
    });
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
                <span className="text-xs font-normal text-gray-400 ml-2">
                  点击卡片查看详情
                </span>
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
                  const todayStr = new Date().toISOString().split("T")[0];
                  const nextDateStr = apt.nextSuggestedTime
                    ? apt.nextSuggestedTime.split("T")[0]
                    : null;
                  const isToday = nextDateStr === todayStr;
                  const daysOverdue = nextDateStr
                    ? Math.floor(
                        (new Date(todayStr).getTime() -
                          new Date(nextDateStr).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleCardClick(apt)}
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
                        <p
                          className={`text-xs ${
                            isToday ? "text-primary-600 font-medium" : "text-danger-500"
                          }`}
                        >
                          {apt.nextSuggestedTime
                            ? isToday
                              ? "今天到期 · 建议复约"
                              : `已过 ${daysOverdue} 天 · ${formatDate(apt.nextSuggestedTime)}`
                            : "需复约"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecall(apt);
                        }}
                        className="flex-shrink-0 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        复约
                      </button>
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

      <QuickDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        getElder={getElder}
        getBarber={getBarber}
        onConfirmAppointment={handleConfirmAppointment}
        navigate={navigate}
      />

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
