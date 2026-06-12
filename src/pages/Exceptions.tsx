import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Edit2, X, Search, DollarSign, Clock, User } from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { exceptionsApi, borrowsApi, roomsApi } from '../services/api.js';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { ExceptionRecord, ExceptionForm, ExceptionType, ExceptionStatus } from '../../shared/types.js';

export default function ExceptionsPage() {
  const { exceptions, fetchExceptions, loading, rooms, fetchRooms, borrows, fetchBorrows } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingException, setEditingException] = useState<ExceptionRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState<ExceptionForm>({
    roomId: 0,
    borrowId: undefined,
    type: 'key_lost',
    description: '',
    measure: '',
    compensation: 0,
    status: 'pending',
  });

  useEffect(() => {
    fetchExceptions();
    fetchRooms();
    fetchBorrows();
  }, [fetchExceptions, fetchRooms, fetchBorrows]);

  const openCreateModal = () => {
    setEditingException(null);
    setFormData({
      roomId: 0,
      borrowId: undefined,
      type: 'key_lost',
      description: '',
      measure: '',
      compensation: 0,
      status: 'pending',
    });
    setShowModal(true);
  };

  const openEditModal = (exception: ExceptionRecord) => {
    setEditingException(exception);
    setFormData({
      roomId: exception.roomId,
      borrowId: exception.borrowId,
      type: exception.type,
      description: exception.description,
      measure: exception.measure,
      compensation: exception.compensation,
      status: exception.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingException) {
        await exceptionsApi.update(editingException.id, formData);
      } else {
        await exceptionsApi.create(formData);
      }
      setShowModal(false);
      fetchExceptions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredExceptions = exceptions.filter(
    (e) =>
      e.roomName.includes(searchText) ||
      e.description.includes(searchText),
  );

  const getTypeLabel = (type: ExceptionType) => {
    switch (type) {
      case 'key_lost':
        return '钥匙丢失';
      case 'room_damage':
        return '房间损坏';
      case 'other':
        return '其他';
      default:
        return type;
    }
  };

  const getTypeStyle = (type: ExceptionType) => {
    switch (type) {
      case 'key_lost':
        return 'bg-red-100 text-red-700';
      case 'room_damage':
        return 'bg-amber-100 text-amber-700';
      case 'other':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: ExceptionStatus) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'resolved':
        return '已解决';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: ExceptionStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-amber-100 text-amber-700';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const roomBorrows = borrows.filter((b) => b.roomId === formData.roomId && b.status !== 'returned');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索房间或异常描述..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          登记异常
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredExceptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">暂无异常记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExceptions.map((exception) => (
            <div
              key={exception.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeStyle(exception.type)}`}>
                    {getTypeLabel(exception.type)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(exception.status)}`}>
                    {getStatusLabel(exception.status)}
                  </span>
                </div>
                <button
                  onClick={() => openEditModal(exception)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-slate-800 mb-2">{exception.roomName}</h3>

              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{exception.description}</p>

              {exception.measure && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-500 mb-1">处理措施</p>
                  <p className="text-sm text-slate-700">{exception.measure}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1 text-amber-600 font-medium">
                  <DollarSign className="w-4 h-4" />
                  赔偿 ¥{exception.compensation}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(exception.createdAt), 'MM-dd HH:mm', { locale: zhCN })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {editingException ? '编辑异常记录' : '登记异常'}
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">异常类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'key_lost' as ExceptionType, label: '钥匙丢失' },
                    { value: 'room_damage' as ExceptionType, label: '房间损坏' },
                    { value: 'other' as ExceptionType, label: '其他' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer text-sm transition-colors ${
                        formData.type === opt.value
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={opt.value}
                        checked={formData.type === opt.value}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as ExceptionType })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">涉及房间</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
                >
                  <option value={0}>请选择房间</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">关联借用（可选）</label>
                <select
                  value={formData.borrowId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      borrowId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
                >
                  <option value="">不关联</option>
                  {roomBorrows.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.activityName} - {b.borrowerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">异常描述</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                  placeholder="请详细描述异常情况"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">处理措施</label>
                <textarea
                  rows={2}
                  value={formData.measure}
                  onChange={(e) => setFormData({ ...formData, measure: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                  placeholder="已采取或计划采取的处理措施"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">赔偿金额</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.compensation}
                    onChange={(e) => setFormData({ ...formData, compensation: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">处理状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ExceptionStatus })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
                  >
                    <option value="pending">待处理</option>
                    <option value="processing">处理中</option>
                    <option value="resolved">已解决</option>
                  </select>
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
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  {editingException ? '保存修改' : '提交登记'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
