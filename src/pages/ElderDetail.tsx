import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  User,
  MapPin,
  Phone,
  Heart,
  Scissors,
  FileText,
  Clock,
  Calendar,
} from "lucide-react";
import { useElderStore } from "../store/useElderStore";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useBarberStore } from "../store/useBarberStore";
import { mobilityLabels, genderLabels } from "../types/elder";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime, formatDate } from "../utils/date";
import { serviceTypeLabels } from "../types/appointment";

export function ElderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getElder, loadElders, loading } = useElderStore();
  const { getAppointmentsByElder, loadAppointments } = useAppointmentStore();
  const { getBarber, loadBarbers } = useBarberStore();

  const elder = id ? getElder(id) : undefined;
  const appointments = id ? getAppointmentsByElder(id) : [];

  useEffect(() => {
    loadElders();
    loadAppointments();
    loadBarbers();
  }, [loadElders, loadAppointments, loadBarbers]);

  if (loading || !elder) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/elders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          返回列表
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-24"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg flex-shrink-0">
              {elder.photo ? (
                <img
                  src={elder.photo}
                  alt={elder.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100">
                  <User className="text-primary-400" size={40} />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-bold text-gray-800">{elder.name}</h1>
              <p className="text-gray-500 mt-1">
                {genderLabels[elder.gender]} · {elder.age}岁
              </p>
            </div>
            <div className="pb-2">
              <button
                onClick={() => navigate(`/elders/${elder.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Edit size={18} />
                编辑档案
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-primary-500" />
            基本信息
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">地址</p>
                <p className="text-gray-800 font-medium">{elder.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">行动情况</p>
                <p className="text-gray-800 font-medium">
                  {mobilityLabels[elder.mobility]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-danger-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-danger-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">过敏史</p>
                <p className="text-gray-800 font-medium">
                  {elder.allergies || "无"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Scissors size={18} className="text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">常用发型</p>
                <p className="text-gray-800 font-medium">
                  {elder.usualHairstyle || "未设置"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Phone size={20} className="text-primary-500" />
              紧急联系人
            </h2>
            <div className="bg-primary-50 rounded-xl p-4">
              <p className="text-gray-800 font-medium">{elder.contactName}</p>
              <p className="text-primary-600 font-medium text-lg mt-1">
                {elder.contactPhone}
              </p>
            </div>
          </div>

          {elder.notes && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-primary-500" />
                备注
              </h2>
              <p className="text-gray-600">{elder.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" />
            历史预约记录
          </h2>
          <button
            onClick={() =>
              navigate("/appointments/new", { state: { elderId: elder.id } })
            }
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + 新建预约
          </button>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => {
              const barber = getBarber(apt.barberId);
              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <Clock size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">
                        {serviceTypeLabels[apt.serviceType]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(apt.scheduledTime)} · {barber?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={apt.status} />
                    <Link
                      to={`/appointments/${apt.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无预约记录
          </div>
        )}
      </div>
    </div>
  );
}
