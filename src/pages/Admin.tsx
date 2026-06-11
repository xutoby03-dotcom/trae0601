import { useState } from 'react';
import { Plus, Edit2, Trash2, Wrench, Lock, Unlock, X, Save, Music, MapPin, Clock, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Room, PIANO_TYPE_LABELS, ROOM_STATUS_LABELS, FLOORS, PianoType, RoomStatus, TIME_SLOTS } from '@/types';

export default function Admin() {
  const { rooms, currentRole, addRoom, updateRoom, updateRoomStatus, deleteRoom, resetData } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    pianoType: 'upright' as PianoType,
    floor: 1,
    hasMusicStand: true,
    photoUrl: '',
    status: 'available' as RoomStatus,
    maintenanceReason: '',
    availableTimeSlots: [] as string[],
  });

  const handleAddClick = () => {
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      pianoType: 'upright',
      floor: 1,
      hasMusicStand: true,
      photoUrl: '',
      status: 'available',
      maintenanceReason: '',
      availableTimeSlots: [...TIME_SLOTS],
    });
    setShowForm(true);
  };

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      pianoType: room.pianoType,
      floor: room.floor,
      hasMusicStand: room.hasMusicStand,
      photoUrl: room.photoUrl,
      status: room.status,
      maintenanceReason: room.maintenanceReason || '',
      availableTimeSlots: [...room.availableTimeSlots],
    });
    setShowForm(true);
  };

  const toggleTimeSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter(s => s !== slot)
        : [...prev.availableTimeSlots, slot],
    }));
  };

  const selectAllTimeSlots = () => {
    setFormData(prev => ({ ...prev, availableTimeSlots: [...TIME_SLOTS] }));
  };

  const clearAllTimeSlots = () => {
    setFormData(prev => ({ ...prev, availableTimeSlots: [] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.availableTimeSlots.length === 0) {
      alert('请至少选择一个可用时段');
      return;
    }
    
    const roomData = {
      roomNumber: formData.roomNumber,
      pianoType: formData.pianoType,
      floor: formData.floor,
      hasMusicStand: formData.hasMusicStand,
      photoUrl: formData.photoUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${PIANO_TYPE_LABELS[formData.pianoType]} in elegant music practice room`)}&image_size=square`,
      availableTimeSlots: [...formData.availableTimeSlots].sort(),
      status: formData.status,
      maintenanceReason: formData.status !== 'available' ? formData.maintenanceReason : undefined,
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomData);
    } else {
      addRoom(roomData);
    }
    
    setShowForm(false);
  };

  const handleStatusChange = (room: Room, status: RoomStatus, reason?: string) => {
    const message = status === 'maintenance' 
      ? '确定要将此琴房标记为维修中吗？该琴房的所有预约将被取消。'
      : status === 'temporarily_closed'
      ? '确定要将此琴房标记为暂不可用吗？该琴房的所有预约将被取消。'
      : '确定要恢复此琴房的可用状态吗？';
    
    if (window.confirm(message)) {
      updateRoomStatus(room.id, status, reason);
    }
  };

  const handleDelete = (room: Room) => {
    if (window.confirm(`确定要删除琴房 ${room.roomNumber} 吗？此操作不可恢复。`)) {
      deleteRoom(room.id);
    }
  };

  if (currentRole === 'student') {
    return (
      <div className="card p-12 text-center">
        <Lock className="w-16 h-16 text-wood-300 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-wood-900 mb-2">权限不足</h2>
        <p className="text-wood-600 mb-4">请切换到老师或管理员身份以使用此功能</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-wood-900 mb-2">琴房管理</h1>
          <p className="text-wood-600">管理琴房信息、维修状态和可用性</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm('确定要重置所有数据吗？这将恢复为初始 Mock 数据。')) {
                resetData();
              }
            }}
            className="btn-secondary text-sm"
          >
            重置数据
          </button>
          {currentRole === 'admin' && (
            <button onClick={handleAddClick} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加琴房
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className="card p-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                <img src={room.photoUrl} alt={room.roomNumber} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-wood-900">
                      {room.roomNumber}
                    </h3>
                    <p className="text-sm text-wood-600">
                      {PIANO_TYPE_LABELS[room.pianoType]}
                    </p>
                  </div>
                  <span className={`badge ${
                    room.status === 'available' ? 'badge-available' : 'badge-maintenance'
                  } flex-shrink-0`}>
                    {ROOM_STATUS_LABELS[room.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-wood-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {room.floor}楼
                  </span>
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {room.hasMusicStand ? '有谱架' : '无谱架'}
                  </span>
                </div>
                {room.maintenanceReason && (
                  <p className="text-xs text-orange-600 mt-2">
                    原因：{room.maintenanceReason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-cream-200">
              {room.status === 'available' ? (
                <>
                  <button
                    onClick={() => {
                      const reason = prompt('请输入维修原因：');
                      if (reason) handleStatusChange(room, 'maintenance', reason);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    维修
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('请输入关闭原因：');
                      if (reason) handleStatusChange(room, 'temporarily_closed', reason);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    关闭
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStatusChange(room, 'available')}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Unlock className="w-4 h-4" />
                  恢复可用
                </button>
              )}
              
              {currentRole === 'admin' && (
                <>
                  <button
                    onClick={() => handleEditClick(room)}
                    className="p-2 text-wood-500 hover:text-wood-700 hover:bg-cream-100 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <h2 className="font-serif text-xl font-bold text-wood-900">
                {editingRoom ? '编辑琴房' : '添加琴房'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-wood-500 hover:text-wood-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  琴房编号
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  className="input-field"
                  placeholder="如：A101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  钢琴类型
                </label>
                <select
                  value={formData.pianoType}
                  onChange={(e) => setFormData(prev => ({ ...prev, pianoType: e.target.value as PianoType }))}
                  className="input-field"
                >
                  {Object.entries(PIANO_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  楼层
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: Number(e.target.value) }))}
                  className="input-field"
                >
                  {FLOORS.map(floor => (
                    <option key={floor} value={floor}>{floor} 楼</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasMusicStand"
                  checked={formData.hasMusicStand}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasMusicStand: e.target.checked }))}
                  className="w-4 h-4 rounded border-wood-300 text-wood-700 focus:ring-wood-500"
                />
                <label htmlFor="hasMusicStand" className="text-sm text-wood-700">
                  配有谱架
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  照片 URL（可选）
                </label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="input-field"
                  placeholder="留空将自动生成"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-wood-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    可用时段
                    <span className="text-xs text-wood-400 font-normal">
                      (已选 {formData.availableTimeSlots.length}/{TIME_SLOTS.length})
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllTimeSlots}
                      className="text-xs px-2 py-1 text-wood-600 hover:text-wood-800 hover:bg-wood-50 rounded transition-colors"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={clearAllTimeSlots}
                      className="text-xs px-2 py-1 text-wood-600 hover:text-wood-800 hover:bg-wood-50 rounded transition-colors"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 bg-cream-50 rounded-lg border border-cream-200">
                  {TIME_SLOTS.map(slot => {
                    const isSelected = formData.availableTimeSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleTimeSlot(slot)}
                        className={`relative px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-wood-700 text-gold-300 shadow-md'
                            : 'bg-white text-wood-500 border border-wood-200 hover:bg-wood-50 hover:text-wood-700'
                        }`}
                      >
                        <span>{slot}</span>
                        {isSelected && (
                          <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-gold-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as RoomStatus }))}
                  className="input-field"
                >
                  {Object.entries(ROOM_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {formData.status !== 'available' && (
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1.5">
                    原因说明
                  </label>
                  <input
                    type="text"
                    value={formData.maintenanceReason}
                    onChange={(e) => setFormData(prev => ({ ...prev, maintenanceReason: e.target.value }))}
                    className="input-field"
                    placeholder="请输入原因"
                    required={(formData.status as RoomStatus) !== 'available'}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingRoom ? '保存修改' : '添加琴房'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
