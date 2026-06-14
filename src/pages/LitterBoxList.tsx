import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Edit3, Trash2, Sparkles } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import StatusBadge from '../components/common/StatusBadge';
import DeepCleanBadge from '../components/common/DeepCleanBadge';
import { getBoxStatus } from '../utils/alerts';
import { getBoxDeepCleanStatus } from '../utils/stats';
import { formatRelativeTime } from '../utils/date';
import { cn, generateId } from '../lib/utils';
import { LitterBox, LitterType } from '../types';

const LITTER_TYPES: LitterType[] = ['膨润土', '豆腐砂', '混合砂', '水晶砂', '松木砂', '纸砂'];

interface FormState {
  name: string;
  location: string;
  litterType: LitterType;
  capacity: number;
  cleanIntervalHours: number;
  fullChangeIntervalDays: number;
  catIds: string[];
  photo: string;
}

const initialFormState: FormState = {
  name: '',
  location: '',
  litterType: '膨润土',
  capacity: 10,
  cleanIntervalHours: 12,
  fullChangeIntervalDays: 14,
  catIds: [],
  photo: '',
};

export default function LitterBoxList() {
  const navigate = useNavigate();
  const { litterBoxes, cats, records, members, addLitterBox, updateLitterBox, removeLitterBox, currentMemberId } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<LitterBox | null>(null);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingBox(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (box: LitterBox) => {
    setEditingBox(box);
    setFormData({
      name: box.name,
      location: box.location,
      litterType: box.litterType,
      capacity: box.capacity,
      cleanIntervalHours: box.cleanIntervalHours,
      fullChangeIntervalDays: box.fullChangeIntervalDays,
      catIds: box.catIds,
      photo: box.photo,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBox(null);
    setFormData(initialFormState);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingBox) {
      updateLitterBox(editingBox.id, formData);
    } else {
      addLitterBox({
        ...formData,
        lastFullChange: new Date().toISOString(),
      });
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    removeLitterBox(id);
    setDeleteConfirmId(null);
  };

  const toggleCat = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      catIds: prev.catIds.includes(catId)
        ? prev.catIds.filter((id) => id !== catId)
        : [...prev.catIds, catId],
    }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F0' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: '#5D4E37' }}>
              猫砂盆档案
            </h1>
            <p className="text-sm" style={{ color: '#8B7355' }}>
              管理家中所有猫砂盆的配置信息
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: '#C48E6B' }}
          >
            <Plus size={20} />
            新增猫砂盆
          </button>
        </div>

        {litterBoxes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl" style={{ backgroundColor: '#FDF8F3' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F5EDE0' }}>
              <Sparkles size={40} style={{ color: '#C48E6B' }} />
            </div>
            <p className="text-lg font-medium mb-2" style={{ color: '#5D4E37' }}>
              还没有猫砂盆哦
            </p>
            <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
              点击上方按钮添加第一个猫砂盆吧
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#C48E6B' }}
            >
              <Plus size={18} />
              立即添加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {litterBoxes.map((box) => {
              const statusInfo = getBoxStatus(box, records);
              const boxCats = cats.filter((c) => box.catIds.includes(c.id));

              return (
                <div
                  key={box.id}
                  className="group rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-default"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <div className="relative h-48 overflow-hidden" style={{ backgroundColor: '#F5EDE0' }}>
                    {box.photo ? (
                      <img
                        src={box.photo}
                        alt={box.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles size={48} style={{ color: '#D4B896' }} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <StatusBadge status={statusInfo.status} size="sm" />
                      <DeepCleanBadge status={getBoxDeepCleanStatus(box.id, records, litterBoxes)} size="sm" />
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1.5">
                      <button
                        onClick={() => navigate(`/litter-boxes/${box.id}`)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                        style={{ backgroundColor: '#FFFFFF', color: '#8B7355' }}
                        title="查看详情"
                      >
                        <Sparkles size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(box)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                        style={{ backgroundColor: '#FFFFFF', color: '#C48E6B' }}
                        title="编辑"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(box.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                        style={{ backgroundColor: '#FFFFFF', color: '#D4896A' }}
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: '#5D4E37' }}>
                          {box.name}
                        </h3>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}>
                          📍 {box.location}
                        </div>
                      </div>
                    </div>

                    {boxCats.length > 0 && (
                      <div className="flex items-center mb-4">
                        <div className="flex -space-x-3">
                          {boxCats.slice(0, 4).map((cat) => (
                            <div
                              key={cat.id}
                              className="w-9 h-9 rounded-full border-2 flex items-center justify-center"
                              style={{ borderColor: '#FFFFFF', backgroundColor: '#F5EDE0' }}
                              title={cat.name}
                            >
                              <span className="text-lg leading-none">
                                {cat.avatar || cat.name.charAt(0)}
                              </span>
                            </div>
                          ))}
                          {boxCats.length > 4 && (
                            <div
                              className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                              style={{ borderColor: '#FFFFFF', backgroundColor: '#E8DDD0', color: '#8B7355' }}
                            >
                              +{boxCats.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="ml-3 text-xs" style={{ color: '#8B7355' }}>
                          {boxCats.length} 只猫咪使用
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium" style={{ backgroundColor: '#E8DDD0', color: '#5D4E37' }}>
                        {box.litterType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium" style={{ backgroundColor: '#E8F0E5', color: '#6B8E6B' }}>
                        🪣 {box.capacity}L
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#F5EDE0' }}>
                      <div className="text-xs" style={{ color: '#A89880' }}>
                        上次整换：{formatRelativeTime(box.lastFullChange)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/litter-boxes/${box.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
                        >
                          查看
                        </button>
                        <button
                          onClick={() => openEditModal(box)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                          style={{ backgroundColor: '#FDF0E6', color: '#C48E6B' }}
                        >
                          编辑
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#F5EDE0', backgroundColor: '#FFFFFF' }}>
              <h2 className="text-xl font-bold" style={{ color: '#5D4E37' }}>
                {editingBox ? '编辑猫砂盆' : '新增猫砂盆'}
              </h2>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: '#8B7355' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  名称 <span style={{ color: '#D4896A' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：客厅大号盆"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-opacity-100"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  位置
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：客厅角落"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-opacity-100"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    砂种
                  </label>
                  <select
                    value={formData.litterType}
                    onChange={(e) => setFormData({ ...formData, litterType: e.target.value as LitterType })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all appearance-none cursor-pointer"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  >
                    {LITTER_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    容量 (L)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    清洁间隔 (小时)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.cleanIntervalHours}
                    onChange={(e) => setFormData({ ...formData, cleanIntervalHours: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                    整换间隔 (天)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.fullChangeIntervalDays}
                    onChange={(e) => setFormData({ ...formData, fullChangeIntervalDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#5D4E37' }}>
                  使用猫咪
                </label>
                {cats.length === 0 ? (
                  <p className="text-sm px-4 py-3 rounded-2xl" style={{ backgroundColor: '#FAF6F0', color: '#A89880' }}>
                    暂无猫咪档案，先去添加猫咪吧
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {cats.map((cat) => (
                      <label
                        key={cat.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all',
                          formData.catIds.includes(cat.id)
                            ? 'border-opacity-100'
                            : 'hover:border-opacity-60'
                        )}
                        style={{
                          backgroundColor: formData.catIds.includes(cat.id) ? '#FDF0E6' : '#FAF6F0',
                          borderColor: formData.catIds.includes(cat.id) ? '#C48E6B' : '#F5EDE0',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.catIds.includes(cat.id)}
                          onChange={() => toggleCat(cat.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: '#C48E6B' }}
                        />
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5EDE0' }}>
                          <span className="text-base leading-none">
                            {cat.avatar || cat.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium truncate" style={{ color: '#5D4E37' }}>
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#5D4E37' }}>
                  照片 URL
                </label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg（可选）"
                  className="w-full px-4 py-3 rounded-2xl border-2 outline-none transition-all focus:border-opacity-100"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#F5EDE0', color: '#5D4E37' }}
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-5 border-t" style={{ borderColor: '#F5EDE0', backgroundColor: '#FFFFFF' }}>
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-2xl font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C48E6B' }}
              >
                <Plus size={18} />
                {editingBox ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl shadow-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FDF0E6' }}>
              <Trash2 size={28} style={{ color: '#D4896A' }} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#5D4E37' }}>
              确认删除？
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#8B7355' }}>
              删除后将同时清除该猫砂盆的所有清洁记录，此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-5 py-2.5 rounded-2xl font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#F5EDE0', color: '#8B7355' }}
              >
                再想想
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-5 py-2.5 rounded-2xl font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4896A' }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
