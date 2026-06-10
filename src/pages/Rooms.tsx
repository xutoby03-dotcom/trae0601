import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Users,
  X,
  Monitor,
  Mic,
  Camera,
  Square,
  UserCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROOM_STATUS_LABELS } from '@/types';
import type { Room, RoomStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

const statusColors: Record<RoomStatus, string> = {
  normal: 'bg-emerald-100 text-emerald-700',
  repairing: 'bg-red-100 text-red-700',
  missing_parts: 'bg-amber-100 text-amber-700',
  not_inspected: 'bg-slate-100 text-slate-600',
};

interface FormData {
  name: string;
  location: string;
  capacity: number;
  projector: string;
  microphone: string;
  camera: string;
  whiteboard: string;
  manager: string;
  managerContact: string;
}

const emptyForm: FormData = {
  name: '',
  location: '',
  capacity: 10,
  projector: '',
  microphone: '',
  camera: '',
  whiteboard: '',
  manager: '',
  managerContact: '',
};

export default function Rooms() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      projector: room.projector,
      microphone: room.microphone,
      camera: room.camera,
      whiteboard: room.whiteboard,
      manager: room.manager,
      managerContact: room.managerContact || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom(editingRoom.id, formData);
    } else {
      addRoom(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个会议室吗？')) {
      deleteRoom(id);
    }
  };

  const getDisplayStatus = (room: Room): RoomStatus => {
    if (room.status !== 'normal') return room.status;
    if (!room.lastInspectedAt) return 'not_inspected';
    const lastDate = new Date(room.lastInspectedAt);
    const today = new Date();
    const isToday =
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate();
    return isToday ? room.status : 'not_inspected';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">会议室管理</h1>
          <p className="text-slate-500 mt-1">登记和管理所有会议室信息</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          登记会议室
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索会议室名称或位置..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  会议室
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  位置
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  容量
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  设备配置
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  负责人
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  上次巡检
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => {
                const displayStatus = getDisplayStatus(room);
                return (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{room.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {room.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        {room.capacity}人
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        {room.projector && room.projector !== '无' && (
                          <span title={`投屏: ${room.projector}`}>
                            <Monitor className="w-4 h-4" />
                          </span>
                        )}
                        {room.microphone && room.microphone !== '无' && (
                          <span title={`麦克风: ${room.microphone}`}>
                            <Mic className="w-4 h-4" />
                          </span>
                        )}
                        {room.camera && room.camera !== '无' && (
                          <span title={`摄像头: ${room.camera}`}>
                            <Camera className="w-4 h-4" />
                          </span>
                        )}
                        {room.whiteboard && room.whiteboard !== '无' && (
                          <span title={`白板: ${room.whiteboard}`}>
                            <Square className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        {room.manager}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusColors[displayStatus]
                        )}
                      >
                        {ROOM_STATUS_LABELS[displayStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {room.lastInspectedAt
                        ? formatDate(room.lastInspectedAt)
                        : '未巡检'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRooms.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400">暂无会议室数据</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingRoom ? '编辑会议室' : '登记会议室'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    会议室名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="如：创新会议室"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    位置 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="如：A栋3层301"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    容纳人数 *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    负责人 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="负责人姓名"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">设备配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      <Monitor className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      投屏设备
                    </label>
                    <input
                      type="text"
                      value={formData.projector}
                      onChange={(e) => setFormData({ ...formData, projector: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="无 / 型号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      <Mic className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      麦克风
                    </label>
                    <input
                      type="text"
                      value={formData.microphone}
                      onChange={(e) => setFormData({ ...formData, microphone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="无 / 型号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      <Camera className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      摄像头
                    </label>
                    <input
                      type="text"
                      value={formData.camera}
                      onChange={(e) => setFormData({ ...formData, camera: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="无 / 型号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      <Square className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                      白板
                    </label>
                    <input
                      type="text"
                      value={formData.whiteboard}
                      onChange={(e) => setFormData({ ...formData, whiteboard: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="无 / 类型"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  联系电话
                </label>
                <input
                  type="text"
                  value={formData.managerContact}
                  onChange={(e) => setFormData({ ...formData, managerContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="负责人联系电话"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingRoom ? '保存修改' : '确认登记'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
