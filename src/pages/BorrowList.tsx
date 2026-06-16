import { useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CableCard } from '@/components/features/cable/CableCard';
import { useAppStore } from '@/store/useAppStore';
import type { InterfaceType } from '@/types';
import { INTERFACE_TYPE_LABELS } from '@/types';

export default function BorrowList() {
  const { cables, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [interfaceFilter, setInterfaceFilter] = useState<InterfaceType | 'all'>('all');

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  const availableCables = useMemo(() => {
    return cables.filter(cable => {
      const isAvailable = cable.status === 'available';
      const matchesSearch = !search || 
        cable.code.toLowerCase().includes(search.toLowerCase()) ||
        cable.defaultLocation.toLowerCase().includes(search.toLowerCase());
      const matchesInterface = interfaceFilter === 'all' || cable.interfaceType === interfaceFilter;
      return isAvailable && matchesSearch && matchesInterface;
    });
  }, [cables, search, interfaceFilter]);

  const interfaceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cables.filter(c => c.status === 'available').forEach(c => {
      counts[c.interfaceType] = (counts[c.interfaceType] || 0) + 1;
    });
    return counts;
  }, [cables]);

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">可借线材</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {availableCables.length} 条可借用线材
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {(Object.keys(INTERFACE_TYPE_LABELS) as InterfaceType[]).map(type => (
            <div key={type} className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{INTERFACE_TYPE_LABELS[type]}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{interfaceCounts[type] || 0} 条</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索线材编号、位置..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={interfaceFilter}
                onChange={(e) => setInterfaceFilter(e.target.value as InterfaceType | 'all')}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">全部接口</option>
                {(Object.keys(INTERFACE_TYPE_LABELS) as InterfaceType[]).map(type => (
                  <option key={type} value={type}>{INTERFACE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {availableCables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableCables.map(cable => (
              <div key={cable.id} className="relative">
                <CableCard cable={cable} />
                <Link
                  to={`/borrow/${cable.id}`}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  style={{ opacity: 1 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无可用线材</h3>
            <p className="text-gray-500 text-sm">当前筛选条件下没有可用的线材</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
