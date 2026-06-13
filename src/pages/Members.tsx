import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import Modal from '@/components/Modal';
import LevelTag from '@/components/LevelTag';
import { useMemberStore } from '@/stores/memberStore';
import type { Member, MemberLevel } from '@/types';
import { maskPhone, formatDateCN } from '@/utils';

const allLevels: MemberLevel[] = ['普通会员', '银卡会员', '金卡会员', '钻石会员'];
const categoryOptions = ['护肤品', '香水', '数码产品', '家居', '服装', '包包', '运动装备', '珠宝', '书籍', '彩妆', '家电', '鞋履', '母婴', '户外用品', '游戏', '首饰', '手表', '皮具'];

const emptyMember: Omit<Member, 'id' | 'createdAt'> = {
  name: '',
  phone: '',
  birthday: '',
  level: '普通会员',
  favoriteCategories: [],
  avatar: '',
};

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useMemberStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<Omit<Member, 'id' | 'createdAt'>>(emptyMember);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (searchKeyword) {
      const lower = searchKeyword.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(lower) ||
          m.phone.includes(searchKeyword)
      );
    }
    if (levelFilter !== 'all') {
      result = result.filter((m) => m.level === levelFilter);
    }
    return result;
  }, [members, searchKeyword, levelFilter]);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData(emptyMember);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      birthday: member.birthday,
      level: member.level,
      favoriteCategories: [...member.favoriteCategories],
      avatar: member.avatar,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入会员姓名');
      return;
    }
    if (!formData.phone.trim()) {
      alert('请输入手机号');
      return;
    }
    if (!formData.birthday) {
      alert('请选择生日');
      return;
    }

    const avatar = formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;

    if (editingMember) {
      updateMember(editingMember.id, { ...formData, avatar });
    } else {
      addMember({ ...formData, avatar });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setDeleteConfirmId(null);
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(cat)
        ? prev.favoriteCategories.filter((c) => c !== cat)
        : [...prev.favoriteCategories, cat],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            会员管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {members.length} 位会员 · {filteredMembers.length} 条结果
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          新增会员
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索会员姓名或手机号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">等级:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="input-field w-36"
            >
              <option value="all">全部等级</option>
              {allLevels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">会员</th>
                <th className="px-6 py-4 font-medium">手机号</th>
                <th className="px-6 py-4 font-medium">生日</th>
                <th className="px-6 py-4 font-medium">等级</th>
                <th className="px-6 py-4 font-medium">常购品类</th>
                <th className="px-6 py-4 font-medium">注册时间</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <span className="font-medium text-gray-800">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {maskPhone(member.phone)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.birthday}
                  </td>
                  <td className="px-6 py-4">
                    <LevelTag level={member.level} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {member.favoriteCategories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                        >
                          {cat}
                        </span>
                      ))}
                      {member.favoriteCategories.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                          +{member.favoriteCategories.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDateCN(member.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(member.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            暂无匹配的会员
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? '编辑会员' : '新增会员'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="请输入手机号"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                生日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                会员等级
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as MemberLevel })}
                className="input-field"
              >
                {allLevels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              常购品类
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => {
                const active = formData.favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              头像链接
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="input-field"
              placeholder="留空将自动生成头像"
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
              {editingMember ? '保存修改' : '确认添加'}
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
          确定要删除该会员吗？删除后无法恢复。
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
