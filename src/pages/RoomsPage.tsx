import { useState } from 'react';
import { Plus, Edit2, Trash2, Lightbulb, Building2, Maximize2, Image, Check, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { FittingRoom } from '../../shared/types';
import { cleanStatusLabels, roomStatusLabels } from '@/utils/format';

export default function RoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom, loading } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<FittingRoom | null>(null);
  const [formData, setFormData] = useState<{
    number: string;
    floor: number;
    hasMirrorLight: boolean;
    cleanStatus: 'clean' | 'dirty' | 'cleaning';
    maxItems: number;
    status: 'available' | 'occupied' | 'maintenance';
    photoUrl: string;
  }>({
    number: '',
    floor: 1,
    hasMirrorLight: true,
    cleanStatus: 'clean',
    maxItems: 5,
    status: 'available',
    photoUrl: '',
  });

  const handleEdit = (room: FittingRoom) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      floor: room.floor,
      hasMirrorLight: room.hasMirrorLight,
      cleanStatus: room.cleanStatus,
      maxItems: room.maxItems,
      status: room.status,
      photoUrl: room.photoUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个试衣间吗？')) {
      await deleteRoom(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
      } else {
        await addRoom(formData);
      }
      resetForm();
    } catch (error) {
      // error handled in store
    }
  };

  const resetForm = () => {
    setFormData({
      number: '',
      floor: 1,
      hasMirrorLight: true,
      cleanStatus: 'clean',
      maxItems: 5,
      status: 'available',
      photoUrl: '',
    });
    setEditingRoom(null);
    setShowForm(false);
  };

  const groupedRooms = rooms.reduce((acc, room) => {
    const floor = room.floor;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<number, FittingRoom[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-cream-100">试衣间管理</h2>
          <p className="text-cream-400 mt-1">试衣间档案配置、状态管理</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增试衣间
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-cream-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-burgundy-700 px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-white">
                {editingRoom ? '编辑试衣间' : '新增试衣间'}
              </h3>
              <button onClick={resetForm} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    试衣间编号
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    className="input-field"
                    placeholder="如：A01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    楼层
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map(f => (
                      <option key={f} value={f}>{f}楼</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    <Maximize2 className="w-4 h-4 inline mr-1" />
                    件数上限
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxItems}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxItems: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    清洁状态
                  </label>
                  <select
                    value={formData.cleanStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, cleanStatus: e.target.value as 'clean' | 'dirty' | 'cleaning' }))}
                    className="input-field"
                  >
                    <option value="clean">已清洁</option>
                    <option value="dirty">待清洁</option>
                    <option value="cleaning">清洁中</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    使用状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'occupied' | 'maintenance' }))}
                    className="input-field"
                  >
                    <option value="available">可用</option>
                    <option value="occupied">使用中</option>
                    <option value="maintenance">维护中</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasMirrorLight}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasMirrorLight: e.target.checked }))}
                      className="w-5 h-5 rounded text-burgundy-700 focus:ring-burgundy-500"
                    />
                    <span className="text-charcoal-700 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-champagne-500" />
                      带镜灯
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  <Image className="w-4 h-4 inline mr-1" />
                  照片URL（选填）
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-outline flex-1">
                  取消
                </button>
                <button type="submit" disabled={loading || !formData.number} className="btn-primary flex-1">
                  {editingRoom ? '保存修改' : '添加试衣间'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedRooms).sort((a, b) => Number(a) - Number(b)).map(floor => (
          <div key={floor} className="card p-5">
            <h3 className="font-display text-xl text-charcoal-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-champagne-500" />
              {floor}楼
              <span className="text-sm font-normal text-charcoal-500">
                ({groupedRooms[Number(floor)].length} 间试衣间)
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-300">
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">编号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">照片</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">镜灯</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">件数限制</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">清洁状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">使用状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-charcoal-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRooms[Number(floor)].map(room => (
                    <tr key={room.id} className="border-b border-cream-100 hover:bg-cream-100 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-display text-lg font-bold text-charcoal-800">{room.number}</span>
                      </td>
                      <td className="py-3 px-4">
                        {room.photoUrl ? (
                          <img src={room.photoUrl} alt={room.number} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-cream-300 flex items-center justify-center text-charcoal-400">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Lightbulb className={`w-5 h-5 ${room.hasMirrorLight ? 'text-champagne-500' : 'text-gray-400'}`} />
                      </td>
                      <td className="py-3 px-4 text-charcoal-700">{room.maxItems} 件</td>
                      <td className="py-3 px-4">
                        <span className={`status-badge ${cleanStatusLabels[room.cleanStatus].className}`}>
                          {cleanStatusLabels[room.cleanStatus].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`status-badge ${roomStatusLabels[room.status].className} text-white`}>
                          {roomStatusLabels[room.status].label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="p-2 text-charcoal-600 hover:text-burgundy-700 hover:bg-cream-300 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-2 text-charcoal-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="card p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">暂无试衣间数据</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              添加第一个试衣间
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
