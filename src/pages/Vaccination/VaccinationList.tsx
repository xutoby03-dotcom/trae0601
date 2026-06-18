import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Dog, Cat, PawPrint, AlertCircle, CheckCircle, AlertTriangle, Clock, FileText, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import type { Pet, VaccinationCheckResult, Stay } from '../../../shared/types';
import { SPECIES_NAMES } from '../../../shared/types';

type VerificationStatus = 'all' | 'pending' | 'verified' | 'materials-needed';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'other';

interface PendingItem {
  stay: Stay & { pet: Pet };
  checkResult: VaccinationCheckResult;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function VaccinationList() {
  const navigate = useNavigate();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('all');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPendingList();
  }, []);

  const fetchPendingList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<PendingItem[]>('/vaccination/pending');
      if (res.success) {
        setPendingItems(res.data || []);
      }
    } catch (error) {
      console.error('获取待核验列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = (item: PendingItem): 'pending' | 'verified' | 'materials-needed' => {
    const { checkResult } = item;
    if (checkResult.overallPass) {
      return 'verified';
    }
    if (checkResult.missingDocuments.length > 0) {
      return 'materials-needed';
    }
    return 'pending';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredItems = useMemo(() => {
    return pendingItems.filter(item => {
      const pet = item.stay.pet;
      const matchesSearch = searchKeyword === '' ||
        pet.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        pet.ownerName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;

      const itemStatus = getVerificationStatus(item);
      const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [pendingItems, searchKeyword, speciesFilter, statusFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          label: '已通过',
          icon: CheckCircle,
          className: 'bg-green-50 text-green-700 border-green-200',
          dotClass: 'bg-green-500'
        };
      case 'materials-needed':
        return {
          label: '待补材料',
          icon: AlertCircle,
          className: 'bg-orange-50 text-orange-700 border-orange-200',
          dotClass: 'bg-orange-500'
        };
      case 'pending':
      default:
        return {
          label: '待核验',
          icon: Clock,
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500'
        };
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      default: return PawPrint;
    }
  };

  const stats = useMemo(() => {
    const total = pendingItems.length;
    const pending = pendingItems.filter(i => getVerificationStatus(i) === 'pending').length;
    const verified = pendingItems.filter(i => getVerificationStatus(i) === 'verified').length;
    const materialsNeeded = pendingItems.filter(i => getVerificationStatus(i) === 'materials-needed').length;
    return { total, pending, verified, materialsNeeded };
  }, [pendingItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              疫苗核验管理
            </h1>
            <p className="text-gray-500 mt-1">共 {filteredItems.length} 条待处理</p>
          </div>
          <button
            onClick={fetchPendingList}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            刷新
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm text-gray-500">全部申请</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm text-gray-500">待核验</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm text-gray-500">已通过</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm text-gray-500">待补材料</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.materialsNeeded}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索宠物名称、主人姓名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all",
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <Filter className="w-5 h-5" />
              筛选
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">核验状态</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'verified', 'materials-needed'] as const).map((status) => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                          statusFilter === status
                            ? cn(config.className, "border-2 shadow-md")
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <config.icon className="w-4 h-4" />
                        {status === 'all' ? '全部' : config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">物种筛选</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'dog', 'cat', 'other'] as const).map((species) => {
                    const Icon = species === 'all' ? PawPrint : getSpeciesIcon(species);
                    return (
                      <button
                        key={species}
                        onClick={() => setSpeciesFilter(species)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          speciesFilter === species
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {species === 'all' ? '全部' : SPECIES_NAMES[species]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无核验申请</h3>
            <p className="text-gray-500">
              {searchKeyword || speciesFilter !== 'all' || statusFilter !== 'all'
                ? '没有找到匹配的记录，请尝试调整筛选条件'
                : '当前没有待核验的疫苗申请'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const { stay, checkResult } = item;
              const pet = stay.pet;
              const status = getVerificationStatus(item);
              const statusConfig = getStatusConfig(status);
              const SpeciesIcon = getSpeciesIcon(pet.species);
              const missingCount = checkResult.missingDocuments.length;

              return (
                <div
                  key={stay.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl overflow-hidden flex-shrink-0">
                      {pet.photoUrl ? (
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <SpeciesIcon className="w-10 h-10 text-blue-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <SpeciesIcon className="w-3 h-3" />
                          {SPECIES_NAMES[pet.species]}
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border",
                          statusConfig.className
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotClass)} />
                          {statusConfig.label}
                        </span>
                        {missingCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            缺失 {missingCount} 项材料
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                        <span>主人: {pet.ownerName}</span>
                        <span>品种: {pet.breed}</span>
                        <span>提交时间: {formatDate(stay.createdAt)}</span>
                      </div>
                      {checkResult.warnings.length > 0 && (
                        <div className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {checkResult.warnings[0]}
                          {checkResult.warnings.length > 1 && (
                            <span className="text-yellow-500">等 {checkResult.warnings.length} 项提醒</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/vaccination/check/${pet.id}`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" />
                        核验
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
