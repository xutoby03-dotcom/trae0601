import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Monitor,
  MapPin,
  User,
  Phone,
  Cable,
  Wifi,
  Image,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import Empty from "@/components/Empty";
import type { MeetingRoom, ScreenSupportMethod } from "@/types";
import { ROOM_STATUS_LABELS, SCREEN_SUPPORT_METHOD_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export default function RoomsManage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    screenName: "",
    supportMethod: "both" as ScreenSupportMethod,
    location: "",
    admin: "",
    adminPhone: "",
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      name: "",
      screenName: "",
      supportMethod: "both",
      location: "",
      admin: "",
      adminPhone: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: MeetingRoom) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      screenName: room.screenName,
      supportMethod: room.supportMethod,
      location: room.location,
      admin: room.admin,
      adminPhone: room.adminPhone,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom(editingRoom.id, formData);
    } else {
      addRoom({ ...formData, faultPhotos: [] });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个会议室吗？相关预约和故障记录也会被删除。")) {
      deleteRoom(id);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">会议室管理</h2>
          <p className="text-gray-500">维护会议室屏幕信息、位置和管理员</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-soft"
        >
          <Plus size={20} />
          添加会议室
        </button>
      </div>

      {rooms.length === 0 ? (
        <Empty
          message="暂无会议室"
          description="点击上方按钮添加第一个会议室"
          icon={<Monitor size={40} className="text-gray-400" />}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    会议室名称
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    屏幕设备
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    支持方式
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    位置
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    管理员
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    状态
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                          <Monitor size={20} className="text-primary-600" />
                        </div>
                        <span className="font-medium text-gray-900">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{room.screenName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {room.supportMethod === "wired" && <Cable size={16} />}
                        {room.supportMethod === "wireless" && <Wifi size={16} />}
                        {room.supportMethod === "both" && (
                          <div className="flex items-center gap-1">
                            <Cable size={16} />
                            <Wifi size={16} />
                          </div>
                        )}
                        <span>{SCREEN_SUPPORT_METHOD_LABELS[room.supportMethod]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{room.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span>{room.admin}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <Phone size={14} />
                          <span>{room.adminPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={room.status}>
                        {ROOM_STATUS_LABELS[room.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? "编辑会议室" : "添加会议室"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会议室名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="如：阳光会议室"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                屏幕设备名称
              </label>
              <input
                type="text"
                value={formData.screenName}
                onChange={(e) =>
                  setFormData({ ...formData, screenName: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="如：Sony VPL-FHZ70"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支持投屏方式
            </label>
            <div className="flex gap-3">
              {(["wired", "wireless", "both"] as ScreenSupportMethod[]).map(
                (method) => (
                  <label
                    key={method}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all",
                      formData.supportMethod === method
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    )}
                  >
                    <input
                      type="radio"
                      name="supportMethod"
                      value={method}
                      checked={formData.supportMethod === method}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supportMethod: e.target.value as ScreenSupportMethod,
                        })
                      }
                      className="sr-only"
                    />
                    {method === "wired" && <Cable size={18} />}
                    {method === "wireless" && <Wifi size={18} />}
                    {method === "both" && (
                      <div className="flex items-center gap-1">
                        <Cable size={18} />
                        <Wifi size={18} />
                      </div>
                    )}
                    <span className="font-medium">
                      {SCREEN_SUPPORT_METHOD_LABELS[method]}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              位置
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="如：3楼 301室"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员姓名
              </label>
              <input
                type="text"
                value={formData.admin}
                onChange={(e) =>
                  setFormData({ ...formData, admin: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="管理员姓名"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员电话
              </label>
              <input
                type="tel"
                value={formData.adminPhone}
                onChange={(e) =>
                  setFormData({ ...formData, adminPhone: e.target.value })
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
              {editingRoom ? "保存修改" : "添加"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
