import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Scissors,
  Droplets,
  Armchair,
  FileText,
  Check,
  X,
  Phone,
  Star,
  Banknote,
  Sparkles,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import { StatusBadge } from "../components/StatusBadge";
import { StarRating } from "../components/StarRating";
import { formatDateTime } from "../utils/date";
import {
  serviceTypeLabels,
  serviceTypePrices,
  paymentMethodLabels,
  statusLabels,
} from "../types/appointment";
import type { AppointmentStatus } from "../types/appointment";
import { mobilityLabels } from "../types/elder";

export function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAppointment, updateStatus, loadAppointments } = useAppointmentStore();
  const { getElder, loadElders } = useElderStore();
  const { getBarber, loadBarbers } = useBarberStore();

  const appointment = id ? getAppointment(id) : undefined;
  const elder = appointment ? getElder(appointment.elderId) : undefined;
  const barber = appointment ? getBarber(appointment.barberId) : undefined;

  useEffect(() => {
    loadAppointments();
    loadElders();
    loadBarbers();
  }, [loadAppointments, loadElders, loadBarbers]);

  if (!appointment || !elder) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  const canConfirm = appointment.status === "pending";
  const canDepart = appointment.status === "confirmed";
  const canStartService = appointment.status === "departed";
  const canComplete = appointment.status === "in_progress";
  const canCancel = ["pending", "confirmed", "departed"].includes(appointment.status);

  const handleStatusChange = (status: AppointmentStatus) => {
    if (id) {
      updateStatus(id, status);
    }
  };

  const totalPrice =
    serviceTypePrices[appointment.serviceType] +
    (appointment.needsShampoo ? 10 : 0);

  const nextActions: Array<{
    status: AppointmentStatus;
    label: string;
    icon: any;
    className: string;
    onClick?: () => void;
    to?: string;
  }> = [];

  if (canConfirm) {
    nextActions.push({
      status: "confirmed",
      label: "确认预约",
      icon: Check,
      className: "bg-success-500 hover:bg-success-600 text-white",
      onClick: () => handleStatusChange("confirmed"),
    });
  }

  if (canDepart) {
    nextActions.push({
      status: "departed",
      label: "出发确认",
      icon: Sparkles,
      className: "bg-primary-500 hover:bg-primary-600 text-white",
      to: `/appointments/${id}/confirm-departure`,
    });
  }

  if (canStartService) {
    nextActions.push({
      status: "in_progress",
      label: "开始服务",
      icon: Scissors,
      className: "bg-primary-500 hover:bg-primary-600 text-white",
      onClick: () => handleStatusChange("in_progress"),
    });
  }

  if (canComplete) {
    nextActions.push({
      status: "completed",
      label: "完成服务",
      icon: Check,
      className: "bg-success-500 hover:bg-success-600 text-white",
      to: `/appointments/${id}/complete`,
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回列表
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">预约详情</h1>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="text-gray-500 mt-1">
              预约编号：{appointment.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canCancel && (
              <button
                onClick={() => handleStatusChange("cancelled")}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
                取消预约
              </button>
            )}
            {nextActions.map((action) =>
              action.to ? (
                <Link
                  key={action.status}
                  to={action.to}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${action.className}`}
                >
                  <action.icon size={18} />
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.status}
                  onClick={action.onClick}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${action.className}`}
                >
                  <action.icon size={18} />
                  {action.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <User size={20} className="text-primary-500" />
              老人信息
            </h2>
            <Link
              to={`/elders/${elder.id}`}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-100 overflow-hidden">
                {elder.photo ? (
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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-lg">
                    {elder.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {elder.gender === "male" ? "男" : "女"} · {elder.age}岁
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
                    {mobilityLabels[elder.mobility]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <MapPin size={14} />
                  {elder.address}
                </div>
              </div>
              <span className="text-primary-600 text-sm">查看档案 →</span>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600">{elder.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-600">{elder.contactName}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <Scissors size={20} className="text-primary-500" />
              服务信息
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Scissors size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {serviceTypeLabels[appointment.serviceType]}
                    </p>
                    <p className="text-sm text-gray-500">服务项目</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-primary-600">
                  ¥{serviceTypePrices[appointment.serviceType]}
                </span>
              </div>

              {appointment.needsShampoo && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Droplets size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">洗发服务</p>
                      <p className="text-sm text-gray-500">加洗</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-blue-600">
                    +¥10
                  </span>
                </div>
              )}

              {appointment.needsWheelchair && (
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Armchair size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">需要轮椅位</p>
                    <p className="text-sm text-gray-500">特殊需求</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">服务合计</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ¥{totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-primary-500" />
                备注
              </h2>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <Calendar size={20} className="text-primary-500" />
              时间安排
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={18} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {formatDateTime(appointment.scheduledTime)}
                  </p>
                  <p className="text-sm text-gray-500">预约时间</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
              <User size={20} className="text-primary-500" />
              理发师
            </h2>
            {barber ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                  {barber.avatar ? (
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Scissors size={26} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{barber.name}</p>
                  <p className="text-sm text-gray-500">{barber.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-warning-500 fill-warning-500" />
                    <span className="text-sm text-gray-600">
                      {barber.rating}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">未分配理发师</p>
            )}
          </div>

          {appointment.status === "completed" && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-5">
                <Check size={20} className="text-success-500" />
                服务结果
              </h2>
              <div className="space-y-4">
                {appointment.hairstylePhoto && (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={appointment.hairstylePhoto}
                      alt="发型照片"
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">实际费用</span>
                  <span className="text-lg font-semibold text-primary-600">
                    ¥{appointment.fee || totalPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">满意度</span>
                  <StarRating value={appointment.satisfaction} readonly size="sm" />
                </div>
                {appointment.paymentMethod && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">收款方式</span>
                    <span className="text-gray-800 flex items-center gap-1">
                      <Banknote size={16} />
                      {paymentMethodLabels[appointment.paymentMethod]}
                    </span>
                  </div>
                )}
                {appointment.nextSuggestedTime && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">下次建议时间</p>
                    <p className="text-gray-800 font-medium">
                      {formatDateTime(appointment.nextSuggestedTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
