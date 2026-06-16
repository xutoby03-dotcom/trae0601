import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { Badge } from '../../types';
import { BADGE_COLORS, ALLOWED_AREAS } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';

interface BadgeFormProps {
  open: boolean;
  onClose: () => void;
  editingBadge: Badge | null;
}

export const BadgeForm = ({ open, onClose, editingBadge }: BadgeFormProps) => {
  const addBadge = useBadgeStore((s) => s.addBadge);
  const updateBadge = useBadgeStore((s) => s.updateBadge);

  const [form, setForm] = useState({
    number: '',
    color: BADGE_COLORS[0].name,
    colorHex: BADGE_COLORS[0].hex,
    allowedArea: ALLOWED_AREAS[0],
    deposit: 100,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingBadge) {
      setForm({
        number: editingBadge.number,
        color: editingBadge.color,
        colorHex: editingBadge.colorHex,
        allowedArea: editingBadge.allowedArea,
        deposit: editingBadge.deposit,
      });
    } else {
      setForm({
        number: '',
        color: BADGE_COLORS[0].name,
        colorHex: BADGE_COLORS[0].hex,
        allowedArea: ALLOWED_AREAS[0],
        deposit: 100,
      });
    }
    setErrors({});
  }, [editingBadge, open]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleColorSelect = (colorName: string, hex: string) => {
    setForm((prev) => ({ ...prev, color: colorName, colorHex: hex }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.number.trim()) newErrors.number = '请输入工牌编号';
    if (!form.color.trim()) newErrors.color = '请选择工牌颜色';
    if (!form.allowedArea.trim()) newErrors.allowedArea = '请选择可进区域';
    if (form.deposit < 0) newErrors.deposit = '押金不能为负数';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (editingBadge) {
      updateBadge(editingBadge.id, {
        number: form.number.trim(),
        color: form.color,
        colorHex: form.colorHex,
        allowedArea: form.allowedArea,
        deposit: Number(form.deposit),
      });
    } else {
      addBadge({
        number: form.number.trim(),
        color: form.color,
        colorHex: form.colorHex,
        allowedArea: form.allowedArea,
        deposit: Number(form.deposit),
      });
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingBadge ? '编辑工牌' : '新增工牌'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            {editingBadge ? '保存修改' : '创 建'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">工牌编号 *</label>
            <input
              type="text"
              value={form.number}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="如 T-001"
              className={`input-base ${errors.number ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.number && <p className="text-xs text-danger mt-1">{errors.number}</p>}
          </div>
          <div>
            <label className="label-base">押金金额 (元) *</label>
            <input
              type="number"
              min="0"
              step="10"
              value={form.deposit}
              onChange={(e) => handleChange('deposit', Number(e.target.value))}
              className={`input-base ${errors.deposit ? 'border-danger focus:ring-danger/30' : ''}`}
            />
            {errors.deposit && <p className="text-xs text-danger mt-1">{errors.deposit}</p>}
          </div>
        </div>

        <div>
          <label className="label-base">工牌颜色 *</label>
          <div className="flex flex-wrap gap-2">
            {BADGE_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleColorSelect(c.name, c.hex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all duration-200 ${
                  form.colorHex === c.hex
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-md shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-sm text-neutral-700">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-base">可进区域 *</label>
          <select
            value={form.allowedArea}
            onChange={(e) => handleChange('allowedArea', e.target.value)}
            className={`input-base ${errors.allowedArea ? 'border-danger focus:ring-danger/30' : ''}`}
          >
            {ALLOWED_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {errors.allowedArea && (
            <p className="text-xs text-danger mt-1">{errors.allowedArea}</p>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
          <div
            className="w-14 h-20 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: form.colorHex }}
          >
            {form.number || '?'}
          </div>
          <div className="text-sm">
            <p className="text-neutral-500 mb-1">预览</p>
            <p className="text-neutral-700 font-medium">
              {form.allowedArea} · ¥{form.deposit} 押金
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
