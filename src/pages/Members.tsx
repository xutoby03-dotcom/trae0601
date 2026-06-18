import { useState } from 'react';
import { Plus, Edit2, Trash2, Ruler, Footprints, Eye, Waves, AlertCircle, Phone } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { Member, SwimLevel } from '@/types';
import { SWIM_LEVEL_LABELS } from '@/types';

const emptyMember: Omit<Member, 'id'> = {
  name: '',
  height: 170,
  footSize: 40,
  isMyopia: false,
  myopiaDegree: 0,
  swimLevel: 'intermediate',
  allergies: '',
  emergencyContact: '',
  avatar: '🧑',
};

const avatarOptions = ['🧑', '👩', '🧔', '👧', '👦', '🧓', '👨', '👵'];

const swimLevelOptions: { value: SwimLevel; label: string }[] = [
  { value: 'beginner', label: '初学者' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' },
  { value: 'professional', label: '专业' },
];

export default function Members() {
  const { members, addMember, updateMember, deleteMember, getMemberEquipment } =
    useDiveStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Omit<Member, 'id'>>(emptyMember);

  const handleAdd = () => {
    setEditingMember(null);
    setFormData(emptyMember);
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个成员吗？')) {
      deleteMember(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, formData);
    } else {
      addMember(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="成员管理"
        subtitle="管理团队成员信息"
      >
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加成员
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const equipmentCount = getMemberEquipment(member.id).length;
          return (
            <div
              key={member.id}
              className="glass-card rounded-2xl p-6 hover:shadow-float transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-3xl">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-ocean-800">
                      {member.name}
                    </h3>
                    <Badge variant="info" size="sm">
                      {SWIM_LEVEL_LABELS[member.swimLevel]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ocean-500 hover:bg-ocean-100 hover:text-ocean-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-coral-500 hover:bg-coral-50 hover:text-coral-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-ocean-600">
                  <Ruler className="w-4 h-4 text-ocean-400" />
                  <span>身高: {member.height} cm</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ocean-600">
                  <Footprints className="w-4 h-4 text-ocean-400" />
                  <span>脚码: {member.footSize} 码</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ocean-600">
                  <Eye className="w-4 h-4 text-ocean-400" />
                  <span>
                    {member.isMyopia
                      ? `近视 ${member.myopiaDegree}度`
                      : '视力正常'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ocean-600">
                  <Waves className="w-4 h-4 text-ocean-400" />
                  <span>已分配 {equipmentCount} 件装备</span>
                </div>
                {member.allergies && member.allergies !== '无' && (
                  <div className="flex items-center gap-2 text-sm text-coral-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>过敏: {member.allergies}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-ocean-100">
                <div className="flex items-center gap-2 text-xs text-ocean-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>紧急联系人: {member.emergencyContact}</span>
                </div>
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🧑‍🤝‍🧑</div>
            <p className="text-ocean-500 mb-4">还没有添加成员</p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              添加第一位成员
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? '编辑成员' : '添加成员'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                头像
              </label>
              <div className="flex gap-2 flex-wrap">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      formData.avatar === avatar
                        ? 'bg-ocean-500 ring-2 ring-ocean-500 ring-offset-2'
                        : 'bg-ocean-50 hover:bg-ocean-100'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
                placeholder="请输入姓名"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                身高 (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    height: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
                min="100"
                max="220"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                脚码 (码)
              </label>
              <input
                type="number"
                value={formData.footSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footSize: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
                min="30"
                max="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                游泳水平
              </label>
              <select
                value={formData.swimLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    swimLevel: e.target.value as SwimLevel,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              >
                {swimLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMyopia}
                  onChange={(e) =>
                    setFormData({ ...formData, isMyopia: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500"
                />
                <span className="text-sm font-medium text-ocean-700">
                  近视
                </span>
              </label>
              {formData.isMyopia && (
                <div className="ml-4">
                  <input
                    type="number"
                    value={formData.myopiaDegree || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        myopiaDegree: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-24 px-3 py-2 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white text-sm"
                    placeholder="度数"
                    min="0"
                    max="2000"
                  />
                  <span className="text-xs text-ocean-500 ml-2">度</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              过敏史
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              placeholder="如：海鲜过敏、青霉素过敏等，没有可填'无'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              紧急联系人
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContact: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              placeholder="请输入紧急联系人电话"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit">
              {editingMember ? '保存修改' : '添加成员'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
