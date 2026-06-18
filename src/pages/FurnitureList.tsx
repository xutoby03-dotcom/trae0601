import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Armchair, Calendar, Weight, MapPin } from 'lucide-react';
import { useFurnitureStore } from '../store/furnitureStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ROOMS, FURNITURE_TYPE_LABELS, FURNITURE_STATUS_LABELS } from '../types';
import type { FurnitureType, FurnitureStatus } from '../types';

export function FurnitureList() {
  const furnitureList = useFurnitureStore((state) => state.furnitureList);
  const addFurniture = useFurnitureStore((state) => state.addFurniture);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    room: ROOMS[0],
    type: 'table' as FurnitureType,
    purchaseDate: new Date().toISOString().slice(0, 10),
    weightCapacity: 80,
    lastInspection: new Date().toISOString().slice(0, 10),
    status: 'normal' as FurnitureStatus,
    photos: [''] as string[],
  });

  const filteredList = useMemo(() => {
    return furnitureList.filter((item) => {
      const matchSearch =
        !searchText ||
        item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.room.includes(searchText);
      const matchRoom = !filterRoom || item.room === filterRoom;
      const matchType = !filterType || item.type === filterType;
      const matchStatus = !filterStatus || item.status === filterStatus;
      return matchSearch && matchRoom && matchType && matchStatus;
    });
  }, [furnitureList, searchText, filterRoom, filterType, filterStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFurniture({
      ...formData,
      photos: formData.photos.filter((p) => p.trim()),
    });
    setShowAddModal(false);
    setFormData({
      room: ROOMS[0],
      type: 'table',
      purchaseDate: new Date().toISOString().slice(0, 10),
      weightCapacity: 80,
      lastInspection: new Date().toISOString().slice(0, 10),
      status: 'normal',
      photos: [''],
    });
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">桌椅档案</h1>
          <p className="text-sm text-gray-500 mt-1">共 {furnitureList.length} 件设施</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增桌椅
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索编号或房间..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="select w-32">
                <option value="">全部房间</option>
                {ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="select w-28">
              <option value="">全部类型</option>
              <option value="table">桌子</option>
              <option value="chair">椅子</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select w-28">
              <option value="">全部状态</option>
              {Object.entries(FURNITURE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 桌椅列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/furniture/${item.id}`)}
            className="card card-hover cursor-pointer overflow-hidden group"
          >
            {/* 图片 */}
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {item.photos[0] ? (
                <img
                  src={item.photos[0]}
                  alt={item.id}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Armchair className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {item.status === 'out_of_service' && (
                <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                  <span className="text-white font-bold text-lg rotate-[-15deg] border-2 border-white px-4 py-1 rounded">
                    维修停用
                  </span>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <StatusBadge type="furniture" status={item.status} />
              </div>
            </div>

            {/* 信息 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{item.id}</h3>
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                  {FURNITURE_TYPE_LABELS[item.type]}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{item.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  <span>承重 {item.weightCapacity}kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>购入 {item.purchaseDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="card p-12 text-center">
          <Armchair className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无符合条件的桌椅</p>
        </div>
      )}

      {/* 新增弹窗 */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="新增桌椅档案" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">房间</label>
              <select
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="select"
              >
                {ROOMS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FurnitureType })}
                className="select"
              >
                <option value="table">桌子</option>
                <option value="chair">椅子</option>
              </select>
            </div>
            <div>
              <label className="label">购入日期</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">承重 (kg)</label>
              <input
                type="number"
                value={formData.weightCapacity}
                onChange={(e) => setFormData({ ...formData, weightCapacity: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">最近巡检</label>
              <input
                type="date"
                value={formData.lastInspection}
                onChange={(e) => setFormData({ ...formData, lastInspection: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FurnitureStatus })}
                className="select"
              >
                {Object.entries(FURNITURE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">照片链接</label>
            <input
              type="text"
              placeholder="输入图片URL（可选）"
              value={formData.photos[0] || ''}
              onChange={(e) => setFormData({ ...formData, photos: [e.target.value] })}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              确认添加
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
