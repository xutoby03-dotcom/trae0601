import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  LogIn,
  LogOut,
  PawPrint,
  Dog,
  Cat,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type { Stay, Pet, Cage, User, VaccinationCheckResult } from '../../../shared/types';
import { STATUS_NAMES, SPECIES_NAMES } from '../../../shared/types';

type TabType = 'all' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled' | 'pending-materials';
type CageTypeFilter = 'all' | 'normal' | 'isolation';

interface StayWithDetails extends Stay {
  pet?: Pet;
  cage?: Cage;
  assignedStaff?: User;
  vaccineCheckResult?: VaccinationCheckResult | null;
  pendingMaterials: string[];
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending-materials', label: '待补材料' },
  { key: 'pending', label: '待确认' },
  { key: 'checked-in', label: '已入住' },
  { key: 'checked-out', label: '已退房' },
  { key: 'cancelled', label: '已取消' },
];

export default function StayList() {
  const navigate = useNavigate();
  const [stays, setStays] = useState<StayWithDetails[]>([]);
  const [pets, setPets] = useState<Map<number, Pet>>(new Map());
  const [cages, setCages] = useState<Map<number, Cage>>(new Map());
  const [users, setUsers] = useState<Map<number, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [cageTypeFilter, setCageTypeFilter] = useState<CageTypeFilter>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staysRes, petsRes, cagesRes, usersRes] = await Promise.all([
        apiClient.get<Stay[]>('/stays', { params: { pageSize: 100 } }),
        apiClient.get<Pet[]>('/pets', { params: { pageSize: 100 } }),
        apiClient.get<Cage[]>('/cages'),
        apiClient.get<User[]>('/users'),
      ]);

      let staysWithVaccine: StayWithDetails[] = [];

      if (staysRes.success && staysRes.data) {
        const vaccineCheckPromises = staysRes.data.map(async (stay) => {
          try {
            const checkRes = await apiClient.get<VaccinationCheckResult>(
              `/vaccination/check/${stay.petId}`
            );
            return {
              ...stay,
              vaccineCheckResult: checkRes.success ? checkRes.data : null,
              pendingMaterials: checkRes.success && checkRes.data?.missingDocuments
                ? checkRes.data.missingDocuments
                : [],
            };
          } catch {
            return {
              ...stay,
              vaccineCheckResult: null,
              pendingMaterials: [],
            };
          }
        });

        staysWithVaccine = await Promise.all(vaccineCheckPromises);
        setStays(staysWithVaccine);
      }

      if (petsRes.success && petsRes.data) {
        const petsMap = new Map(petsRes.data.map((p) => [p.id, p]));
        setPets(petsMap);
      }
      if (cagesRes.success && cagesRes.data) {
        const cagesMap = new Map(cagesRes.data.map((c) => [c.id, c]));
        setCages(cagesMap);
      }
      if (usersRes.success && usersRes.data) {
        const usersMap = new Map(usersRes.data.map((u) => [u.id, u]));
        setUsers(usersMap);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const staysWithDetails = useMemo(() => {
    return stays.map((stay) => ({
      ...stay,
      pet: pets.get(stay.petId),
      cage: stay.cageId ? cages.get(stay.cageId) : undefined,
      assignedStaff: stay.assignedStaffId ? users.get(stay.assignedStaffId) : undefined,
    }));
  }, [stays, pets, cages, users]);

  const filteredStays = useMemo(() => {
    return staysWithDetails.filter((stay) => {
      if (activeTab === 'pending-materials') {
        return stay.pendingMaterials.length > 0 || !stay.vaccineCheckResult?.overallPass;
      }
      if (activeTab !== 'all' && stay.status !== activeTab) return false;

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const petName = stay.pet?.name.toLowerCase() || '';
        const ownerName = stay.pet?.ownerName.toLowerCase() || '';
        const breed = stay.pet?.breed.toLowerCase() || '';
        if (!petName.includes(keyword) && !ownerName.includes(keyword) && !breed.includes(keyword)) {
          return false;
        }
      }

      if (dateRange.start && stay.checkInDate < dateRange.start) return false;
      if (dateRange.end && stay.checkInDate > dateRange.end) return false;

      if (cageTypeFilter !== 'all' && stay.cage?.type !== cageTypeFilter) return false;

      return true;
    });
  }, [staysWithDetails, activeTab, searchKeyword, dateRange, cageTypeFilter]);

  const getStatusConfig = (status: Stay['status']) => {
    switch (status) {
      case 'pending':
        return { type: 'warning' as const, icon: Clock };
      case 'confirmed':
        return { type: 'info' as const, icon: CheckCircle };
      case 'checked-in':
        return { type: 'success' as const, icon: Home };
      case 'checked-out':
        return { type: 'default' as const, icon: CheckCircle };
      case 'cancelled':
        return { type: 'danger' as const, icon: XCircle };
      default:
        return { type: 'default' as const, icon: Clock };
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog':
        return Dog;
      case 'cat':
        return Cat;
      default:
        return PawPrint;
    }
  };

  const handleCheckIn = async (stayId: number) => {
    navigate(`/stays/${stayId}/checkin`);
  };

  const handleCheckOut = async (stayId: number) => {
    if (!confirm('确认办理退房吗？')) return;
    try {
      const res = await apiClient.post(`/stays/${stayId}/checkout`);
      if (res.success) {
        fetchData();
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error('办理退房失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Home className="w-7 h-7 text-primary-600" />
              寄养管理
            </h1>
            <p className="text-gray-500 mt-1">共 {filteredStays.length} 条寄养订单</p>
          </div>
          <Link
            to="/stays/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            办理入住
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-100 px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto py-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索宠物名称、主人姓名、品种..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all',
                  showFilters
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                <Filter className="w-5 h-5" />
                筛选
                <ChevronDown
                  className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
                />
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">入住日期范围</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <span className="text-gray-400">至</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">笼位类型</label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'normal', 'isolation'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCageTypeFilter(type)}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          cageTypeFilter === type
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {type === 'all' ? '全部' : type === 'normal' ? '普通笼位' : '隔离笼位'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setCageTypeFilter('all');
                      setSearchKeyword('');
                    }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    重置筛选
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredStays.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <EmptyState
              icon={<Home className="w-12 h-12" />}
              title="暂无寄养订单"
              description={
                searchKeyword || dateRange.start || dateRange.end || cageTypeFilter !== 'all'
                  ? '没有找到匹配的订单，请尝试调整筛选条件'
                  : '点击右上角按钮办理第一个寄养入住'
              }
              action={
                <Link
                  to="/stays/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  办理入住
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStays.map((stay) => {
              const statusConfig = getStatusConfig(stay.status);
              const SpeciesIcon = stay.pet ? getSpeciesIcon(stay.pet.species) : PawPrint;

              return (
                <div
                  key={stay.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary-100 to-indigo-100 overflow-hidden">
                    {stay.pet?.photoUrl ? (
                      <img
                        src={stay.pet.photoUrl}
                        alt={stay.pet.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SpeciesIcon className="w-16 h-16 text-primary-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <StatusBadge status={statusConfig.type}>
                        <statusConfig.icon className="w-3.5 h-3.5" />
                        {STATUS_NAMES[stay.status]}
                      </StatusBadge>
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {stay.pendingMaterials.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
                        <FileText className="w-3 h-3" />
                        待补材料
                      </span>
                    )}
                    <div className="flex gap-2">
                      {stay.highRisk && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          高风险
                        </span>
                      )}
                      {stay.requiresIsolation && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                          隔离
                        </span>
                      )}
                    </div>
                  </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          {stay.pet?.name || '未知宠物'}
                          {stay.pet && (
                            <span className="text-xs font-normal text-gray-400">
                              {SPECIES_NAMES[stay.pet.species]}
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm">{stay.pet?.breed}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">入住:</span>
                        <span className="font-medium text-gray-700">{stay.checkInDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">退房:</span>
                        <span className="font-medium text-gray-700">
                          {stay.actualCheckOut || stay.checkOutDate || '待确定'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">笼位:</span>
                        <span className="font-medium text-gray-700">
                          {stay.cage?.name || '未分配'}
                          {stay.cage?.type === 'isolation' && ' (隔离)'}
                        </span>
                      </div>
                      {stay.assignedStaff && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">护理员:</span>
                          <span className="font-medium text-gray-700">
                            {stay.assignedStaff.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/stays/${stay.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </Link>
                      {stay.status === 'pending' || stay.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCheckIn(stay.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          办理入住
                        </button>
                      ) : stay.status === 'checked-in' ? (
                        <button
                          onClick={() => handleCheckOut(stay.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white rounded-xl text-sm font-medium transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          办理退房
                        </button>
                      ) : null}
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
