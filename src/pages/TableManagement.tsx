import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Clock, Sun, Gamepad2, X, Check, ImageOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { TableData, CreateTableRequest } from '@shared/types';

const TablePhoto = ({ photo, tableNumber, size = 'md' }: { photo?: string; tableNumber: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg text-xs',
    md: 'w-14 h-14 rounded-xl text-sm',
    lg: 'w-20 h-20 rounded-2xl text-base',
  };
  if (photo) {
    return (
      <img
        src={photo}
        alt={tableNumber}
        className={`${sizeClasses[size]} object-cover bg-gray-100 flex-shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const sibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = 'flex';
        }}
      />
    );
  }
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-warm-200 to-warm-300 flex items-center justify-center text-warm-600 font-semibold flex-shrink-0`}>
      {tableNumber.charAt(0)}
    </div>
  );
};

export default function TableManagement() {
  const { tables, fetchTables, createTable, updateTable, deleteTable } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [formData, setFormData] = useState<CreateTableRequest>({
    tableNumber: '',
    capacity: 4,
    isWindow: false,
    isMahjong: false,
    openTime: '08:00',
    closeTime: '22:00',
    photo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleOpenAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: 4,
      isWindow: false,
      isMahjong: false,
      openTime: '08:00',
      closeTime: '22:00',
      photo: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (table: TableData) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      isWindow: table.isWindow,
      isMahjong: table.isMahjong,
      openTime: table.openTime,
      closeTime: table.closeTime,
      photo: table.photo,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingTable) {
        const result = await updateTable(editingTable.id, formData);
        if (!result) {
          setError('更新失败，请重试');
        } else {
          setShowModal(false);
        }
      } else {
        const result = await createTable(formData);
        if ('error' in result) {
          setError(result.error);
        } else {
          setShowModal(false);
        }
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, tableNumber: string) => {
    if (confirm(`确定要删除桌位 ${tableNumber} 吗？`)) {
      await deleteTable(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">桌位管理</h1>
          <p className="text-gray-500 mt-1">共 {tables.length} 个桌位</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          添加桌位
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">照片</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">桌号</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">容量</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">设施</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">开放时间</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tables.map(table => (
                <tr key={table.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <TablePhoto photo={table.photo} tableNumber={table.tableNumber} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800 text-lg">{table.tableNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={16} />
                      <span>{table.capacity} 人</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {table.isWindow && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
                          <Sun size={12} />靠窗
                        </span>
                      )}
                      {table.isMahjong && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                          <Gamepad2 size={12} />麻将桌
                        </span>
                      )}
                      {!table.isWindow && !table.isMahjong && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>{table.openTime} - {table.closeTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(table)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(table.id, table.tableNumber)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
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

        {tables.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>暂无桌位，点击右上角添加</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full animate-slide-up">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTable ? '编辑桌位' : '添加桌位'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">桌号</label>
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, tableNumber: e.target.value }))}
                  placeholder="如 A01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">容纳人数</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isWindow: !prev.isWindow }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.isWindow
                      ? 'border-blue-400 bg-blue-50 text-blue-600'
                      : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <Sun size={24} />
                  <span className="font-medium">靠窗</span>
                  {formData.isWindow && <Check size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isMahjong: !prev.isMahjong }))}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.isMahjong
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <Gamepad2 size={24} />
                  <span className="font-medium">麻将桌</span>
                  {formData.isMahjong && <Check size={16} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">照片地址</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.photo || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-1">填入图片 URL，留空显示默认占位</p>
                  </div>
                  <div className="flex-shrink-0">
                    <TablePhoto photo={formData.photo} tableNumber={formData.tableNumber || 'A'} size="lg" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-xl shadow-lg transition-all"
                >
                  {submitting ? '保存中...' : (editingTable ? '保存修改' : '添加')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
