import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import {
  Sun,
  Wrench,
  ShoppingCart,
  Ban,
  Plus,
  CalendarDays,
  PackageCheck,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { formatDate, formatRelative } from "@/utils/format";

const TRIP_STATUS_LABEL: Record<string, { name: string; color: string }> = {
  planning: { name: "规划中", color: "text-amber-700 bg-amber-100" },
  ongoing: { name: "进行中", color: "text-sky2-700 bg-sky2-100" },
  completed: { name: "已完成", color: "text-forest-700 bg-forest-100" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    equipment,
    trips,
    dryingRecords,
    maintenance,
    getEquipment,
  } = useStore();

  const activeDrying = dryingRecords.filter((d) => d.status === "drying");
  const pendingRepairs = maintenance.filter(
    (m) => m.type === "repair" && m.status !== "completed"
  );
  const pendingPurchases = maintenance.filter(
    (m) => m.type === "purchase" && m.status !== "completed"
  );
  const unavailableEquip = equipment.filter((e) => e.status !== "available");

  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

  const today = new Date();
  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekDay = weekDays[today.getDay()];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl text-forest-900">欢迎回来，露营达人</h1>
          <p className="text-forest-600 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {todayStr} {weekDay}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/drying")}
          className="card card-hover cursor-pointer animate-fade-in-up p-5 bg-gradient-to-br from-sky2-50 to-white border-sky2-100"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-sky2-100 flex items-center justify-center">
              <Sun className="w-6 h-6 text-sky2-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-sky2-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-sky2-700">{activeDrying.length}</div>
            <div className="text-sky2-600 font-medium mt-1">待晾晒装备</div>
          </div>
          <div className="mt-3 space-y-1">
            {activeDrying.slice(0, 3).map((d) => {
              const eq = getEquipment(d.equipmentId);
              return (
                <div key={d.id} className="text-sm text-sky2-700/80 truncate">
                  • {eq?.name || "未知装备"}
                </div>
              );
            })}
            {activeDrying.length > 3 && (
              <div className="text-sm text-sky2-500">还有 {activeDrying.length - 3} 件...</div>
            )}
          </div>
        </div>

        <div
          onClick={() => navigate("/maintenance")}
          className="card card-hover cursor-pointer animate-fade-in-up p-5 bg-gradient-to-br from-red-50 to-white border-red-100"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-red-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-red-700">{pendingRepairs.length}</div>
            <div className="text-red-600 font-medium mt-1">待维修</div>
          </div>
          <div className="mt-3 space-y-1">
            {pendingRepairs.slice(0, 3).map((m) => {
              const eq = m.equipmentId ? getEquipment(m.equipmentId) : undefined;
              return (
                <div key={m.id} className="text-sm text-red-700/80 truncate">
                  • {eq?.name || m.title}
                </div>
              );
            })}
            {pendingRepairs.length > 3 && (
              <div className="text-sm text-red-500">还有 {pendingRepairs.length - 3} 项...</div>
            )}
          </div>
        </div>

        <div
          onClick={() => navigate("/maintenance")}
          className="card card-hover cursor-pointer animate-fade-in-up p-5 bg-gradient-to-br from-amber-50 to-white border-amber-100"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-amber-700" />
            </div>
            <ChevronRight className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-amber-800">{pendingPurchases.length}</div>
            <div className="text-amber-700 font-medium mt-1">缺件补购</div>
          </div>
          <div className="mt-3 space-y-1">
            {pendingPurchases.slice(0, 3).map((m) => {
              const eq = m.equipmentId ? getEquipment(m.equipmentId) : undefined;
              return (
                <div key={m.id} className="text-sm text-amber-800/80 truncate">
                  • {eq?.name || m.title}
                </div>
              );
            })}
            {pendingPurchases.length > 3 && (
              <div className="text-sm text-amber-600">还有 {pendingPurchases.length - 3} 项...</div>
            )}
          </div>
        </div>

        <div
          className="card card-hover cursor-pointer animate-fade-in-up p-5 bg-gradient-to-br from-gray-50 to-white border-gray-200"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
              <Ban className="w-6 h-6 text-gray-600" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-gray-800">{unavailableEquip.length}</div>
            <div className="text-gray-600 font-medium mt-1">下次露营不可用装备</div>
          </div>
          <div className="mt-3 space-y-1">
            {unavailableEquip.slice(0, 3).map((e) => (
              <div key={e.id} className="text-sm text-gray-700/80 truncate">
                • {e.name}
              </div>
            ))}
            {unavailableEquip.length > 3 && (
              <div className="text-sm text-gray-500">还有 {unavailableEquip.length - 3} 件...</div>
            )}
          </div>
        </div>
      </div>

      <div className="card animate-fade-in-up p-5" style={{ animationDelay: "320ms" }}>
        <h3 className="text-lg text-forest-800 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/equipment/new")}
            className="btn btn-primary justify-start"
          >
            <Plus className="w-5 h-5" />
            新增装备
          </button>
          <button
            onClick={() => navigate("/trips?create=true")}
            className="btn btn-secondary justify-start"
          >
            <CalendarDays className="w-5 h-5" />
            创建露营活动
          </button>
          <button
            onClick={() => navigate("/trips")}
            className="btn btn-secondary justify-start"
          >
            <PackageCheck className="w-5 h-5" />
            查看装箱清单
          </button>
        </div>
      </div>

      <div className="card animate-fade-in-up overflow-hidden" style={{ animationDelay: "400ms" }}>
        <div className="px-5 py-4 border-b border-forest-100/60 flex items-center justify-between">
          <h3 className="text-lg text-forest-800">最近露营活动</h3>
          <button
            onClick={() => navigate("/trips")}
            className="text-sm text-forest-600 hover:text-forest-700 flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-forest-100/60">
          {recentTrips.map((trip) => {
            const statusMeta = TRIP_STATUS_LABEL[trip.status] || TRIP_STATUS_LABEL.completed;
            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="px-5 py-4 hover:bg-forest-50/50 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`badge ${statusMeta.color} shrink-0`}>
                    {statusMeta.name}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-forest-900 truncate">{trip.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-forest-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{trip.location}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-forest-500 shrink-0 hidden sm:block">
                  {formatRelative(trip.createdAt)}
                </div>
              </div>
            );
          })}
          {recentTrips.length === 0 && (
            <div className="px-5 py-12 text-center text-forest-500">
              暂无露营活动，点击上方按钮创建你的第一次露营吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
