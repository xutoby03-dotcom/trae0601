import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  Clock,
  User,
  Scissors,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useAppointmentStore } from "../store/useAppointmentStore";
import { useElderStore } from "../store/useElderStore";
import { useBarberStore } from "../store/useBarberStore";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate, formatTime } from "../utils/date";
import {
  statusLabels,
  serviceTypeLabels,
} from "../types/appointment";
import type { AppointmentStatus } from "../types/appointment";

export function AppointmentList() {
  const navigate = useNavigate();
  const { appointments, loadAppointments } = useAppointmentStore();
  const { elders, loadElders, getElder } = useElderStore();
  const { barbers, loadBarbers, getBarber } = useBarberStore();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadAppointments();
    loadElders();
    loadBarbers();
  }, [loadAppointments, loadElders, loadBarbers]);

  const filteredAppointments = [...appointments]
    .filter((apt) =>
      statusFilter === "all" ? true : apt.status === statusFilter
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledTime).getTime() -
        new Date(a.scheduledTime).getTime()
    );

  const statusOptions: Array<{ value: AppointmentStatus | "all"; label: string }> = [
    { value: "all", label: "全部" },
    { value: "pending", label: "待确认" },
    { value: "confirmed", label: "已确认" },
    { value: "departed", label: "已出发" },
    { value: "in_progress", label: "服务中" },
    { value: "completed", label: "已完成" },
    { value: "cancelled", label: "已取消" },
    { value: "overdue", label: "超时未到" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">预约管理</h1>
          <p className="text-gray-500 mt-1">管理所有理发预约</p>
        </div>
        <button
          onClick={() => navigate("/appointments/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          新建预约
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">筛选状态：</span>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {statusFilter === "all"
                  ? "全部"
                  : statusLabels[statusFilter as AppointmentStatus]}
                <ChevronDown size={16} />
              </button>
              {showFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 w-40">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setShowFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        statusFilter === opt.value
                          ? "text-primary-600 bg-primary-50"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            共 {filteredAppointments.length} 条预约
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                预约时间
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                老人信息
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                理发师
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                服务项目
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                状态
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAppointments.map((apt) => {
              const elder = getElder(apt.elderId);
              const barber = getBarber(apt.barberId);

              return (
                <tr
                  key={apt.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/appointments/${apt.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Calendar size={18} className="text-primary-500" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">
                          {formatDate(apt.scheduledTime)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(apt.scheduledTime)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 overflow-hidden">
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
                      <div>
                        <p className="text-gray-800 font-medium">
                          {elder?.name || "未知"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {elder?.address || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                        {barber?.avatar ? (
                          <img
                            src={barber.avatar}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Scissors size={14} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700">{barber?.name || "未分配"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">
                      {serviceTypeLabels[apt.serviceType]}
                    </span>
                    {(apt.needsShampoo || apt.needsWheelchair) && (
                      <div className="flex gap-1 mt-1">
                        {apt.needsShampoo && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                            洗发
                          </span>
                        )}
                        {apt.needsWheelchair && (
                          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                            轮椅位
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/appointments/${apt.id}`);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">暂无预约记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
