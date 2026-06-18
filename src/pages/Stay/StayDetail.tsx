import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Home,
  User as UserIcon,
  FileText,
  AlertTriangle,
  Shield,
  Syringe,
  Clock,
  CheckCircle2,
  X,
  PawPrint,
  Dog,
  Cat,
  Utensils,
  Circle,
  Brain,
  Droplets,
  Activity,
  AlertCircle,
  Camera,
  Plus,
  LogOut,
  XCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type {
  Stay,
  Pet,
  Cage,
  User,
  DailyRecord,
  VaccineRecord,
  VaccinationCheckResult,
} from '../../../shared/types';
import {
  STATUS_NAMES,
  SPECIES_NAMES,
  MENTAL_STATE_NAMES,
  DEFECATION_NAMES,
  VACCINE_TYPE_NAMES,
} from '../../../shared/types';

type TabType = 'basic' | 'daily' | 'vaccine';

interface StayWithDetails extends Stay {
  pet?: Pet;
  cage?: Cage;
  assignedStaff?: User;
  dailyRecords?: DailyRecord[];
  vaccineRecords?: VaccineRecord[];
  vaccineCheckResult?: VaccinationCheckResult;
}

const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'basic', label: '基本信息', icon: <FileText className="w-4 h-4" /> },
  { key: 'daily', label: '日常记录', icon: <Activity className="w-4 h-4" /> },
  { key: 'vaccine', label: '疫苗记录', icon: <Syringe className="w-4 h-4" /> },
];

