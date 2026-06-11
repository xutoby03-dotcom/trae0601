import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Priority, MeetingType, PRIORITY_LABELS, MEETING_TYPE_LABELS, DEPARTMENTS } from '@/types';

export interface TodoFilterValues {
  keyword: string;
  assignee: string;
  department: string;
  priority: Priority | '';
  meetingType: MeetingType | '';
}

interface TodoFilterProps {
  value: TodoFilterValues;
  onChange: (value: TodoFilterValues) => void;
  className?: string;
}

const defaultFilter: TodoFilterValues = {
  keyword: '',
  assignee: '',
  department: '',
  priority: '',
  meetingType: '',
};

export default function TodoFilter({ value, onChange, className }: TodoFilterProps) {
  const [expanded, setExpanded] = useState(true);

  const handleChange = <K extends keyof TodoFilterValues>(key: K, val: TodoFilterValues[K]) => {
    onChange({ ...value, [key]: val });
  };

  const handleReset = () => {
    onChange(defaultFilter);
  };

  const hasActiveFilters =
    value.keyword ||
    value.assignee ||
    value.department ||
    value.priority ||
    value.meetingType;

  const activeFilterCount = [
    value.keyword,
    value.assignee,
    value.department,
    value.priority,
    value.meetingType,
  ].filter(Boolean).length;

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-card', className)}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索待办标题、负责人、交付物..."
              value={value.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            {value.keyword && (
              <button
                onClick={() => handleChange('keyword', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>筛选</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-accent-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              重置
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">负责人</label>
            <input
              type="text"
              placeholder="请输入负责人姓名"
              value={value.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">部门</label>
            <select
              value={value.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">全部部门</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
            <select
              value={value.priority}
              onChange={(e) => handleChange('priority', e.target.value as Priority | '')}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">全部优先级</option>
              {(Object.keys(PRIORITY_LABELS) as Priority[]).map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">会议类型</label>
            <select
              value={value.meetingType}
              onChange={(e) => handleChange('meetingType', e.target.value as MeetingType | '')}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">全部类型</option>
              {(Object.keys(MEETING_TYPE_LABELS) as MeetingType[]).map((type) => (
                <option key={type} value={type}>
                  {MEETING_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
