import { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Member } from '@/types';

interface MemberFormProps {
  member?: Member | null;
  onSubmit: (data: Omit<Member, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    shoeSize: '',
    canSwim: false,
    allergies: '',
    emergencyContact: '',
    valuableNotes: '',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        shoeSize: member.shoeSize,
        canSwim: member.canSwim,
        allergies: member.allergies,
        emergencyContact: member.emergencyContact,
        valuableNotes: member.valuableNotes,
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入姓名');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {member ? '编辑成员' : '新增成员'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">姓名 *</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="form-label">鞋码</label>
              <input
                type="text"
                className="input-field"
                value={formData.shoeSize}
                onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                placeholder="如：42"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="form-label mb-0">是否会游泳</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, canSwim: !formData.canSwim })}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                formData.canSwim ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  formData.canSwim ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {formData.canSwim ? '是' : '否'}
            </span>
          </div>

          <div>
            <label className="form-label">过敏情况</label>
            <input
              type="text"
              className="input-field"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="如：青霉素过敏、海鲜过敏"
            />
          </div>

          <div>
            <label className="form-label">紧急联系人</label>
            <input
              type="text"
              className="input-field"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="如：李四 13800138000"
            />
          </div>

          <div>
            <label className="form-label">贵重物品备注</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={formData.valuableNotes}
              onChange={(e) => setFormData({ ...formData, valuableNotes: e.target.value })}
              placeholder="如：iPhone 15 Pro、丰田车钥匙、现金500元"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {member ? '保存修改' : '添加成员'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
