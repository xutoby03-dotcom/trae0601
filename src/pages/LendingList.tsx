import { useState, useMemo } from 'react';
import { Plus, Search, RotateCcw, User, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { COAT_SIZES, LABORATORIES } from '../types';
import type { CoatSize } from '../types';
import { formatDate, getDaysOverdue, getTodayStr, addDays } from '../utils/helpers';
import { cn } from '../lib/utils';

export function LendingList() {
  const navigate = useNavigate();
  const {
    coats,
    lendings,
    addLending,
    getAvailableCoats,
  } = useStore();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    coatId: '',
    studentName: '',
    studentId: '',
    course: '',
    teacher: '',
    experimentDate: getTodayStr(),
    expectedReturn: addDays(getTodayStr(), 3),
  });

  const availableCoats = getAvailableCoats();

  const filteredLendings = useMemo(() => {
    return lendings
      .filter((l) => {
        if (filterStatus && l.status !== filterStatus) return false;
        if (searchText) {
          const lower = searchText.toLowerCase();
          const coat = coats.find((c) => c.id === l.coatId);
          return (
            l.studentName.toLowerCase().includes(lower) ||
            l.studentId.toLowerCase().includes(lower) ||
            l.course.toLowerCase().includes(lower) ||
            (coat?.code || '').toLowerCase().includes(lower)
          );
        }
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [lendings, searchText, filterStatus, coats]);

  const handleSubmit = () => {
    if (!formData.coatId || !formData.studentName.trim() || !formData.studentId.trim()) return;
    addLending(formData);
    setIsModalOpen(false);
    setFormData({
      coatId: '',
      studentName: '',
      studentId: '',
      course: '',
      teacher: '',
      experimentDate: getTodayStr(),
      expectedReturn: addDays(getTodayStr(), 3),
    });
  };

  const selectedCoat = coats.find((c) => c.id === formData.coatId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索学生姓名、学号、课程或实验服编号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="active">使用中</option>
            <option value="overdue">已逾期</option>
            <option value="returned">已归还</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={availableCoats.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            新建领用
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">使用中</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {lendings.filter((l) => l.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-50">
              <RotateCcw className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">已逾期</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {lendings.filter((l) => l.status === 'overdue').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-50">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">可领用实验服</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{availableCoats.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实验服</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课程</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实验日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计归还</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLendings.map((lending) => {
                const coat = coats.find((c) => c.id === lending.coatId);
                const daysOverdue = lending.status === 'overdue' ? getDaysOverdue(lending.expectedReturn) : 0;
                return (
                  <tr key={lending.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{coat?.code || '-'}</p>
                      <p className="text-xs text-gray-400">{coat?.size} · {coat?.lab}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{lending.studentName}</p>
                      <p className="text-xs text-gray-400">{lending.studentId}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700">{lending.course}</p>
                      <p className="text-xs text-gray-400">{lending.teacher}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lending.experimentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-500">{formatDate(lending.expectedReturn)}</p>
                      {lending.status === 'overdue' && (
                        <p className="text-xs font-medium text-red-600 mt-0.5">逾期 {daysOverdue} 天</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge type="lending" status={lending.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(lending.status === 'active' || lending.status === 'overdue') && (
                        <button
                          onClick={() => navigate(`/return/${lending.id}`)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            lending.status === 'overdue'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          )}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          归还检查
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLendings.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            暂无领用记录
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建领用登记"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.coatId || !formData.studentName.trim() || !formData.studentId.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              确认领用
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              选择实验服 * <span className="text-xs text-gray-400">（当前可用 {availableCoats.length} 件）</span>
            </label>
            <select
              value={formData.coatId}
              onChange={(e) => setFormData({ ...formData, coatId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择实验服</option>
              {LABORATORIES.map((lab) => {
                const labCoats = availableCoats.filter((c) => c.lab === lab);
                if (labCoats.length === 0) return null;
                return (
                  <optgroup key={lab} label={`${lab} (${labCoats.length})`}>
                    {COAT_SIZES.map((size) => {
                      const sizeCoats = labCoats.filter((c) => c.size === size);
                      if (sizeCoats.length === 0) return null;
                      return sizeCoats.map((coat) => (
                        <option key={coat.id} value={coat.id}>
                          {coat.code} - {size}
                        </option>
                      ));
                    })}
                  </optgroup>
                );
              })}
            </select>
            {selectedCoat && (
              <div className="mt-2 p-2.5 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  已选: <span className="font-medium text-gray-700">{selectedCoat.code}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-medium text-gray-700">{selectedCoat.size}</span>
                  <span className="mx-1.5">·</span>
                  <span className="text-gray-600">{selectedCoat.lab}</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">学生姓名 *</label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="请输入姓名"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">学号 *</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="请输入学号"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">课程名称</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="例如：有机化学实验"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">任课教师</label>
              <input
                type="text"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                placeholder="请输入教师姓名"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">实验日期</label>
              <input
                type="date"
                value={formData.experimentDate}
                onChange={(e) => setFormData({ ...formData, experimentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">预计归还日期</label>
              <input
                type="date"
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
