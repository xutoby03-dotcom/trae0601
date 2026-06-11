import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Monitor,
  MapPin,
  User,
  Clock,
  CalendarPlus,
  AlertTriangle,
  Cable,
  Wifi,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import StatusBadge from "@/components/StatusBadge";
import CountdownTimer from "@/components/CountdownTimer";
import Empty from "@/components/Empty";
import {
  ROOM_STATUS_LABELS,
  SCREEN_SUPPORT_METHOD_LABELS,
} from "@/types";
import { formatTime, cn } from "@/lib/utils";

export default function Home() {
  const navigate = useNavigate();
  const { rooms, bookings, refreshBookingStatuses, getActiveBookingByRoomId } =
    useStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    refreshBookingStatuses();
    const timer = setInterval(() => {
      refreshBookingStatuses();
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshBookingStatuses]);

  const availableCount = rooms.filter((r) => r.status === "available").length;
  const inUseCount = rooms.filter((r) => r.status === "in_use").length;
  const faultyCount = rooms.filter((r) => r.status === "faulty").length;

  if (rooms.length === 0) {
    return (
      <div className="container py-8">
        <Empty
          message="暂无会议室"
          description="请先在会议室管理中添加会议室"
          icon={<Monitor size={40} className="text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">会议室投屏状态</h2>
        <p className="text-gray-500">实时查看各会议室投屏使用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Monitor size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">空闲可用</p>
              <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">使用中</p>
              <p className="text-2xl font-bold text-gray-900">{inUseCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">故障中</p>
              <p className="text-2xl font-bold text-gray-900">{faultyCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          const activeBooking = getActiveBookingByRoomId(room.id);
          const isOvertime = activeBooking?.status === "overtime";

          return (
            <div
              key={room.id}
              className={cn(
                "bg-white rounded-2xl shadow-soft overflow-hidden transition-all hover:shadow-card",
                isOvertime && "ring-2 ring-red-500"
              )}
            >
              <div
                className={cn(
                  "h-2",
                  room.status === "available" && "bg-green-500",
                  room.status === "in_use" && "bg-blue-500",
                  room.status === "faulty" && "bg-red-500"
                )}
              />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500">{room.screenName}</p>
                  </div>
                  <StatusBadge variant={room.status}>
                    {ROOM_STATUS_LABELS[room.status]}
                  </StatusBadge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.supportMethod === "wired" && (
                      <Cable size={16} className="text-gray-400" />
                    )}
                    {room.supportMethod === "wireless" && (
                      <Wifi size={16} className="text-gray-400" />
                    )}
                    {room.supportMethod === "both" && (
                      <div className="flex items-center gap-1">
                        <Cable size={16} className="text-gray-400" />
                        <Wifi size={16} className="text-gray-400" />
                      </div>
                    )}
                    <span>{SCREEN_SUPPORT_METHOD_LABELS[room.supportMethod]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span>管理员：{room.admin}</span>
                  </div>
                </div>

                {activeBooking && (
                  <div
                    className={cn(
                      "p-3 rounded-xl mb-4",
                      isOvertime ? "bg-red-50" : "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isOvertime ? "text-red-700" : "text-blue-700"
                        )}
                      >
                        {activeBooking.topic}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          isOvertime ? "text-red-600" : "text-blue-600"
                        )}
                      >
                        {formatTime(activeBooking.startTime)} -{" "}
                        {formatTime(activeBooking.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        主持人：{activeBooking.host}
                      </span>
                      <CountdownTimer endTime={activeBooking.endTime} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/booking", { state: { roomId: room.id } })}
                    disabled={room.status === "faulty"}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                      room.status === "faulty"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    )}
                  >
                    <CalendarPlus size={16} />
                    预约使用
                  </button>
                  {room.status === "faulty" && (
                    <button
                      onClick={() =>
                        navigate("/faults", { state: { roomId: room.id } })
                      }
                      className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
                    >
                      <AlertTriangle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
