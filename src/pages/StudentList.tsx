import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Phone, UserCheck, X } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import AllergyBadge from '@/components/allergy/AllergyBadge';
import EmptyState from '@/components/common/EmptyState';
import { ALLERGY_META } from '@/types';
import type { AllergyType } from '@/types';
import { CLASSES } from '@/utils/mockData';

export default function StudentList() {
  const { students, searchStudents, filterByClass, filterByAllergy, deleteStudent } = useStudentStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedAllergy, setSelectedAllergy] = useState<AllergyType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const classes = CLASSES;

  let filteredStudents = searchStudents(searchKeyword);
  if (selectedClass) {
    filteredStudents = filterByClass(selectedClass);
    if (searchKeyword) {
      const searchResults = searchStudents(searchKeyword);
      filteredStudents = filteredStudents.filter((s) => searchResults.some((r) => r.id === s.id));
    }
  }
  if (selectedAllergy) {
    const allergyResults = filterByAllergy(selectedAllergy);
    filteredStudents = filteredStudents.filter((s) => allergyResults.some((r) => r.id === s.id));
  }

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteConfirm(null);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedClass('');
    setSelectedAllergy('');
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索姓名、学号、班级..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary ${showFilters ? 'bg-slate-100' : ''}`}
              >
                <Filter size={16} />
                <span>筛选</span>
                {(selectedClass || selectedAllergy) && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    {(selectedClass ? 1 : 0) + (selectedAllergy ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
            <Link to="/students/new" className="btn-primary">
              <Plus size={16} />
              <span>新增档案</span>
            </Link>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">按班级筛选</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="input"
                >
                  <option value="">全部班级</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">按过敏源筛选</label>
                <select
                  value={selectedAllergy}
                  onChange={(e) => setSelectedAllergy(e.target.value as AllergyType | '')}
                  className="input"
                >
                  <option value="">全部过敏源</option>
                  {Object.entries(ALLERGY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.icon} {meta.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-secondary">
                  <X size={14} />
                  清除筛选
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    学生信息
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    班级
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    过敏源
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    监护人确认
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-info-500 flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{student.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone size={10} />
                            <span>{student.studentNo}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{student.className}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.allergies.map((allergy) => (
                          <AllergyBadge
                            key={allergy.id}
                            type={allergy.type}
                            severity={allergy.severity}
                            size="sm"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.guardianConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                          <UserCheck size={12} />
                          已确认
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600 bg-warning-50 px-2 py-1 rounded-full">
                          待确认
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/students/${student.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-info-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/students/${student.id}`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(student.id)}
                          className="p-2 rounded-lg hover:bg-danger-50 text-slate-500 hover:text-danger-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>共 {filteredStudents.length} 条记录</span>
          </div>
        </div>
      ) : (
        <EmptyState
          title="暂无学生档案"
          description={
            searchKeyword || selectedClass || selectedAllergy
              ? '没有找到符合条件的学生档案，请尝试调整搜索条件'
              : '还没有添加学生过敏档案，点击下方按钮开始创建'
          }
          action={
            !searchKeyword && !selectedClass && !selectedAllergy
              ? { label: '新增档案', onClick: () => (window.location.href = '/students/new') }
              : undefined
          }
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">确认删除</h3>
            <p className="text-sm text-slate-500 mb-5">
              删除后无法恢复，确定要删除该学生的过敏档案吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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
