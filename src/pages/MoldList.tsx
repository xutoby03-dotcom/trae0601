import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cake, Plus, Filter, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { useAppStore } from '../store/index.js';
import { api } from '../lib/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { MoldType, MoldMaterial, MoldStatus } from '../../shared/types.js';
import { MoldTypeLabels, MoldMaterialLabels } from '../../shared/types.js';

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'toast_box', label: '吐司盒' },
  { value: 'pound_cake', label: '磅蛋糕模' },
  { value: 'mousse_ring', label: '慕斯圈' },
  { value: 'other', label: '其他' },
];

const materialOptions = [
  { value: '', label: '全部材质' },
  { value: 'aluminum', label: '铝合金' },
  { value: 'stainless_steel', label: '不锈钢' },
  { value: 'non_stick', label: '不粘涂层' },
  { value: 'silicone', label: '硅胶' },
  { value: 'other', label: '其他' },
];

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'available', label: '可用' },
  { value: 'borrowed', label: '借用中' },
  { value: 'maintenance', label: '维护中' },
  { value: 'damaged', label: '已损坏' },
  { value: 'lost', label: '已遗失' },
];

export default function MoldList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { molds, loading, fetchMolds } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    material: searchParams.get('material') || '',
    status: searchParams.get('status') || '',
  });

  useEffect(() => {
    const params: any = {};
    if (filters.type) params.type = filters.type;
    if (filters.material) params.material = filters.material;
    if (filters.status) params.status = filters.status;
    fetchMolds(params);
  }, [filters, fetchMolds]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params: any = {};
    if (newFilters.type) params.type = newFilters.type;
    if (newFilters.material) params.material = newFilters.material;
    if (newFilters.status) params.status = newFilters.status;
    setSearchParams(params);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除模具"${name}"吗？`)) return;
    try {
      await api.molds.delete(id);
      toast.success('删除成功');
      fetchMolds(filters);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleBorrow = (mold: any) => {
    if (mold.availableQuantity <= 0) {
      toast.error('该模具已无可用库存');
      return;
    }
    navigate(`/borrow/new?moldId=${mold.id}`);
  };

  const filteredMolds = molds.filter(mold =>
    mold.name.toLowerCase().includes(searchText.toLowerCase()) ||
    mold.size.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="模具档案"
        subtitle="管理所有模具的基本信息和库存状态"
        icon={<Cake className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate('/molds/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            新增模具
          </button>
        }
      />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索模具名称、尺寸..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters
                ? 'bg-caramel-50 border-caramel-300 text-caramel-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">模具类型</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-caramel-500"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">材质</label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-caramel-500"
              >
                {materialOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-caramel-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading.molds ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMolds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMolds.map((mold, index) => (
            <div
              key={mold.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-caramel-100 to-caramel-200">
                {mold.photoUrl ? (
                  <img
                    src={mold.photoUrl}
                    alt={mold.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-caramel-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={mold.status as MoldStatus} type="mold" />
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-sm text-caramel-700 text-xs px-2 py-1 rounded-full font-medium">
                    {MoldTypeLabels[mold.type as MoldType]}
                  </span>
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                    {mold.size}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">{mold.name}</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-500">
                    材质：<span className="text-gray-700">{MoldMaterialLabels[mold.material as MoldMaterial]}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    库存：
                    <span className={`font-bold ${mold.availableQuantity <= 1 ? 'text-tomato-500' : 'text-matcha-600'}`}>
                      {mold.availableQuantity}/{mold.quantity}
                    </span>
                    <span className="text-gray-400"> 可用</span>
                  </p>
                  {mold.applicableProducts.length > 0 && (
                    <p className="text-sm text-gray-500 line-clamp-1">
                      适用：{mold.applicableProducts.slice(0, 2).join('、')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/molds/${mold.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-caramel-700 bg-caramel-50 rounded-lg hover:bg-caramel-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                  <button
                    onClick={() => navigate(`/molds/${mold.id}/edit`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleBorrow(mold)}
                    disabled={mold.availableQuantity <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-caramel-500 rounded-lg hover:bg-caramel-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    借用
                  </button>
                  <button
                    onClick={() => handleDelete(mold.id, mold.name)}
                    className="inline-flex items-center justify-center w-10 h-10 text-tomato-600 bg-tomato-50 rounded-lg hover:bg-tomato-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <Cake className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无模具数据</h3>
          <p className="text-gray-500 mb-6">点击右上角按钮添加第一个模具</p>
          <button
            onClick={() => navigate('/molds/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-caramel-500 text-white rounded-xl font-medium hover:bg-caramel-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新增模具
          </button>
        </div>
      )}
    </div>
  );
}
