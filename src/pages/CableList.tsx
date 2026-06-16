import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CableCard } from '@/components/features/cable/CableCard';
import { CableFilter } from '@/components/features/cable/CableFilter';
import { useAppStore } from '@/store/useAppStore';
import type { InterfaceType, CableStatus } from '@/types';

export default function CableList() {
  const { cables, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [interfaceFilter, setInterfaceFilter] = useState<InterfaceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CableStatus | 'all'>('all');

  const filteredCables = useMemo(() => {
    return cables.filter(cable => {
      const matchesSearch = !search || 
        cable.code.toLowerCase().includes(search.toLowerCase()) ||
        cable.defaultLocation.toLowerCase().includes(search.toLowerCase());
      
      const matchesInterface = interfaceFilter === 'all' || cable.interfaceType === interfaceFilter;
      const matchesStatus = statusFilter === 'all' || cable.status === statusFilter;

      return matchesSearch && matchesInterface && matchesStatus;
    });
  }, [cables, search, interfaceFilter, statusFilter]);

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">线材档案</h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {cables.length} 条线材 · {filteredCables.length} 条符合筛选条件
            </p>
          </div>
          {currentUser?.isAdmin && (
            <Link
              to="/cables/new"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增线材
            </Link>
          )}
        </div>

        <CableFilter
          search={search}
          onSearchChange={setSearch}
          interfaceFilter={interfaceFilter}
          onInterfaceChange={setInterfaceFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {filteredCables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCables.map(cable => (
              <CableCard key={cable.id} cable={cable} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无符合条件的线材</h3>
            <p className="text-gray-500 text-sm">尝试调整筛选条件或添加新的线材</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
