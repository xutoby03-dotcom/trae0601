import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Droplets } from 'lucide-react';
import { useAppStore } from '@/store';
import PageContainer from '@/components/Layout/PageContainer';
import PageHeader from '@/components/Layout/PageHeader';
import Modal from '@/components/Modal';
import {
  getCurtainTypeLabel,
  getWashMethodLabel,
  getRoomIcon,
} from '@/utils/statistics';
import { formatDate, isOverdueForWash, getWashStatusText } from '@/utils/date';
import type { Room, Curtain, CurtainType, WashMethod } from '@/types';

export default function Rooms() {
  const { rooms, curtains, addRoom, updateRoom, deleteRoom, addCurtain, updateCurtain, deleteCurtain } = useAppStore();
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [curtainModalOpen, setCurtainModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingCurtain, setEditingCurtain] = useState<Curtain | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [roomForm, setRoomForm] = useState({ name: '' });
  const [curtainForm, setCurtainForm] = useState({
    name: '',
    type: 'cloth' as CurtainType,
    width: 300,
    height: 270,
    hookCount: 18,
    washMethod: 'machine' as WashMethod,
    washCycleDays: 30,
    notes: '',
    lastWashDate: '',
  });

  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ name: '' });
    setRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({ name: room.name });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = () => {
    if (!roomForm.name.trim()) return;
    const icon = getRoomIcon(roomForm.name);

    if (editingRoom) {
      updateRoom({ ...editingRoom, name: roomForm.name, icon });
    } else {
      addRoom({
        name: roomForm.name,
        icon,
        createdAt: new Date().toISOString(),
      });
    }
    setRoomModalOpen(false);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('确定要删除这个房间吗？相关的窗帘和记录也会被删除。')) {
      deleteRoom(id);
    }
  };

  const handleAddCurtain = (roomId: string) => {
    setSelectedRoomId(roomId);
    setEditingCurtain(null);
    setCurtainForm({
      name: '',
      type: 'cloth',
      width: 300,
      height: 270,
      hookCount: 18,
      washMethod: 'machine',
      washCycleDays: 30,
      notes: '',
      lastWashDate: '',
    });
    setCurtainModalOpen(true);
  };

  const handleEditCurtain = (curtain: Curtain) => {
    setSelectedRoomId(curtain.roomId);
    setEditingCurtain(curtain);
    setCurtainForm({
      name: curtain.name,
      type: curtain.type,
      width: curtain.size.width,
      height: curtain.size.height,
      hookCount: curtain.hookCount,
      washMethod: curtain.washMethod,
      washCycleDays: curtain.washCycleDays,
      notes: curtain.notes,
      lastWashDate: curtain.lastWashDate || '',
    });
    setCurtainModalOpen(true);
  };

  const handleSaveCurtain = () => {
    if (!curtainForm.name.trim() || !selectedRoomId) return;

    const curtainData = {
      roomId: selectedRoomId,
      name: curtainForm.name,
      type: curtainForm.type,
      size: { width: curtainForm.width, height: curtainForm.height },
      hookCount: curtainForm.hookCount,
      washMethod: curtainForm.washMethod,
      washCycleDays: curtainForm.washCycleDays,
      notes: curtainForm.notes,
      lastWashDate: curtainForm.lastWashDate || null,
      hasMold: false,
      trackStuck: false,
    };

    if (editingCurtain) {
      updateCurtain({ ...editingCurtain, ...curtainData });
    } else {
      addCurtain(curtainData);
    }
    setCurtainModalOpen(false);
  };

  const handleDeleteCurtain = (id: string) => {
    if (confirm('确定要删除这条窗帘记录吗？相关的清洗记录也会被删除。')) {
      deleteCurtain(id);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="房间管理"
        subtitle="管理每个房间的窗帘信息"
        actions={
          <button onClick={handleAddRoom} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            添加房间
          </button>
        }
      />

      {rooms.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl mb-2">还没有添加房间</h2>
          <p className="text-gray-500 mb-6">点击上方按钮添加您的第一个房间</p>
          <button onClick={handleAddRoom} className="btn-primary">
            添加第一个房间
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {rooms.map((room, roomIndex) => {
            const roomCurtains = curtains.filter((c) => c.roomId === room.id);
            const overdueCount = roomCurtains.filter((c) =>
              isOverdueForWash(c.lastWashDate, c.washCycleDays)
            ).length;

            return (
              <div
                key={room.id}
                className="card opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * roomIndex}s` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-warm flex items-center justify-center text-3xl shadow-soft">
                      {room.icon}
                    </div>
                    <div>
                      <h2 className="text-xl mb-1">{room.name}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{roomCurtains.length} 幅窗帘</span>
                        {overdueCount > 0 && (
                          <span className="badge badge-coral animate-breathing">
                            {overdueCount} 幅待清洗
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 hover:bg-coral-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-coral-500" />
                    </button>
                  </div>
                </div>

                {roomCurtains.length > 0 ? (
                  <div className="space-y-3">
                    {roomCurtains.map((curtain, idx) => {
                      const isOverdue = isOverdueForWash(curtain.lastWashDate, curtain.washCycleDays);
                      return (
                        <div
                          key={curtain.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isOverdue
                              ? 'border-coral-200 bg-coral-50'
                              : 'border-transparent bg-gray-50 hover:border-primary-200 hover:bg-primary-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-medium text-primary-800">{curtain.name}</h3>
                                <span className="badge badge-primary">
                                  {getCurtainTypeLabel(curtain.type)}
                                </span>
                                <span className="badge badge-sage">
                                  {getWashMethodLabel(curtain.washMethod)}
                                </span>
                                {isOverdue && (
                                  <span className="badge badge-coral animate-breathing">
                                    {getWashStatusText(curtain.lastWashDate, curtain.washCycleDays)}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                                <span>尺寸：{curtain.size.width} × {curtain.size.height} cm</span>
                                <span>挂钩：{curtain.hookCount} 个</span>
                                <span>上次清洗：{formatDate(curtain.lastWashDate)}</span>
                                <span>周期：每 {curtain.washCycleDays} 天</span>
                              </div>
                              {curtain.notes && (
                                <p className="text-sm text-gray-500 mt-2">备注：{curtain.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditCurtain(curtain)}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                              >
                                <Edit2 size={18} className="text-gray-500" />
                              </button>
                              <Link
                                to={`/rooms/${room.id}/curtain/${curtain.id}/wash`}
                                className="btn-primary px-4 py-2 flex items-center gap-2"
                              >
                                <Droplets size={16} />
                                清洗
                              </Link>
                              <button
                                onClick={() => handleDeleteCurtain(curtain.id)}
                                className="p-2 hover:bg-coral-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} className="text-coral-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-warm-50 rounded-xl">
                    <p>这个房间还没有添加窗帘</p>
                  </div>
                )}

                <button
                  onClick={() => handleAddCurtain(room.id)}
                  className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  添加窗帘
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoom ? '编辑房间' : '添加房间'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">房间名称</label>
            <input
              type="text"
              className="input-field"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              placeholder="例如：客厅、主卧"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setRoomModalOpen(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button
              onClick={handleSaveRoom}
              className="btn-primary flex-1"
              disabled={!roomForm.name.trim()}
            >
              {editingRoom ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={curtainModalOpen}
        onClose={() => setCurtainModalOpen(false)}
        title={editingCurtain ? '编辑窗帘' : '添加窗帘'}
        size="lg"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="input-label">窗帘名称</label>
            <input
              type="text"
              className="input-field"
              value={curtainForm.name}
              onChange={(e) => setCurtainForm({ ...curtainForm, name: e.target.value })}
              placeholder="例如：主布帘、纱帘"
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">窗帘类型</label>
            <select
              className="input-field"
              value={curtainForm.type}
              onChange={(e) => setCurtainForm({ ...curtainForm, type: e.target.value as CurtainType })}
            >
              <option value="cloth">布帘</option>
              <option value="sheer">纱帘</option>
              <option value="blackout">遮光布</option>
              <option value="roller">卷帘</option>
              <option value="bamboo">竹帘</option>
            </select>
          </div>

          <div>
            <label className="input-label">清洗方式</label>
            <select
              className="input-field"
              value={curtainForm.washMethod}
              onChange={(e) => setCurtainForm({ ...curtainForm, washMethod: e.target.value as WashMethod })}
            >
              <option value="machine">机洗</option>
              <option value="hand">手洗</option>
              <option value="dryclean">干洗</option>
              <option value="spot">局部清洗</option>
            </select>
          </div>

          <div>
            <label className="input-label">宽度 (cm)</label>
            <input
              type="number"
              className="input-field"
              value={curtainForm.width}
              onChange={(e) => setCurtainForm({ ...curtainForm, width: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="input-label">高度 (cm)</label>
            <input
              type="number"
              className="input-field"
              value={curtainForm.height}
              onChange={(e) => setCurtainForm({ ...curtainForm, height: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="input-label">挂钩数量</label>
            <input
              type="number"
              className="input-field"
              value={curtainForm.hookCount}
              onChange={(e) => setCurtainForm({ ...curtainForm, hookCount: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="input-label">清洗周期 (天)</label>
            <input
              type="number"
              className="input-field"
              value={curtainForm.washCycleDays}
              onChange={(e) => setCurtainForm({ ...curtainForm, washCycleDays: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="input-label">上次清洗日期</label>
            <input
              type="date"
              className="input-field"
              value={curtainForm.lastWashDate}
              onChange={(e) => setCurtainForm({ ...curtainForm, lastWashDate: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="input-label">备注</label>
            <textarea
              className="input-field"
              rows={3}
              value={curtainForm.notes}
              onChange={(e) => setCurtainForm({ ...curtainForm, notes: e.target.value })}
              placeholder="材质说明、注意事项等"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={() => setCurtainModalOpen(false)}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            onClick={handleSaveCurtain}
            className="btn-primary flex-1"
            disabled={!curtainForm.name.trim()}
          >
            {editingCurtain ? '保存' : '添加'}
          </button>
        </div>
      </Modal>
    </PageContainer>
  );
}