export default function StayDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [loading, setLoading] = useState(true);
  const [stay, setStay] = useState<StayWithDetails | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<DailyRecord>>({
    feeding: '',
    defecation: 'normal',
    defecationCount: 1,
    mentalState: 'good',
    waterIntake: '',
    exercise: '',
    abnormal: false,
    abnormalDescription: '',
    handlingMeasures: '',
  });

  useEffect(() => {
    if (id) {
      fetchStayDetail(parseInt(id));
    }
  }, [id]);

  const fetchStayDetail = async (stayId: number) => {
    try {
      setLoading(true);
      const [stayRes, recordsRes, vaccinesRes] = await Promise.all([
        apiClient.get<Stay>(`/stays/${stayId}`),
        apiClient.get<DailyRecord[]>(`/daily-records/stay/${stayId}`),
        apiClient.get<VaccinationCheckResult>(`/vaccination/check/stay/${stayId}`),
      ]);

      if (stayRes.success && stayRes.data) {
        const stayData = stayRes.data;
        const [petRes, cageRes, staffRes] = await Promise.all([
          stayData.petId ? apiClient.get<Pet>(`/pets/${stayData.petId}`) : Promise.resolve(null),
          stayData.cageId ? apiClient.get<Cage>(`/cages/${stayData.cageId}`) : Promise.resolve(null),
          stayData.assignedStaffId ? apiClient.get<User>(`/users/${stayData.assignedStaffId}`) : Promise.resolve(null),
        ]);

        const petVaccinesRes = stayData.petId
          ? await apiClient.get<VaccineRecord[]>(`/pets/${stayData.petId}/vaccines`)
          : null;

        setStay({
          ...stayData,
          pet: petRes?.success ? petRes.data : undefined,
          cage: cageRes?.success ? cageRes.data : undefined,
          assignedStaff: staffRes?.success ? staffRes.data : undefined,
          dailyRecords: recordsRes.success ? recordsRes.data : [],
          vaccineRecords: petVaccinesRes?.success ? petVaccinesRes.data : [],
          vaccineCheckResult: vaccinesRes.success ? vaccinesRes.data : undefined,
        });
      }
    } catch (error) {
      console.error('获取寄养详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!id || !confirm('确认办理退房吗？')) return;
    try {
      const res = await apiClient.post(`/stays/${id}/checkout`);
      if (res.success) {
        alert('办理退房成功');
        fetchStayDetail(parseInt(id));
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error('办理退房失败:', error);
    }
  };

  const handleAddRecord = async () => {
    if (!id || !newRecord.feeding) {
      alert('请填写喂食情况');
      return;
    }

    try {
      const res = await apiClient.post('/daily-records', {
        ...newRecord,
        stayId: parseInt(id),
        recordDate: new Date().toISOString().split('T')[0],
        recordedBy: 1,
      });

      if (res.success) {
        alert('记录添加成功');
        setShowAddRecord(false);
        setNewRecord({
          feeding: '',
          defecation: 'normal',
          defecationCount: 1,
          mentalState: 'good',
          waterIntake: '',
          exercise: '',
          abnormal: false,
          abnormalDescription: '',
          handlingMeasures: '',
        });
        fetchStayDetail(parseInt(id));
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error('添加记录失败:', error);
    }
  };

  const getStatusConfig = (status: Stay['status']) => {
    switch (status) {
      case 'pending':
        return { type: 'warning' as const, icon: Clock };
      case 'confirmed':
        return { type: 'info' as const, icon: CheckCircle2 };
      case 'checked-in':
        return { type: 'success' as const, icon: Home };
      case 'checked-out':
        return { type: 'default' as const, icon: CheckCircle2 };
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

  const getMentalStateColor = (state: DailyRecord['mentalState']) => {
    switch (state) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDefecationColor = (type: DailyRecord['defecation']) => {
    switch (type) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'soft':
        return 'text-yellow-600 bg-yellow-50';
      case 'diarrhea':
        return 'text-red-600 bg-red-50';
      case 'constipation':
        return 'text-orange-600 bg-orange-50';
      case 'none':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getVaccineStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expiring':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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

  if (!stay) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6">
          <EmptyState
            icon={<XCircle className="w-12 h-12" />}
            title="订单不存在"
            description="无法找到该寄养订单，请返回列表重新选择"
            action={
              <button
                onClick={() => navigate('/stays')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(stay.status);
  const SpeciesIcon = stay.pet ? getSpeciesIcon(stay.pet.species) : PawPrint;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6">
        <button
          onClick={() => navigate('/stays')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-40 h-40 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {stay.pet?.photoUrl ? (
                <img
                  src={stay.pet.photoUrl}
                  alt={stay.pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <SpeciesIcon className="w-20 h-20 text-primary-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {stay.pet?.name || '未知宠物'}
                    </h1>
                    <StatusBadge status={statusConfig.type}>
                      <statusConfig.icon className="w-3.5 h-3.5" />
                      {STATUS_NAMES[stay.status]}
                    </StatusBadge>
                    {stay.highRisk && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        高风险
                      </span>
                    )}
                    {stay.requiresIsolation && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        隔离
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">
                    {stay.pet && (
                      <>
                        {SPECIES_NAMES[stay.pet.species]} · {stay.pet.breed} ·{' '}
                        {stay.pet.age}岁 · {stay.pet.weight}kg
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">入住日期</p>
                    <p className="font-semibold text-gray-900">{stay.checkInDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">退房日期</p>
                    <p className="font-semibold text-gray-900">
                      {stay.actualCheckOut || stay.checkOutDate || '待确定'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">笼位</p>
                    <p className="font-semibold text-gray-900">
                      {stay.cage?.name || '未分配'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">护理员</p>
                    <p className="font-semibold text-gray-900">
                      {stay.assignedStaff?.name || '未分配'}
                    </p>
                  </div>
                </div>
              </div>

              {stay.pet && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">主人: </span>
                      <span className="font-medium text-gray-900">{stay.pet.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">联系电话: </span>
                      <span className="font-medium text-gray-900">{stay.pet.ownerPhone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-100 px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                    activeTab === tab.key
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary-600" />
                      笼位信息
                    </h3>
                    {stay.cage ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">笼位名称</span>
                          <span className="font-medium text-gray-900">{stay.cage.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">笼位编号</span>
                          <span className="font-medium text-gray-900">{stay.cage.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">类型</span>
                          <span className="font-medium text-gray-900">
                            {stay.cage.type === 'isolation' ? '隔离笼位' : '普通笼位'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">大小</span>
                          <span className="font-medium text-gray-900">
                            {stay.cage.size === 'small'
                              ? '小型'
                              : stay.cage.size === 'medium'
                              ? '中型'
                              : '大型'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">适用</span>
                          <span className="font-medium text-gray-900">
                            {stay.cage.suitableFor === 'both'
                              ? '通用'
                              : SPECIES_NAMES[stay.cage.suitableFor]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">暂未分配笼位</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary-600" />
                      护理人员
                    </h3>
                    {stay.assignedStaff ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">姓名</span>
                          <span className="font-medium text-gray-900">
                            {stay.assignedStaff.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">角色</span>
                          <span className="font-medium text-gray-900">
                            {stay.assignedStaff.role === 'caregiver' ? '护理员' : '其他'}
                          </span>
                        </div>
                        {stay.assignedStaff.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">联系电话</span>
                            <span className="font-medium text-gray-900">
                              {stay.assignedStaff.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">暂未分配护理员</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-600" />
                    特殊标记
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={cn(
                        'p-4 rounded-xl border-2',
                        stay.requiresIsolation
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            stay.requiresIsolation ? 'bg-orange-200' : 'bg-gray-200'
                          )}
                        >
                          <Shield
                            className={cn(
                              'w-5 h-5',
                              stay.requiresIsolation ? 'text-orange-600' : 'text-gray-400'
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">隔离状态</p>
                          <p className="text-sm text-gray-500">
                            {stay.requiresIsolation ? '需要隔离' : '无需隔离'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'p-4 rounded-xl border-2',
                        stay.highRisk ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            stay.highRisk ? 'bg-red-200' : 'bg-gray-200'
                          )}
                        >
                          <AlertTriangle
                            className={cn(
                              'w-5 h-5',
                              stay.highRisk ? 'text-red-600' : 'text-gray-400'
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">高风险</p>
                          <p className="text-sm text-gray-500">
                            {stay.highRisk ? '是' : '否'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {stay.highRiskReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm font-medium text-red-800">高风险原因</p>
                      <p className="text-sm text-red-700 mt-1">{stay.highRiskReason}</p>
                    </div>
                  )}
                </div>

                {stay.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      备注
                    </h3>
                    <p className="text-gray-700">{stay.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'daily' && (
              <div className="space-y-6">
                {stay.status === 'checked-in' && (
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">日常记录</h3>
                    <button
                      onClick={() => setShowAddRecord(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加记录
                    </button>
                  </div>
                )}

                {showAddRecord && (
                  <div className="p-6 bg-primary-50 border border-primary-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">添加今日记录</h4>
                      <button
                        onClick={() => setShowAddRecord(false)}
                        className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Utensils className="w-4 h-4 inline mr-1" />
                          喂食情况 *
                        </label>
                        <textarea
                          value={newRecord.feeding}
                          onChange={(e) =>
                            setNewRecord((prev) => ({ ...prev, feeding: e.target.value }))
                          }
                          placeholder="请描述喂食情况..."
                          rows={2}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Circle className="w-4 h-4 inline mr-1" />
                          排便情况
                        </label>
                        <select
                          value={newRecord.defecation}
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              defecation: e.target.value as DailyRecord['defecation'],
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {(['normal', 'soft', 'diarrhea', 'constipation', 'none'] as const).map(
                            (type) => (
                              <option key={type} value={type}>
                                {DEFECATION_NAMES[type]}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排便次数
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newRecord.defecationCount}
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              defecationCount: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Brain className="w-4 h-4 inline mr-1" />
                          精神状态
                        </label>
                        <select
                          value={newRecord.mentalState}
                          onChange={(e) =>
                            setNewRecord((prev) => ({
                              ...prev,
                              mentalState: e.target.value as DailyRecord['mentalState'],
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {(['excellent', 'good', 'fair', 'poor'] as const).map((state) => (
                            <option key={state} value={state}>
                              {MENTAL_STATE_NAMES[state]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Droplets className="w-4 h-4 inline mr-1" />
                          饮水情况
                        </label>
                        <input
                          type="text"
                          value={newRecord.waterIntake}
                          onChange={(e) =>
                            setNewRecord((prev) => ({ ...prev, waterIntake: e.target.value }))
                          }
                          placeholder="饮水情况..."
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Activity className="w-4 h-4 inline mr-1" />
                          运动情况
                        </label>
                        <input
                          type="text"
                          value={newRecord.exercise}
                          onChange={(e) =>
                            setNewRecord((prev) => ({ ...prev, exercise: e.target.value }))
                          }
                          placeholder="运动情况..."
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRecord.abnormal}
                            onChange={(e) =>
                              setNewRecord((prev) => ({ ...prev, abnormal: e.target.checked }))
                            }
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="font-medium text-gray-700">存在异常情况</span>
                        </label>
                      </div>
                      {newRecord.abnormal && (
                        <>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <AlertCircle className="w-4 h-4 inline mr-1 text-red-500" />
                              异常描述
                            </label>
                            <textarea
                              value={newRecord.abnormalDescription}
                              onChange={(e) =>
                                setNewRecord((prev) => ({
                                  ...prev,
                                  abnormalDescription: e.target.value,
                                }))
                              }
                              placeholder="请描述异常情况..."
                              rows={2}
                              className="w-full px-4 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Check className="w-4 h-4 inline mr-1" />
                              处理措施
                            </label>
                            <textarea
                              value={newRecord.handlingMeasures}
                              onChange={(e) =>
                                setNewRecord((prev) => ({
                                  ...prev,
                                  handlingMeasures: e.target.value,
                                }))
                              }
                              placeholder="已采取的处理措施..."
                              rows={2}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleAddRecord}
                        className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        保存记录
                      </button>
                      <button
                        onClick={() => setShowAddRecord(false)}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {stay.dailyRecords && stay.dailyRecords.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {stay.dailyRecords
                        .sort((a, b) => b.recordDate.localeCompare(a.recordDate))
                        .map((record, index) => (
                          <div key={record.id} className="relative pl-14">
                            <div
                              className={cn(
                                'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white',
                                index === 0
                                  ? 'bg-primary-500 shadow-lg shadow-primary-500/30'
                                  : 'bg-gray-300'
                              )}
                            >
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">
                                  {record.recordDate}
                                </h4>
                                {record.abnormal && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    <AlertCircle className="w-3 h-3" />
                                    异常
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Utensils className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">喂食</p>
                                    <p className="text-sm text-gray-700">{record.feeding}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                      getDefecationColor(record.defecation).split(' ')[1]
                                    )}
                                  >
                                    <Circle
                                      className={cn(
                                        'w-4 h-4',
                                        getDefecationColor(record.defecation).split(' ')[0]
                                      )}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">排便</p>
                                    <p className="text-sm text-gray-700">
                                      {DEFECATION_NAMES[record.defecation]} (
                                      {record.defecationCount}次)
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                      getMentalStateColor(record.mentalState).split(' ')[1]
                                    )}
                                  >
                                    <Brain
                                      className={cn(
                                        'w-4 h-4',
                                        getMentalStateColor(record.mentalState).split(' ')[0]
                                      )}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">精神状态</p>
                                    <p className="text-sm text-gray-700">
                                      {MENTAL_STATE_NAMES[record.mentalState]}
                                    </p>
                                  </div>
                                </div>
                                {record.waterIntake && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                      <Droplets className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">饮水</p>
                                      <p className="text-sm text-gray-700">
                                        {record.waterIntake}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {record.exercise && (
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                      <Activity className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">运动</p>
                                      <p className="text-sm text-gray-700">
                                        {record.exercise}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {record.abnormal && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                  <div className="flex items-start gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm font-medium text-red-800">
                                      异常情况
                                    </p>
                                  </div>
                                  {record.abnormalDescription && (
                                    <p className="text-sm text-red-700 ml-6">
                                      {record.abnormalDescription}
                                    </p>
                                  )}
                                  {record.handlingMeasures && (
                                    <div className="mt-2 ml-6">
                                      <p className="text-xs text-gray-500">处理措施</p>
                                      <p className="text-sm text-gray-700">
                                        {record.handlingMeasures}
                                      </p>
                                    </div>
                                  )}
                                  {record.abnormalPhotos &&
                                    record.abnormalPhotos.length > 0 && (
                                      <div className="mt-3 ml-6">
                                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                          <Camera className="w-3 h-3" />
                                          异常照片
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                          {record.abnormalPhotos.map((photo, i) => (
                                            <img
                                              key={i}
                                              src={photo}
                                              alt={`异常照片 ${i + 1}`}
                                              className="w-20 h-20 object-cover rounded-lg"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<Activity className="w-12 h-12" />}
                    title="暂无日常记录"
                    description="入住后护理员会每日记录宠物状态"
                  />
                )}
              </div>
            )}

            {activeTab === 'vaccine' && (
              <div className="space-y-6">
                {stay.vaccineCheckResult && (
                  <div
                    className={cn(
                      'p-6 rounded-xl',
                      stay.vaccineCheckResult.overallPass
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center',
                          stay.vaccineCheckResult.overallPass
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        )}
                      >
                        {stay.vaccineCheckResult.overallPass ? (
                          <Shield className="w-7 h-7 text-white" />
                        ) : (
                          <AlertTriangle className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <div>
                        <h3
                          className={cn(
                            'text-lg font-semibold',
                            stay.vaccineCheckResult.overallPass
                              ? 'text-green-800'
                              : 'text-red-800'
                          )}
                        >
                          入住时疫苗核验结果
                        </h3>
                        <p
                          className={cn(
                            'text-sm',
                            stay.vaccineCheckResult.overallPass
                              ? 'text-green-600'
                              : 'text-red-600'
                          )}
                        >
                          {stay.vaccineCheckResult.overallPass
                            ? '所有必需疫苗均在有效期内'
                            : '存在过期或缺失的疫苗'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stay.vaccineRecords && stay.vaccineRecords.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">疫苗接种记录</h3>
                    {stay.vaccineRecords.map((vaccine) => (
                      <div
                        key={vaccine.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center border',
                              getVaccineStatusColor(vaccine.status)
                            )}
                          >
                            <Syringe
                              className={cn(
                                'w-5 h-5',
                                getVaccineStatusColor(vaccine.status).split(' ')[0]
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vaccine.name}</p>
                            <p className="text-sm text-gray-500">
                              {VACCINE_TYPE_NAMES[vaccine.type]} · 接种日期:{' '}
                              {vaccine.vaccinationDate}
                            </p>
                            <p className="text-xs text-gray-400">
                              有效期至: {vaccine.expiryDate}
                              {vaccine.verified && (
                                <span className="ml-2 text-green-600">已核验</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            getVaccineStatusColor(vaccine.status)
                          )}
                        >
                          {vaccine.status === 'valid'
                            ? '有效'
                            : vaccine.status === 'expiring'
                            ? '即将过期'
                            : '已过期'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Syringe className="w-12 h-12" />}
                    title="暂无疫苗记录"
                    description="该宠物尚未添加疫苗接种记录"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {stay.status === 'checked-in' && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddRecord(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-100 text-primary-700 rounded-xl font-medium hover:bg-primary-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加记录
            </button>
            <button
              onClick={handleCheckOut}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
            >
              <LogOut className="w-5 h-5" />
              办理退房
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
