import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Phone, Footprints, Waves, AlertCircle, Gem } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MemberForm from '@/components/MemberForm';
import type { Member } from '@/types';

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleSubmit = (data: Omit<Member, 'id' | 'createdAt'>) => {
    if (editingMember) {
      updateMember(editingMember.id, data);
    } else {
      addMember(data);
    }
    setShowForm(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该成员吗？')) {
      deleteMember(id);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10 w-64"
            placeholder="搜索成员姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增成员
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">姓名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">鞋码</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">会游泳</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">过敏情况</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">紧急联系人</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">贵重物品</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的成员' : '暂无成员数据，请点击"新增成员"添加'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-white/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold shadow-md">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Footprints className="w-4 h-4 text-gray-400" />
                        {member.shoeSize || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Waves className={`w-4 h-4 ${member.canSwim ? 'text-cyan-500' : 'text-gray-300'}`} />
                        <span className={member.canSwim ? 'text-green-600' : 'text-gray-400'}>
                          {member.canSwim ? '是' : '否'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {member.allergies && member.allergies !== '无' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-600 text-sm">{member.allergies}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">无</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{member.emergencyContact || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-gray-600 max-w-[150px] truncate">
                          {member.valuableNotes || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}
