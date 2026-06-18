import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Calendar, Weight, MapPin, Clock, Wrench, FileText, ClipboardCheck } from 'lucide-react';
import { useFurnitureStore } from '../store/furnitureStore';
import { useRepairStore } from '../store/repairStore';
import { useInspectionStore } from '../store/inspectionStore';
import { useMaintenanceStore } from '../store/maintenanceStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FURNITURE_TYPE_LABELS, FURNITURE_STATUS_LABELS, ISSUE_TYPE_LABELS, ROOMS } from '../types';
import type { FurnitureType, FurnitureStatus } from '../types';

export function FurnitureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const furniture = useFurnitureStore((state) => state.getFurnitureById(id || ''));
  const updateFurniture = useFurnitureStore((state) => state.updateFurniture);
  const deleteFurniture = useFurnitureStore((state) => state.deleteFurniture);
  const repairOrders = useRepairStore((state) => state.getRepairsByFurniture(id || ''));
  const inspectionRecords = useInspectionStore((state) => state.getRecordsByFurniture(id || ''));
  const maintenanceRecords = useMaintenanceStore((state) => state.getRecordsByFurniture(id || ''));

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'repair' | 'inspection' | 'maintenance'>('repair');

  const [editData, setEditData] = useState(() => ({
    room: furniture?.room || ROOMS[0],
    type: (furniture?.type || 'table') as FurnitureType,
    purchaseDate: furniture?.purchaseDate || '',
    weightCapacity: furniture?.weightCapacity || 80,
    lastInspection: furniture?.lastInspection || '',
    status: (furniture?.status || 'normal') as FurnitureStatus,
    photos: furniture?.photos || [],
  }));

  const handleEdit = () => {
    if (furniture) {
      setEditData({
        room: furniture.room,
        type: furniture.type,
        purchaseDate: furniture.purchaseDate,
        weightCapacity: furniture.weightCapacity,
        lastInspection: furniture.lastInspection,
        status: furniture.status,
        photos: furniture.photos,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateFurniture(id, editData);
      setShowEditModal(false);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteFurniture(id);
      navigate('/furniture');
    }
  };

  if (!furniture) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500">未找到该桌椅档案</p>
        <Link to="/furniture" className="btn btn-primary mt-4 inline-block">
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回和操作 */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/furniture')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
          <span>返回列表</span>
        </button>
        <div className="flex gap-2">
          <button onClick={handleEdit} className="btn btn-outline flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {/* 主要信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧图片 */}
        <div className="card p-5">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {furniture.photos[0] ? (
              <img src={furniture.photos[0]} alt={furniture.id} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Wrench className="w-20 h-20 text-gray-300" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{furniture.id}</h2>
            <StatusBadge type="furniture" status={furniture.status} />
          </div>
        </div>

        {/* 右侧信息 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 基本信息 */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">所在房间</p>
                  <p className="text-sm font-medium text-gray-800">{furniture.room}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">设施类型</p>
                  <p className="text-sm font-medium text-gray-800">{FURNITURE_TYPE_LABELS[furniture.type]}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">购入日期</p>
                  <p className="text-sm font-medium text-gray-800">{furniture.purchaseDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Weight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">承重能力</p>
                  <p className="text-sm font-medium text-gray-800">{furniture.weightCapacity} kg</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">最近巡检</p>
                  <p className="text-sm font-medium text-gray-800">{furniture.lastInspection}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前状态</p>
                  <p className="text-sm font-medium text-gray-800">
                    {FURNITURE_STATUS_LABELS[furniture.status]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页 */}
          <div className="card overflow-hidden">
            {/* 标签头部 */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('repair')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'repair'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                报修记录 ({repairOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('inspection')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'inspection'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                巡检记录 ({inspectionRecords.length})
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'maintenance'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Wrench className="w-4 h-4" />
                维修记录 ({maintenanceRecords.length})
              </button>
            </div>

            {/* 标签内容 */}
            <div className="p-4 max-h-80 overflow-auto">
              {activeTab === 'repair' && (
                <div className="space-y-3">
                  {repairOrders.length > 0 ? (
                    repairOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">{order.id}</span>
                          <StatusBadge type="repair" status={order.status} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span>报修人：{order.reporter}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="text-primary-600">
                            [{ISSUE_TYPE_LABELS[order.issueType]}]
                          </span>{' '}
                          {order.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无报修记录</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-3">
                  {inspectionRecords.length > 0 ? (
                    inspectionRecords.map((record) => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">{record.inspectDate}</span>
                          <StatusBadge type="inspection" status={record.result} />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">巡检员：{record.inspector}</p>
                        {record.remark && <p className="text-sm text-gray-600">备注：{record.remark}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无巡检记录</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-3">
                  {maintenanceRecords.length > 0 ? (
                    maintenanceRecords.map((record) => (
                      <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">{record.id}</span>
                          <StatusBadge type="maintenance" status={record.status} />
                        </div>
                        {record.handler && (
                          <p className="text-xs text-gray-500 mb-1">处理人：{record.handler}</p>
                        )}
                        {record.parts && <p className="text-sm text-gray-600">配件：{record.parts}</p>}
                        {record.cost > 0 && (
                          <p className="text-sm text-primary-600 font-medium mt-1">费用：¥{record.cost}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无维修记录</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="编辑桌椅档案" size="lg">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">房间</label>
              <select
                value={editData.room}
                onChange={(e) => setEditData({ ...editData, room: e.target.value })}
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
                value={editData.type}
                onChange={(e) => setEditData({ ...editData, type: e.target.value as FurnitureType })}
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
                value={editData.purchaseDate}
                onChange={(e) => setEditData({ ...editData, purchaseDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">承重 (kg)</label>
              <input
                type="number"
                value={editData.weightCapacity}
                onChange={(e) => setEditData({ ...editData, weightCapacity: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">最近巡检</label>
              <input
                type="date"
                value={editData.lastInspection}
                onChange={(e) => setEditData({ ...editData, lastInspection: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">状态</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value as FurnitureStatus })}
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存修改
            </button>
          </div>
        </form>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="确认删除" size="sm">
        <p className="text-gray-600 mb-6">确定要删除桌椅档案「{furniture.id}」吗？此操作不可恢复。</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">
            取消
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
}
