import { useState, useEffect } from 'react';
import { Table, Edit2, Save, X, Wrench, Settings } from 'lucide-react';
import { useAppStore } from '../../store';
import { TableStatusBadge } from '../../components/common/StatusBadge';
import type { TableStatus, NetStatus } from '../../types';

export default function TableManagement() {
  const { tables, updateTableStatus, updateTable, refreshData } = useAppStore();
  
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    location: '',
    openTimeStart: '',
    openTimeEnd: '',
    netStatus: 'good' as NetStatus,
    racketCount: 0,
  });

  useEffect(() => {
    refreshData();
  }, []);

  const handleEdit = (table: typeof tables[0]) => {
    setEditingTable(table.id);
    setEditForm({
      location: table.location,
      openTimeStart: table.openTimeStart,
      openTimeEnd: table.openTimeEnd,
      netStatus: table.netStatus,
      racketCount: table.racketCount,
    });
  };

  const handleSave = (tableId: string) => {
    updateTable(tableId, editForm);
    setEditingTable(null);
    refreshData();
  };

  const handleStatusChange = (tableId: string, status: TableStatus) => {
    if (confirm(`确认将球桌状态改为"${status === 'maintenance' ? '维护中' : status === 'disabled' ? '已停用' : '空闲'}"？`)) {
      updateTableStatus(tableId, status);
      refreshData();
    }
  };

  const netStatusOptions: { value: NetStatus; label: string }[] = [
    { value: 'good', label: '正常' },
    { value: 'damaged', label: '损坏' },
    { value: 'missing', label: '缺失' },
  ];

  const statusOptions: { value: TableStatus; label: string; color: string }[] = [
    { value: 'available', label: '空闲', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'maintenance', label: '维护中', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { value: 'disabled', label: '停用', color: 'bg-gray-500 hover:bg-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">球桌管理</h2>
        <p className="text-gray-500">管理球桌档案信息和状态</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="card overflow-hidden">
            <div className="relative h-40">
              <img
                src={table.photo}
                alt={table.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 right-3">
                <TableStatusBadge status={table.status} />
              </div>
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="font-display text-xl font-bold">{table.name}</h3>
              </div>
            </div>

            {editingTable === table.id ? (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开放开始</label>
                    <input
                      type="time"
                      value={editForm.openTimeStart}
                      onChange={(e) => setEditForm({ ...editForm, openTimeStart: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开放结束</label>
                    <input
                      type="time"
                      value={editForm.openTimeEnd}
                      onChange={(e) => setEditForm({ ...editForm, openTimeEnd: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">球网状态</label>
                    <select
                      value={editForm.netStatus}
                      onChange={(e) => setEditForm({ ...editForm, netStatus: e.target.value as NetStatus })}
                      className="input-field"
                    >
                      {netStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">球拍数量</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={editForm.racketCount}
                      onChange={(e) => setEditForm({ ...editForm, racketCount: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingTable(null)}
                    className="flex-1 btn-outline flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    取消
                  </button>
                  <button
                    onClick={() => handleSave(table.id)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">位置</span>
                    <span className="font-medium">{table.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">开放时间</span>
                    <span className="font-medium">
                      {table.openTimeStart} - {table.openTimeEnd}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">球网状态</span>
                    <span
                      className={`font-medium ${
                        table.netStatus === 'good'
                          ? 'text-floor-500'
                          : table.netStatus === 'damaged'
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}
                    >
                      {netStatusOptions.find((o) => o.value === table.netStatus)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">球拍数量</span>
                    <span className="font-medium">{table.racketCount} 副</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-5 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(table)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                    编辑
                  </button>
                  {table.status === 'available' ? (
                    <button
                      onClick={() => handleStatusChange(table.id, 'maintenance')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
                    >
                      <Wrench size={16} />
                      设为维护
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(table.id, 'available')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                    >
                      <Settings size={16} />
                      恢复使用
                    </button>
                  )}
                </div>

                {table.status !== 'disabled' && (
                  <button
                    onClick={() => handleStatusChange(table.id, 'disabled')}
                    className="w-full mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm rounded-full transition-colors"
                  >
                    停用此球桌
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-gray-800 mb-4">状态说明</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {statusOptions.map((status) => (
            <div key={status.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${status.color.replace('hover:', '')}`} />
              <div>
                <div className="font-medium text-gray-800">{status.label}</div>
                <div className="text-xs text-gray-500">
                  {status.value === 'available'
                    ? '球桌可正常预约使用'
                    : status.value === 'maintenance'
                    ? '球桌临时维护，不可预约'
                    : '球桌长期停用，不可预约'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
