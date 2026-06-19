import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from 'lucide-react';
import { useMemberStore } from '@/store/useMemberStore';
import { cn } from '@/lib/utils';
import { ALLERGY_OPTIONS, RELIGIOUS_DIET_OPTIONS } from '../../../shared/types';

const allergyLabelMap = Object.fromEntries(
  ALLERGY_OPTIONS.map((o) => [o.value, o.label])
);

const religiousLabelMap = Object.fromEntries(
  RELIGIOUS_DIET_OPTIONS.map((o) => [o.value, o.label])
);

export default function MemberList() {
  const { members, loading, fetchMembers, deleteMember, confirmMember } =
    useMemberStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfirmed, setFilterConfirmed] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    const matchesFilter =
      filterConfirmed === 'all' ||
      (filterConfirmed === 'confirmed' && member.confirmed) ||
      (filterConfirmed === 'unconfirmed' && !member.confirmed);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    const success = await deleteMember(id);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const handleConfirm = async (id: string) => {
    await confirmMember(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
            成员档案
          </h1>
          <p className="text-slate-500">
            管理所有参与聚餐的成员信息和饮食禁忌
          </p>
        </div>
        <Link to="/members/new" className="btn-primary">
          <Plus size={18} />
          添加成员
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="搜索姓名或手机号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {(['all', 'confirmed', 'unconfirmed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterConfirmed(filter)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterConfirmed === filter
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Filter size={14} className="inline mr-1" />
                {filter === 'all'
                  ? '全部'
                  : filter === 'confirmed'
                  ? '已确认'
                  : '未确认'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">暂无匹配的成员</p>
            <p className="text-sm text-slate-400">
              尝试调整搜索条件或添加新成员
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    成员
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    联系方式
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    过敏源
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    饮食禁忌
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    饮酒
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    状态
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                            member.confirmed
                              ? 'bg-success-100 text-success-700'
                              : 'bg-warning-100 text-warning-700'
                          )}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.name}
                          </p>
                          {member.notes && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">
                              {member.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4">
                      {member.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {member.allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className="tag bg-danger-50 text-danger-600 border-danger-200"
                            >
                              {allergyLabelMap[allergy] || allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">无</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.religiousDiet ? (
                        <span className="tag bg-primary-50 text-primary-600 border-primary-200">
                          {religiousLabelMap[member.religiousDiet] ||
                            member.religiousDiet}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">无</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'tag',
                          member.drinksAlcohol
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {member.drinksAlcohol ? '喝酒' : '不喝'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.confirmed ? (
                        <span className="inline-flex items-center gap-1 text-success-600 text-sm font-medium">
                          <CheckCircle2 size={16} />
                          已确认
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-warning-600 text-sm font-medium">
                          <Clock size={16} />
                          待确认
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!member.confirmed && (
                          <button
                            onClick={() => handleConfirm(member.id)}
                            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="标记确认"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <Link
                          to={`/members/${member.id}/edit`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(member.id)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="card p-6 max-w-md w-full mx-4 animate-bounce-in">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
              确认删除
            </h3>
            <p className="text-slate-600 mb-6">
              删除后无法恢复，确定要删除该成员吗？
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="btn-danger"
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
