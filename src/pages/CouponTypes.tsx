import { useState } from 'react';
import { Plus, Edit2, Trash2, Settings, Ticket } from 'lucide-react';
import Modal from '@/components/Modal';
import { useCouponTypeStore } from '@/stores/couponTypeStore';
import type { CouponType, CouponTypeCategory } from '@/types';
import { getCouponDisplayText } from '@/utils';

const typeOptions: CouponTypeCategory[] = ['立减券', '满减券', '折扣券'];

const emptyCoupon: Omit<CouponType, 'id' | 'createdAt'> = {
  name: '',
  type: '立减券',
  amount: 50,
  threshold: 0,
  validDays: 30,
  description: '',
};

export default function CouponTypes() {
  const { couponTypes, addCouponType, updateCouponType, deleteCouponType } = useCouponTypeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);
  const [formData, setFormData] = useState<Omit<CouponType, 'id' | 'createdAt'>>(emptyCoupon);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData(emptyCoupon);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: CouponType) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      type: coupon.type,
      amount: coupon.amount,
      threshold: coupon.threshold,
      validDays: coupon.validDays,
      description: coupon.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入券名称');
      return;
    }
    if (formData.amount <= 0) {
      alert('请输入有效金额');
      return;
    }
    if (formData.validDays <= 0) {
      alert('请输入有效天数');
      return;
    }

    if (editingCoupon) {
      updateCouponType(editingCoupon.id, formData);
    } else {
      addCouponType(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCouponType(id);
    setDeleteConfirmId(null);
  };

  const getTypeBadgeClass = (type: CouponTypeCategory) => {
    const map: Record<CouponTypeCategory, string> = {
      '立减券': 'bg-primary-100 text-primary-700',
      '满减券': 'bg-blue-100 text-blue-700',
      '折扣券': 'bg-purple-100 text-purple-700',
    };
    return map[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            券类型配置
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            管理生日券模板，配置面额、门槛和有效期
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          新增券类型
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {couponTypes.map((coupon, index) => (
          <div
            key={coupon.id}
            className="card card-hover p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-gold-400 flex items-center justify-center shadow-soft">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{coupon.name}</h3>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getTypeBadgeClass(coupon.type)}`}>
                    {coupon.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(coupon)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(coupon.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center py-4 bg-gradient-to-r from-primary-50 to-gold-50 rounded-xl mb-4">
              <span className="text-3xl font-display font-bold text-primary-600">
                {getCouponDisplayText(coupon)}
              </span>
              {coupon.threshold > 0 && (
                <p className="text-xs text-gray-500 mt-1">满 {coupon.threshold} 元可用</p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>有效期</span>
                <span className="text-gray-700 font-medium">{coupon.validDays} 天</span>
              </div>
              {coupon.description && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">{coupon.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {couponTypes.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">暂无券类型配置</p>
          <button onClick={handleOpenAdd} className="btn-primary">
            添加第一个券类型
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? '编辑券类型' : '新增券类型'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              券名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="如：生日专属50元立减券"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                券类型
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CouponTypeCategory })
                }
                className="input-field"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                有效期（天）
              </label>
              <input
                type="number"
                value={formData.validDays}
                onChange={(e) =>
                  setFormData({ ...formData, validDays: Number(e.target.value) })
                }
                className="input-field"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {formData.type === '折扣券' ? '折扣（%）' : '金额（元）'}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="input-field"
                min="1"
                max={formData.type === '折扣券' ? 100 : undefined}
                placeholder={formData.type === '折扣券' ? '80 表示8折' : '金额'}
              />
              {formData.type === '折扣券' && (
                <p className="text-xs text-gray-400 mt-1">输入 1-100，如 80 表示 8 折</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                使用门槛（元）
              </label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: Number(e.target.value) })
                }
                className="input-field"
                min="0"
                placeholder="0 表示无门槛"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              描述说明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-20 resize-none"
              placeholder="简短描述券的使用规则或说明"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingCoupon ? '保存修改' : '确认添加'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除该券类型吗？已发放的券记录不会受影响。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="px-6 py-2.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
}
