import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3X3, List } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchBar } from '../components/archives/SearchBar';
import { ArchiveCard } from '../components/archives/ArchiveCard';
import { useAppStore } from '../store/useAppStore';

export function ArchiveList() {
  const navigate = useNavigate();
  const archiveBoxes = useAppStore((s) => s.archiveBoxes);
  const searchFilters = useAppStore((s) => s.searchFilters);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredArchiveBoxes = useMemo(() => {
    return archiveBoxes.filter((b) => {
      if (searchFilters.contractNumber && !b.contractNumber?.includes(searchFilters.contractNumber)) return false;
      if (searchFilters.clientName && !b.clientName?.includes(searchFilters.clientName)) return false;
      if (searchFilters.year && String(b.year) !== String(searchFilters.year)) return false;
      if (searchFilters.cabinetLocation && !b.cabinetLocation.includes(searchFilters.cabinetLocation)) return false;
      if (searchFilters.securityLevel && b.securityLevel !== searchFilters.securityLevel) return false;
      if (searchFilters.status && b.status !== searchFilters.status) return false;
      if (searchFilters.department && b.department !== searchFilters.department) return false;
      return true;
    });
  }, [archiveBoxes, searchFilters]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="档案箱管理"
        subtitle={`共 ${filteredArchiveBoxes.length} 个档案箱，支持多条件搜索与筛选`}
        actions={
          <>
            <div className="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-navy-50 text-navy-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-navy-50 text-navy-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={16} />
              </button>
            </div>
            <button onClick={() => navigate('/archives/new')} className="btn-primary">
              <Plus size={16} />
              新增档案箱
            </button>
          </>
        }
      />

      <SearchBar />

      {filteredArchiveBoxes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Grid3X3 size={28} />
          </div>
          <p className="text-navy-700 font-medium mb-1">未找到匹配的档案箱</p>
          <p className="text-sm text-gray-500">请尝试调整搜索条件或筛选器</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredArchiveBoxes.map((box, idx) => (
            <ArchiveCard key={box.id} box={box} index={idx} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">档案箱编号</th>
                <th className="px-5 py-3 font-medium">客户/合同</th>
                <th className="px-5 py-3 font-medium">柜位</th>
                <th className="px-5 py-3 font-medium">年份</th>
                <th className="px-5 py-3 font-medium">部门</th>
                <th className="px-5 py-3 font-medium">密级</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">保管人</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchiveBoxes.map((box, idx) => (
                <tr
                  key={box.id}
                  onClick={() => navigate(`/archives/${box.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <td className="px-5 py-3.5 font-medium text-navy-800">{box.boxNumber}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {box.clientName || '—'}
                    {box.contractNumber && <span className="text-xs text-gray-400 ml-1">({box.contractNumber})</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{box.cabinetLocation}</td>
                  <td className="px-5 py-3.5 text-gray-600">{box.year}</td>
                  <td className="px-5 py-3.5 text-gray-600">{box.department}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${box.securityLevel === '绝密' ? 'bg-red-50 text-red-700' : box.securityLevel === '机密' ? 'bg-gold-50 text-gold-700' : box.securityLevel === '内部' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {box.securityLevel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${box.status === '在库' ? 'bg-green-50 text-green-700' : box.status === '借出' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mr-1" />
                      {box.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{box.custodian}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
