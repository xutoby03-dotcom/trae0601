import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SURGERY_TYPE_LABELS, SurgeryType, CaseStatus } from '@/types';
import { formatDate } from '@/utils/date';

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  active: '进行中',
  closed: '已结案',
};

const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  active: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
};

export default function Cases() {
  const navigate = useNavigate();
  const { cases } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<SurgeryType | ''>('');

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        !searchKeyword ||
        c.petName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.ownerName.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchType = !filterType || c.surgeryType === filterType;
      return matchSearch && matchType;
    });
  }, [cases, searchKeyword, filterType]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">病例档案</h1>
        <p className="text-sm text-gray-500 mt-1">管理所有宠物术后病例</p>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索宠物名或主人姓名"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SurgeryType | '')}
              className="input-field w-auto min-w-[140px]"
            >
              <option value="">全部手术类型</option>
              {Object.entries(SURGERY_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/cases/new')}>
            <Plus className="w-4 h-4" />
            新建病例
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  宠物名
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  主人
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系电话
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  手术类型
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  主治医生
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出院日期
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    暂无病例数据
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{item.petName}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.ownerName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.ownerPhone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {SURGERY_TYPE_LABELS[item.surgeryType]}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.doctor}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(item.dischargeDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CASE_STATUS_COLORS[item.status]}`}
                      >
                        {CASE_STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/cases/${item.id}`)}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                      >
                        查看详情
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
