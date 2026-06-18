import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Dog, Cat, Heart, Edit, Eye, X, CheckCircle, AlertTriangle, Clock, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pet, VaccineRecord } from '../../../shared/types';
import { SPECIES_NAMES, VACCINE_TYPE_NAMES } from '../../../shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

type VaccineStatus = 'all' | 'up-to-date' | 'expiring' | 'expired';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'other';

export default function PetList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccineRecords, setVaccineRecords] = useState<Map<number, VaccineRecord[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [vaccineStatusFilter, setVaccineStatusFilter] = useState<VaccineStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pets?pageSize=100');
      const data: ApiResponse<Pet[]> = await res.json();
      if (data.success) {
        setPets(data.data || []);
        fetchAllVaccineRecords(data.data || []);
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVaccineRecords = async (petList: Pet[]) => {
    const recordsMap = new Map<number, VaccineRecord[]>();
    for (const pet of petList) {
      try {
        const res = await fetch(`/api/pets/${pet.id}/vaccines`);
        const data: ApiResponse<VaccineRecord[]> = await res.json();
        if (data.success) {
          recordsMap.set(pet.id, data.data || []);
        }
      } catch (error) {
        console.error(`获取宠物 ${pet.id} 疫苗记录失败:`, error);
      }
    }
    setVaccineRecords(recordsMap);
  };

  const getPetVaccineStatus = (petId: number): 'up-to-date' | 'expiring' | 'expired' | 'unknown' => {
    const records = vaccineRecords.get(petId);
    if (!records || records.length === 0) return 'unknown';
    
    const now = new Date();
    const hasExpired = records.some(r => {
      const expiry = new Date(r.expiryDate);
      return r.status === 'expired' || expiry < now;
    });
    const hasExpiring = records.some(r => {
      const expiry = new Date(r.expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return r.status === 'expiring' || (daysUntilExpiry <= 30 && daysUntilExpiry > 0);
    });
    
    if (hasExpired) return 'expired';
    if (hasExpiring) return 'expiring';
    return 'up-to-date';
  };

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesSearch = searchKeyword === '' || 
        pet.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        pet.ownerName.toLowerCase().includes(searchKeyword.toLowerCase());
      
      const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
      
      const petVaccineStatus = getPetVaccineStatus(pet.id);
      const matchesVaccine = vaccineStatusFilter === 'all' || petVaccineStatus === vaccineStatusFilter;
      
      return matchesSearch && matchesSpecies && matchesVaccine;
    });
  }, [pets, searchKeyword, speciesFilter, vaccineStatusFilter, vaccineRecords]);

  const getVaccineStatusConfig = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return { label: '疫苗有效', icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-200' };
      case 'expiring':
        return { label: '即将过期', icon: Clock, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 'expired':
        return { label: '已过期', icon: AlertTriangle, className: 'bg-red-100 text-red-700 border-red-200' };
      default:
        return { label: '无记录', icon: X, className: 'bg-gray-100 text-gray-500 border-gray-200' };
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      default: return PawPrint;
    }
  };

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
              <PawPrint className="w-8 h-8 text-blue-600" />
              宠物档案管理
            </h1>
            <p className="text-gray-500 mt-1">共 {filteredPets.length} 只宠物</p>
          </div>
          <Link
            to="/pets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            新建档案
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索宠物名称、品种、主人姓名..."
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">疫苗状态</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'up-to-date', 'expiring', 'expired'] as const).map((status) => {
                    const config = getVaccineStatusConfig(status);
                    return (
                      <button
                        key={status}
                        onClick={() => setVaccineStatusFilter(status)}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                          vaccineStatusFilter === status
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
            </div>
          )}
        </div>

        {filteredPets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无宠物档案</h3>
            <p className="text-gray-500 mb-6">
              {searchKeyword || speciesFilter !== 'all' || vaccineStatusFilter !== 'all'
                ? '没有找到匹配的宠物，请尝试调整筛选条件'
                : '点击上方按钮创建第一个宠物档案'}
            </p>
            <Link
              to="/pets/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建档案
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => {
              const vaccineStatus = getPetVaccineStatus(pet.id);
              const vaccineConfig = getVaccineStatusConfig(vaccineStatus);
              const SpeciesIcon = getSpeciesIcon(pet.species);

              return (
                <div
                  key={pet.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden">
                    {pet.photoUrl ? (
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SpeciesIcon className="w-20 h-20 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                        vaccineConfig.className
                      )}>
                        <vaccineConfig.icon className="w-3.5 h-3.5" />
                        {vaccineConfig.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50">
                        <SpeciesIcon className="w-3.5 h-3.5" />
                        {SPECIES_NAMES[pet.species]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {pet.name}
                          {pet.sterilized && (
                            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm">{pet.breed}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-gray-400">年龄:</span>
                        <span className="font-medium">{pet.age} 岁</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-gray-400">体重:</span>
                        <span className="font-medium">{pet.weight} kg</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-gray-400">主人:</span>
                        <span className="font-medium">{pet.ownerName}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/pets/${pet.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </Link>
                      <Link
                        to={`/pets/${pet.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </Link>
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
