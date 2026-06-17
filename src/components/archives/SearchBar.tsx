import { Search, X, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DEPARTMENTS, SECURITY_LEVELS, YEARS } from '../../data/mockData';
import type { BoxStatus, SecurityLevel } from '../../types';

export function SearchBar() {
  const { searchFilters, setSearchFilters, resetSearchFilters } = useAppStore();

  const handleChange = (key: string, value: string) => {
    setSearchFilters({ ...searchFilters, [key]: value || undefined });
  };

  const hasFilters = Object.keys(searchFilters).some(
    (k) => searchFilters[k as keyof typeof searchFilters] !== undefined && searchFilters[k as keyof typeof searchFilters] !== ''
  );

  return (
    <div className="card p-5 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="label-base">合同号</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="输入合同号关键字"
              value={searchFilters.contractNumber || ''}
              onChange={(e) => handleChange('contractNumber', e.target.value)}
              className="input-base pl-8"
            />
          </div>
        </div>
        <div>
          <label className="label-base">客户名</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="输入客户名称"
              value={searchFilters.clientName || ''}
              onChange={(e) => handleChange('clientName', e.target.value)}
              className="input-base pl-8"
            />
          </div>
        </div>
        <div>
          <label className="label-base">年份</label>
          <select
            value={searchFilters.year || ''}
            onChange={(e) => handleChange('year', e.target.value)}
            className="input-base"
          >
            <option value="">全部年份</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">柜位</label>
          <input
            type="text"
            placeholder="如 A区-03排"
            value={searchFilters.cabinetLocation || ''}
            onChange={(e) => handleChange('cabinetLocation', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">密级</label>
          <select
            value={searchFilters.securityLevel || ''}
            onChange={(e) => handleChange('securityLevel', e.target.value as SecurityLevel)}
            className="input-base"
          >
            <option value="">全部密级</option>
            {SECURITY_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-base">状态</label>
          <select
            value={searchFilters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as BoxStatus)}
            className="input-base"
          >
            <option value="">全部状态</option>
            <option value="在库">在库</option>
            <option value="借出">借出</option>
            <option value="异常">异常</option>
          </select>
        </div>
        <div>
          <label className="label-base">所属部门</label>
          <select
            value={searchFilters.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="input-base"
          >
            <option value="">全部部门</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          {hasFilters && (
            <button onClick={resetSearchFilters} className="btn-secondary flex-1">
              <X size={14} />
              清空
            </button>
          )}
          <button onClick={resetSearchFilters} className={hasFilters ? 'btn-primary' : 'btn-primary w-full'}>
            <RotateCcw size={14} />
            重置
          </button>
        </div>
      </div>
    </div>
  );
}
