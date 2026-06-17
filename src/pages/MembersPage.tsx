import { useState } from 'react';
import { Plus, Edit2, Trash2, User, Ruler, Scale, Footprints, Award, Eye, Snowflake, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  SKI_LEVEL_LABELS,
  COLD_TOLERANCE_LABELS,
} from '@/types';
import type { Member, SkiLevel, ColdTolerance } from '@/types';
import { cn } from '@/lib/utils';

const emptyMember: Omit<Member, 'id'> = {
  name: '',
  height: 170,
  weight: 60,
  shoeSize: 40,
  skiLevel: 'beginner',
  hasMyopia: false,
  coldTolerance: 'medium',
  note: '',
};

export default function MembersPage() {
  const { members, addMember, updateMember, deleteMember } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Omit<Member, 'id'>>(emptyMember);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData(emptyMember);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
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

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这位成员吗？')) {
      deleteMember(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">团队成员</h2>
          <p className="text-slate-500 mt-1">管理滑雪团队的成员信息与身体数据</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          添加成员
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{member.name}</h3>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      member.skiLevel === 'expert' && 'bg-amber-100 text-amber-700',
                      member.skiLevel === 'advanced' && 'bg-blue-100 text-blue-700',
                      member.skiLevel === 'intermediate' && 'bg-green-100 text-green-700',
                      member.skiLevel === 'beginner' && 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {SKI_LEVEL_LABELS[member.skiLevel]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(member)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={<Ruler className="w-4 h-4" />}
                label="身高"
                value={`${member.height} cm`}
              />
              <InfoRow
                icon={<Scale className="w-4 h-4" />}
                label="体重"
                value={`${member.weight} kg`}
              />
              <InfoRow
                icon={<Footprints className="w-4 h-4" />}
                label="鞋码"
                value={`${member.shoeSize} 码`}
              />
              <InfoRow
                icon={<Eye className="w-4 h-4" />}
                label="视力"
                value={member.hasMyopia ? '近视' : '正常'}
              />
              <InfoRow
                icon={<Snowflake className="w-4 h-4" />}
                label="耐寒"
                value={COLD_TOLERANCE_LABELS[member.coldTolerance]}
              />
            </div>

            {member.note && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">{member.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingMember ? '编辑成员' : '添加成员'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="请输入姓名"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    鞋码
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.shoeSize}
                    onChange={(e) =>
                      setFormData({ ...formData, shoeSize: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    滑雪水平
                  </label>
                  <select
                    value={formData.skiLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skiLevel: e.target.value as SkiLevel,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  >
                    <option value="beginner">初学者</option>
                    <option value="intermediate">中级</option>
                    <option value="advanced">高级</option>
                    <option value="expert">专家</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    是否近视
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMyopia: true })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium transition-all',
                        formData.hasMyopia
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      )}
                    >
                      是
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMyopia: false })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium transition-all',
                        !formData.hasMyopia
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      )}
                    >
                      否
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    怕冷程度
                  </label>
                  <select
                    value={formData.coldTolerance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coldTolerance: e.target.value as ColdTolerance,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                  >
                    <option value="low">怕冷</option>
                    <option value="medium">一般</option>
                    <option value="high">耐寒</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  备注
                </label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  rows={2}
                  placeholder="有什么需要注意的..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all"
                >
                  {editingMember ? '保存修改' : '添加成员'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
        {icon}
      </div>
      <span className="text-slate-500 flex-1">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
