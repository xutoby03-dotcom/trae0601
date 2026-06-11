import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CalendarPlus,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  PlayCircle,
  Monitor,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import StatusBadge from "@/components/StatusBadge";
import CountdownTimer from "@/components/CountdownTimer";
import Empty from "@/components/Empty";
import Modal from "@/components/Modal";
import { BOOKING_STATUS_LABELS, ROOM_STATUS_LABELS } from "@/types";
import { formatDateTime, cn } from "@/lib/utils";

export default function BookingPage() {
  const location = useLocation();
  const { rooms, bookings, addBooking, cancelBooking, completeBooking, startBooking, hasOverlappingBooking, refreshBookingStatuses, getRoomById } =
    useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    startTime: "",
    endTime: "",
    equipmentNeeds: "",
    host: "",
    hostPhone: "",
  });

  const preselectedRoomId = (location.state as { roomId?: string })?.roomId;

  useEffect(() => {
    refreshBookingStatuses();
    const timer = setInterval(() => {
      refreshBookingStatuses();
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshBookingStatuses]);

  useEffect(() => {
    if (preselectedRoomId && rooms.length > 0) {
      const preselectedRoom = rooms.find((r) => r.id === preselectedRoomId);
      if (preselectedRoom && preselectedRoom.status === "available") {
        setSelectedRoomId(preselectedRoomId);
        setIsModalOpen(true);
      }
    }
  }, [preselectedRoomId, rooms]);

  const availableRooms = rooms.filter(
    (r) => r.status === "available"
  );

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const activeBookings = sortedBookings.filter(
    (b) => b.status === "ongoing" || b.status === "overtime"
  );
  const upcomingBookings = sortedBookings.filter(
    (b) => b.status === "upcoming"
  );
  const completedBookings = sortedBookings.filter(
    (b) => b.status === "completed"
  );

  const handleOpenModal = () => {
    if (availableRooms.length === 0) {
      alert("暂无可预约的会议室");
      return;
    }
    const defaultRoomId =
      preselectedRoomId && availableRooms.some((r) => r.id === preselectedRoomId)
        ? preselectedRoomId
        : availableRooms[0]?.id || "";
    setSelectedRoomId(defaultRoomId);
    const now = new Date();
    const start = new Date(now.getTime() + 10 * 60 * 1000);
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    setFormData({
      topic: "",
      startTime: start.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
      equipmentNeeds: "",
      host: "",
      hostPhone: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert("请选择会议室");
      return;
    }
    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) {
      alert("所选会议室不存在");
      return;
    }
    if (selectedRoom.status !== "available") {
      alert(
        `该会议室当前${selectedRoom.status === "in_use" ? "使用中" : "故障中"}，暂不可预约`
      );
      return;
    }
    const newStart = new Date(formData.startTime).toISOString();
    const newEnd = new Date(formData.endTime).toISOString();

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert("结束时间必须晚于开始时间");
      return;
    }

    if (hasOverlappingBooking(selectedRoomId, newStart, newEnd)) {
      alert("该会议室在所选时间段内已有预约，请选择其他时间");
      return;
    }

    addBooking({
      roomId: selectedRoomId,
      topic: formData.topic,
      startTime: newStart,
      endTime: newEnd,
      equipmentNeeds: formData.equipmentNeeds,
      host: formData.host,
      hostPhone: formData.hostPhone,
    });
    setIsModalOpen(false);
  };

  const handleComplete = (id: string) => {
    if (confirm("确定要结束这个会议吗？")) {
      completeBooking(id);
    }
  };

  const handleStart = (id: string) => {
    startBooking(id);
  };

  const handleCancel = (id: string) => {
    if (confirm("确定要取消这个预约吗？")) {
      cancelBooking(id);
    }
  };

  const BookingCard = ({ booking, showActions = true }: { booking: typeof bookings[0]; showActions?: boolean }) => {
    const room = getRoomById(booking.roomId);
    const isOvertime = booking.status === "overtime";

    return (
      <div
        className={cn(
          "bg-white rounded-xl p-4 shadow-soft transition-all",
          isOvertime && "ring-2 ring-red-500"
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{booking.topic}</h4>
            <p className="text-sm text-gray-500">{room?.name || "未知会议室"}</p>
          </div>
          <StatusBadge variant={booking.status}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </StatusBadge>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span>
              {formatDateTime(booking.startTime)} ~ {formatDateTime(booking.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span>主持人：{booking.host}</span>
          </div>
          {booking.equipmentNeeds && (
            <div className="flex items-center gap-2">
              <Monitor size={14} className="text-gray-400" />
              <span>设备需求：{booking.equipmentNeeds}</span>
            </div>
          )}
        </div>

        {(booking.status === "ongoing" || booking.status === "overtime") && (
          <div className="mb-4 p-3 rounded-xl bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {isOvertime ? "已超时" : "剩余时间"}
              </span>
              <CountdownTimer endTime={booking.endTime} />
            </div>
          </div>
        )}

        {showActions && (booking.status === "upcoming" || booking.status === "ongoing" || booking.status === "overtime") && (
          <div className="flex gap-2">
            {(booking.status === "ongoing" || booking.status === "overtime") && (
              <button
                onClick={() => handleComplete(booking.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all text-sm font-medium"
              >
                <CheckCircle size={16} />
                结束会议
              </button>
            )}
            {booking.status === "upcoming" && (
              <button
                onClick={() => handleStart(booking.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all text-sm font-medium"
              >
                <PlayCircle size={16} />
                开始使用
              </button>
            )}
            <button
              onClick={() => handleCancel(booking.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-sm font-medium"
            >
              <XCircle size={16} />
              取消
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">预约登记</h2>
          <p className="text-gray-500">预约会议室投屏设备使用</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-soft"
        >
          <CalendarPlus size={20} />
          新建预约
        </button>
      </div>

      {activeBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            当前进行中
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            即将开始 ({upcomingBookings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {completedBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            历史记录 ({completedBookings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBookings.slice(0, 6).map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <Empty
          message="暂无预约记录"
          description="点击上方按钮创建第一个预约"
          icon={<CalendarPlus size={40} className="text-gray-400" />}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建投屏预约"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择会议室
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableRooms.map((room) => (
                <label
                  key={room.id}
                  className={cn(
                    "p-3 border-2 rounded-xl cursor-pointer transition-all",
                    selectedRoomId === room.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300",
                    room.status === "in_use" && "opacity-60"
                  )}
                >
                  <input
                    type="radio"
                    name="room"
                    value={room.id}
                    checked={selectedRoomId === room.id}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{room.name}</p>
                      <p className="text-xs text-gray-500">{room.screenName}</p>
                    </div>
                    <StatusBadge variant={room.status}>
                      {ROOM_STATUS_LABELS[room.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{room.location}</p>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会议主题
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="请输入会议主题"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始时间
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              设备需求
            </label>
            <input
              type="text"
              value={formData.equipmentNeeds}
              onChange={(e) =>
                setFormData({ ...formData, equipmentNeeds: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="如：无线投屏、白板、麦克风等"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主持人
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) =>
                  setFormData({ ...formData, host: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="主持人姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                value={formData.hostPhone}
                onChange={(e) =>
                  setFormData({ ...formData, hostPhone: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="联系电话"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all"
            >
              确认预约
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
