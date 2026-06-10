import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Trash2 } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { CATEGORY_LABELS, type ItemCategory } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const ItemEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItemById, addItem, updateItem, deleteItem } = useCleaningStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: 'curtain' as ItemCategory,
    room: '',
    material: '',
    lastCleanDate: formatDate(new Date()),
    suggestedCycleDays: 90,
    canMachineWash: false,
    photos: [] as string[],
    notes: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const item = getItemById(id);
      if (item) {
        setFormData({
          name: item.name,
          category: item.category,
          room: item.room,
          material: item.material,
          lastCleanDate: item.lastCleanDate,
          suggestedCycleDays: item.suggestedCycleDays,
          canMachineWash: item.canMachineWash,
          photos: item.photos,
          notes: item.notes,
        });
      }
    }
  }, [id, isEdit, getItemById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入物品名称');
      return;
    }
    if (!formData.room.trim()) {
      alert('请输入所在房间');
      return;
    }

    if (isEdit && id) {
      updateItem(id, formData);
    } else {
      addItem(formData);
    }
    navigate(-1);
  };

  const handleDelete = () => {
    if (id) {
      deleteItem(id);
      navigate('/items');
    }
  };

  const categories: ItemCategory[] = ['curtain', 'carpet', 'sofaCover', 'acFilter', 'other'];
  const quickCycles = [30, 60, 90, 120, 180, 365];
  const commonRooms = ['客厅', '主卧', '次卧', '儿童房', '书房', '厨房', '卫生间', '阳台'];

  const handleAddPhoto = () => {
    const newPhoto = `https://picsum.photos/seed/${Date.now()}/200/200`;
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isEdit ? '编辑物品' : '添加物品'}
          </h1>
          {isEdit ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1 -mr-1 text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-8">
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="如：客厅窗帘、卧室地毯"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物品类型
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border transition-colors',
                    formData.category === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所在房间 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
              placeholder="如：客厅、主卧"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {commonRooms.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, room }))}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              材质
            </label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData((prev) => ({ ...prev, material: e.target.value }))}
              placeholder="如：棉麻、羊毛、科技布"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上次清洗日期
            </label>
            <input
              type="date"
              value={formData.lastCleanDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastCleanDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              建议清洗周期（天）
            </label>
            <input
              type="number"
              value={formData.suggestedCycleDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  suggestedCycleDays: parseInt(e.target.value) || 0,
                }))
              }
              min="1"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickCycles.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, suggestedCycleDays: days }))}
                  className={cn(
                    'text-xs px-2 py-1 rounded',
                    formData.suggestedCycleDays === days
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              是否可机洗
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canMachineWash"
                  checked={formData.canMachineWash}
                  onChange={() => setFormData((prev) => ({ ...prev, canMachineWash: true }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">是</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="canMachineWash"
                  checked={!formData.canMachineWash}
                  onChange={() => setFormData((prev) => ({ ...prev, canMachineWash: false }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">否</span>
              </label>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              清洗照片
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`照片${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddPhoto}
                className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs mt-1">添加</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              注意事项
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="记录清洗时需要注意的事项..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          {isEdit ? '保存修改' : '添加物品'}
        </button>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              删除后无法恢复，相关的清洗计划也会被删除，确定要删除吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemEdit;
