import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronRight,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useRegistrationStore } from '@/store/registrationStore';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { REGISTRATION_STATUS_MAP } from '@/types';
import { formatDate } from '@/utils/format';
import type { RegistrationStatus } from '@/types';

const statusFilters: { value: 'all' | RegistrationStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'confirmed', label: '已报名' },
  { value: 'waitlist', label: '候补' },
  { value: 'cancelled', label: '已取消' },
  { value: 'completed', label: '已完成' },
];

export default function RegistrationList() {
  const { registrations, cancelRegistration } = useRegistrationStore();
  const { elders } = useElderStore();
  const { courses } = useCourseStore();
  const [statusFilter, setStatusFilter] = useState<'all' | RegistrationStatus>('all');
  const [keyword, setKeyword] = useState('');

  const filteredRegs = registrations
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r => {
      if (!keyword.trim()) return true;
      const elder = elders.find(e => e.id === r.elderId);
      const course = courses.find(c => c.id === r.courseId);
      const lower = keyword.toLowerCase();
      return (
        elder?.name.toLowerCase().includes(lower) ||
        elder?.phone.includes(keyword) ||
        course?.title.toLowerCase().includes(lower)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getElder = (elderId: string) => elders.find(e => e.id === elderId);
  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

  const handleCancel = (id: string) => {
    if (confirm('确定要取消这个报名吗？')) {
      cancelRegistration(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">报名管理</h1>
        <Link to="/registrations/new" className="btn-primary btn-lg">
          <Plus size={20} />
          新增报名
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="搜索老人姓名、电话或课程..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input pl-12"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  statusFilter === filter.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">老人</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">课程</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">特殊需求</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">报名时间</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-neutral-600">状态</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-neutral-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredRegs.map((reg) => {
              const elder = getElder(reg.elderId);
              const course = getCourse(reg.courseId);
              return (
                <tr key={reg.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`/elders/${reg.elderId}`}
                      className="flex items-center gap-3"
                    >
                      {elder && (
                        <>
                          <img
                            src={elder.avatar}
                            alt={elder.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-neutral-800">{elder.name}</p>
                            <p className="text-sm text-neutral-500">{elder.phone}</p>
                          </div>
                        </>
                      )}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/courses/${reg.courseId}`}
                      className="text-neutral-800 hover:text-primary-600 font-medium"
                    >
                      {course?.title || '未知课程'}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {reg.needOneOnOne && (
                        <span className="tag bg-warning-100 text-warning-600 text-xs">一对一</span>
                      )}
                      {reg.withFamily && (
                        <span className="tag bg-primary-100 text-primary-600 text-xs">带家属</span>
                      )}
                      {!reg.needOneOnOne && !reg.withFamily && (
                        <span className="text-sm text-neutral-400">无</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {formatDate(reg.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`tag ${
                      reg.status === 'confirmed' ? 'bg-success-100 text-success-600' :
                      reg.status === 'waitlist' ? 'bg-warning-100 text-warning-600' :
                      reg.status === 'completed' ? 'bg-primary-100 text-primary-600' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {REGISTRATION_STATUS_MAP[reg.status]}
                      {reg.status === 'waitlist' && ` #${reg.waitlistPosition}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(reg.status === 'confirmed' || reg.status === 'waitlist') && (
                        <>
                          <Link
                            to={`/attendance/new?elderId=${reg.elderId}&courseId=${reg.courseId}`}
                            className="text-sm text-success-600 hover:text-success-700 flex items-center gap-1"
                          >
                            <UserCheck size={14} />
                            签到
                          </Link>
                          <button
                            onClick={() => handleCancel(reg.id)}
                            className="text-sm text-red-500 hover:text-red-600"
                          >
                            取消
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRegs.length === 0 && (
          <div className="py-12 text-center">
            <Clock size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-neutral-500">暂无报名记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
