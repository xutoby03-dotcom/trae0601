import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Clock, User, DollarSign, Image as ImageIcon, X, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { roomsApi } from '../services/api.js';
import type { Room, RoomForm } from '../../shared/types.js';

export default function RoomsPage() {
  const { rooms, fetchRooms, loading } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState<RoomForm>({
    name: '',
    keyNumber: '',
    availableTime: '08:00-20:00',
    deposit: 0,
    manager: '',
    doorPhoto: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      keyNumber: '',
      availableTime: '08:00-20:00',
      deposit: 0,
      manager: '',
      doorPhoto: '',
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      keyNumber: room.keyNumber,
      availableTime: room.availableTime,
      deposit: room.deposit,
      manager: room.manager,
      doorPhoto: room.doorPhoto,
    });
    setImagePreview(room.doorPhoto || null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.id, formData);
      } else {
        await roomsApi.create(formData);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`确定要删除房间「${room.name}」吗？`)) return;
    try {
      await roomsApi.remove(room.id);
      fetchRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, doorPhoto: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.includes(searchText) ||
      r.keyNumber.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索房间名或钥匙编号..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          新增房间
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-slate-100 relative overflow-hidden">
                {room.doorPhoto ? (
                  <img
                    src={room.doorPhoto}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                  {room.keyNumber}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800 mb-3">{room.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>可借时段：{room.availableTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span>押金：¥{room.deposit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>管理员：{room.manager}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(room)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRoom ? '编辑房间' : '新增房间'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">房间名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="请输入房间名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">钥匙编号</label>
                <input
                  type="text"
                  required
                  value={formData.keyNumber}
                  onChange={(e) => setFormData({ ...formData, keyNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="如 KEY-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">可借时段</label>
                <input
                  type="text"
                  required
                  value={formData.availableTime}
                  onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="如 08:00-20:00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">押金金额</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">管理员</label>
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="管理员姓名"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">门牌照片</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="预览"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, doorPhoto: '' });
                        }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-8">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <span className="text-sm text-slate-500">点击上传门牌照片</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                  {editingRoom ? '保存修改' : '创建房间'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
