import { useEffect, useState } from 'react';
import { X, Camera, ImagePlus } from 'lucide-react';
import type { Stroller, StrollerStatus } from '@/types';
import { useStrollerStore } from '@/store/useStrollerStore';
import { BUILDINGS, LOCATIONS, COLOR_OPTIONS, MODEL_OPTIONS } from '@/utils/constants';
import { readFileAsDataURL, cn } from '@/utils/helpers';

export default function StrollerForm() {
  const { activeFormStrollerId, setActiveForm, getStrollerById, addStroller, updateStroller } =
    useStrollerStore();
  const editing = activeFormStrollerId ? getStrollerById(activeFormStrollerId) : null;

  const initialForm = {
    building: '1栋',
    room: '',
    ownerName: '',
    phone: '',
    model: MODEL_OPTIONS[0],
    color: COLOR_OPTIONS[0],
    location: LOCATIONS[0],
    isLongTerm: false,
    photos: [] as string[],
    status: 'normal' as StrollerStatus,
  };

  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeFormStrollerId === '') {
      setForm({ ...initialForm });
    } else if (editing) {
      setForm({
        building: editing.building,
        room: editing.room,
        ownerName: editing.ownerName,
        phone: editing.phone,
        model: editing.model,
        color: editing.color,
        location: editing.location,
        isLongTerm: editing.isLongTerm,
        photos: editing.photos,
        status: editing.status,
      });
    }
  }, [activeFormStrollerId, editing]);

  if (!activeFormStrollerId && activeFormStrollerId !== null) {
    // wait for modal trigger
  }
  const isOpen = activeFormStrollerId !== null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => readFileAsDataURL(f)));
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room.trim() || !form.ownerName.trim() || !form.phone.trim()) {
      alert('请填写完整的楼栋房号、车主姓名和联系电话');
      return;
    }
    if (editing) {
      updateStroller(editing.id, form);
    } else {
      addStroller(form);
    }
    setActiveForm(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up"
      onClick={() => setActiveForm(null)}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editing ? '编辑车辆信息' : '登记新车辆'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {editing ? '修改婴儿车登记信息' : '填写婴儿车详细信息，建立归属档案'}
            </p>
          </div>
          <button
            onClick={() => setActiveForm(null)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">楼栋号 *</label>
              <select
                className="input"
                value={form.building}
                onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">房号 *</label>
              <input
                className="input"
                placeholder="如 1203"
                value={form.room}
                onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">车主姓名 *</label>
              <input
                className="input"
                placeholder="如 张女士"
                value={form.ownerName}
                onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">联系电话 *</label>
              <input
                className="input"
                placeholder="如 13800138000"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">车型</label>
              <select
                className="input"
                value={form.model}
                onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">颜色</label>
              <select
                className="input"
                value={form.color}
                onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">停放位置</label>
            <select
              className="input"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {(form.location === '消防通道A区' || form.location === '消防通道B区') && (
              <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                <Camera className="w-3 h-3" />
                注意：此位置为消防通道区域，禁止长期停放
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, isLongTerm: !p.isLongTerm }))}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                form.isLongTerm ? 'bg-brand-600' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  form.isLongTerm ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
            <div>
              <div className="text-sm font-medium text-slate-700">是否长期停放</div>
              <div className="text-xs text-slate-500">
                开启后，此车辆会进入「长期停放」观察名单
              </div>
            </div>
          </div>

          {editing && (
            <div>
              <label className="label">当前状态</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StrollerStatus }))}
              >
                <option value="normal">正常</option>
                <option value="blocking">挡路</option>
                <option value="pending">待联系</option>
                <option value="moved">已挪走</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">车辆照片</label>
            <div className="grid grid-cols-4 gap-3">
              {form.photos.map((p, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group"
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 flex flex-col items-center justify-center cursor-pointer transition-all text-slate-400 hover:text-brand-600">
                {uploading ? (
                  <div className="text-xs">上传中...</div>
                ) : (
                  <>
                    <ImagePlus className="w-7 h-7 mb-1" />
                    <span className="text-xs font-medium">添加照片</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" className="btn-secondary" onClick={() => setActiveForm(null)}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              {editing ? '保存修改' : '提交登记'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
