import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Grid3X3, List, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { costumeApi, type CostumeQuery } from '../services/costumeService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Costume } from '../../shared/types';
import { useAppStore } from '../stores/appStore';

export default function CostumeList() {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState<CostumeQuery>({
    page: 1,
    pageSize: 12,
    search: '',
    status: '',
  });
  const { refreshOverview } = useAppStore();

  useEffect(() => {
    loadCostumes();
  }, [query]);

  const loadCostumes = async () => {
    setLoading(true);
    try {
      const result = await costumeApi.getList(query);
      setCostumes(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load costumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setQuery((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这套服装吗？')) return;
    try {
      await costumeApi.remove(id);
      await refreshOverview();
      loadCostumes();
    } catch (error) {
      console.error('Failed to delete costume:', error);
    }
  };

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'available', label: '可借用' },
    { value: 'borrowed', label: '已借出' },
    { value: 'pending', label: '待处理' },
    { value: 'washing', label: '待清洗' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">服装档案</h1>
          <p className="text-gray-500 mt-1">共 {total} 套服装</p>
        </div>
        <Link to="/costumes/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            新增服装
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64 max-w-md">
            <Input
              placeholder="搜索服装编号、名称、节目..."
              value={query.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={query.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4" />
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {costumes.map((costume) => (
            <div
              key={costume.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {costume.photo_url ? (
                  <img
                    src={costume.photo_url}
                    alt={costume.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-4xl">👗</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={costume.status} />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Link
                    to={`/costumes/${costume.id}`}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/costumes/${costume.id}/edit`}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(costume.id)}
                    className="p-2 bg-white rounded-full text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">{costume.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">编号：{costume.id}</p>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-gray-500">尺码：{costume.size}</span>
                  <span className="text-gray-500">使用 {costume.use_count} 次</span>
                </div>
                {costume.program && (
                  <p className="text-xs text-gray-400 mt-2 truncate">节目：{costume.program}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">服装</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">编号</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">尺码</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">适用节目</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">使用次数</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {costumes.map((costume) => (
                <tr key={costume.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        {costume.photo_url ? (
                          <img src={costume.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">👗</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{costume.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{costume.id}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{costume.size}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{costume.program || '-'}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{costume.use_count} 次</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={costume.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/costumes/${costume.id}`}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/costumes/${costume.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(costume.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {costumes.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👕</div>
          <p className="text-gray-500 mb-4">暂无服装数据</p>
          <Link to="/costumes/new">
            <Button leftIcon={<Plus className="w-4 h-4" />}>添加第一套服装</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
