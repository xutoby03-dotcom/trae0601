import { useState } from 'react';
import { X, Plus, Trash2, Image, Clock, MapPin, User, Package, AlertCircle } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/lib/utils';
import type { Task, Priority, TaskCategory, TaskStatus } from '@/types';
import { PRIORITY_LABELS, CATEGORY_LABELS, STATUS_LABELS } from '@/types';
import { formatTime } from '@/utils/timeUtils';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task;
}

export function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { addTask, updateTask, people } = useTaskStore();

  const defaultStartTime = editTask
    ? editTask.startTime
    : new Date().toISOString().split('T')[0] + ' 12:00';

  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    category: (editTask?.category || 'other') as TaskCategory,
    priority: (editTask?.priority || 'medium') as Priority,
    startTime: defaultStartTime,
    endTime: editTask?.endTime || '',
    location: editTask?.location || '',
    status: (editTask?.status || 'pending') as TaskStatus,
    assigneeId: editTask?.assigneeId || '',
    backupId: editTask?.backupId || '',
    itemList: editTask?.itemList.map((i) => i.name) || [],
    photos: editTask?.photos || [],
  });

  const [newItem, setNewItem] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = '请输入任务名称';
    if (!formData.startTime) newErrors.startTime = '请选择开始时间';
    if (!formData.location.trim()) newErrors.location = '请输入地点';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      priority: formData.priority,
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      location: formData.location.trim(),
      status: formData.status,
      assigneeId: formData.assigneeId || undefined,
      backupId: formData.backupId || undefined,
      itemList: formData.itemList.filter((i) => i.trim()),
      photos: formData.photos.filter((p) => p.trim()),
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }

    handleClose();
  };

  const handleClose = () => {
    setErrors({});
    setNewItem('');
    setNewPhotoUrl('');
    onClose();
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        itemList: [...prev.itemList, newItem.trim()],
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itemList: prev.itemList.filter((_, i) => i !== index),
    }));
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, newPhotoUrl.trim()],
      }));
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const priorities: Priority[] = ['high', 'medium', 'low'];
  const categories: TaskCategory[] = ['pickup', 'ceremony', 'banquet', 'logistics', 'photo', 'other'];
  const statuses: TaskStatus[] = ['pending', 'claimed', 'confirmed', 'in_progress', 'completed'];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] bg-ivory rounded-2xl shadow-2xl z-50 transition-all duration-300 overflow-hidden',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-rose-gold/10 bg-white/50">
          <h2 className="text-xl font-semibold text-warm-900 font-display">
            {editTask ? '编辑任务' : '新建任务'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5 text-warm-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              <span className="text-wine">*</span> 任务名称
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="例如：接亲堵门游戏"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 transition-all',
                errors.title ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white focus:border-rose-gold'
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              任务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="任务的详细说明..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                优先级
              </label>
              <div className="flex flex-wrap gap-1.5">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    className={cn(
                      'flex-1 px-3 py-2 text-xs rounded-lg transition-all',
                      formData.priority === p
                        ? p === 'high'
                          ? 'bg-wine text-white'
                          : p === 'medium'
                          ? 'bg-rose-gold text-white'
                          : 'bg-warm-200 text-warm-700'
                        : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                    )}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as TaskCategory }))}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                <span className="text-wine">*</span> 开始时间
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input
                  type="datetime-local"
                  value={formData.startTime.replace(' ', 'T').slice(0, 16)}
                  onChange={(e) => {
                    const val = e.target.value.replace('T', ' ');
                    setFormData((prev) => ({ ...prev, startTime: val }));
                  }}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 transition-all',
                    errors.startTime ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white focus:border-rose-gold'
                  )}
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                结束时间
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input
                  type="datetime-local"
                  value={formData.endTime ? formData.endTime.replace(' ', 'T').slice(0, 16) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? e.target.value.replace('T', ' ') : '';
                    setFormData((prev) => ({ ...prev, endTime: val }));
                  }}
                  placeholder="可选"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              <span className="text-wine">*</span> 地点
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="例如：新娘家 / XX酒店宴会厅"
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 transition-all',
                  errors.location ? 'border-red-300 bg-red-50' : 'border-warm-200 bg-white focus:border-rose-gold'
                )}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.location}
              </p>
            )}
          </div>

          {editTask && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                状态
              </label>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: s }))}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full transition-all border',
                      formData.status === s
                        ? 'bg-wine text-white border-wine'
                        : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                    )}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                <User className="inline w-3.5 h-3.5 mr-1" />
                负责人
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigneeId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
              >
                <option value="">待认领</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                备用人
              </label>
              <select
                value={formData.backupId}
                onChange={(e) => setFormData((prev) => ({ ...prev, backupId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
              >
                <option value="">无备用</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              <Package className="inline w-3.5 h-3.5 mr-1" />
              物品清单
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                placeholder="输入物品名称，回车添加"
                className="flex-1 px-4 py-2 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 bg-rose-gold text-white rounded-xl hover:bg-rose-goldDark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.itemList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.itemList.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-50 text-warm-700 text-sm rounded-full border border-warm-200"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-warm-400 hover:text-wine transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              <Image className="inline w-3.5 h-3.5 mr-1" />
              参考照片
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                placeholder="输入图片URL，回车添加"
                className="flex-1 px-4 py-2 rounded-xl border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold transition-all"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-3 py-2 bg-rose-gold text-white rounded-xl hover:bg-rose-goldDark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-warm-100">
                    <img
                      src={photo}
                      alt={`参考图 ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-rose-gold/10 bg-white/50">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-warm-200 text-warm-600 text-sm font-medium hover:bg-warm-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-gold to-rose-goldDark text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            {editTask ? '保存修改' : '创建任务'}
          </button>
        </div>
      </div>
    </>
  );
}
