import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  AlertTriangle,
  Shield,
  Home,
  Calendar,
  User as UserIcon,
  FileText,
  PawPrint,
  Dog,
  Cat,
  Syringe,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { StatusBadge } from '@/components/common/StatusBadge';
import type {
  Pet,
  Cage,
  User,
  VaccinationCheckResult,
  Stay,
} from '../../../shared/types';
import {
  SPECIES_NAMES,
  VACCINE_TYPE_NAMES,
} from '../../../shared/types';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  petId: number | null;
  pet: Pet | null;
  newPet: Partial<Pet>;
  vaccineCheckResult: VaccinationCheckResult | null;
  cageId: number | null;
  checkInDate: string;
  checkOutDate: string;
  requiresIsolation: boolean;
  highRisk: boolean;
  highRiskReason: string;
  assignedStaffId: number | null;
  notes: string;
}

const steps = [
  { number: 1, title: '选择宠物', description: '选择已有宠物或快速新建' },
  { number: 2, title: '疫苗核验', description: '自动核验疫苗有效性' },
  { number: 3, title: '选择笼位', description: '选择合适的笼位' },
  { number: 4, title: '确认信息', description: '确认并提交订单' },
];

export default function StayForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pets, setPets] = useState<Pet[]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showNewPetForm, setShowNewPetForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    petId: null,
    pet: null,
    newPet: {},
    vaccineCheckResult: null,
    cageId: null,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    requiresIsolation: false,
    highRisk: false,
    highRiskReason: '',
    assignedStaffId: null,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [petsRes, cagesRes, staffRes] = await Promise.all([
        apiClient.get<Pet[]>('/pets', { params: { pageSize: 100 } }),
        apiClient.get<Cage[]>('/cages'),
        apiClient.get<User[]>('/users'),
      ]);

      if (petsRes.success && petsRes.data) {
        setPets(petsRes.data);
      }
      if (cagesRes.success && cagesRes.data) {
        setCages(cagesRes.data);
      }
      if (staffRes.success && staffRes.data) {
        setStaff(staffRes.data.filter((u) => u.role === 'caregiver' && u.active));
      }

      if (isEdit) {
        const stayRes = await apiClient.get<Stay>(`/stays/${id}`);
        if (stayRes.success && stayRes.data) {
          const stay = stayRes.data;
          const pet = petsRes.data?.find((p) => p.id === stay.petId) || null;
          setFormData({
            ...formData,
            petId: stay.petId,
            pet,
            cageId: stay.cageId || null,
            checkInDate: stay.checkInDate,
            checkOutDate: stay.checkOutDate || formData.checkOutDate,
            requiresIsolation: stay.requiresIsolation,
            highRisk: stay.highRisk,
            highRiskReason: stay.highRiskReason || '',
            assignedStaffId: stay.assignedStaffId || null,
            notes: stay.notes || '',
          });
          if (stay.petId) {
            checkVaccine(stay.petId);
          }
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter((pet) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      pet.name.toLowerCase().includes(keyword) ||
      pet.ownerName.toLowerCase().includes(keyword) ||
      pet.breed.toLowerCase().includes(keyword)
    );
  });

  const checkVaccine = async (petId: number) => {
    try {
      const res = await apiClient.get<VaccinationCheckResult>(
        `/vaccination/check/${petId}`
      );
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          vaccineCheckResult: res.data!,
        }));
      }
    } catch (error) {
      console.error('疫苗核验失败:', error);
    }
  };

  const selectPet = (pet: Pet) => {
    setFormData((prev) => ({
      ...prev,
      petId: pet.id,
      pet,
    }));
    checkVaccine(pet.id);
  };

  const createPet = async () => {
    if (
      !formData.newPet.name ||
      !formData.newPet.species ||
      !formData.newPet.ownerName ||
      !formData.newPet.ownerPhone
    ) {
      alert('请填写宠物名称、物种、主人姓名和电话');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post<Pet>('/pets', formData.newPet);
      if (res.success && res.data) {
        setPets((prev) => [...prev, res.data!]);
        selectPet(res.data!);
        setShowNewPetForm(false);
        setFormData((prev) => ({ ...prev, newPet: {} }));
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error('创建宠物失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.petId !== null;
      case 2:
        return formData.vaccineCheckResult?.overallPass;
      case 3:
        return formData.cageId !== null;
      case 4:
        return (
          formData.checkInDate &&
          formData.checkOutDate &&
          formData.checkInDate <= formData.checkOutDate
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const submitForm = async () => {
    if (!canProceed()) return;

    try {
      setSubmitting(true);
      const stayData = {
        petId: formData.petId!,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        cageId: formData.cageId || undefined,
        requiresIsolation: formData.requiresIsolation,
        highRisk: formData.highRisk,
        highRiskReason: formData.highRiskReason || undefined,
        assignedStaffId: formData.assignedStaffId || undefined,
        notes: formData.notes || undefined,
      };

      let res;
      if (isEdit) {
        res = await apiClient.put(`/stays/${id}`, stayData);
      } else {
        res = await apiClient.post('/stays', stayData);
      }

      if (res.success) {
        if (formData.cageId) {
          await apiClient.post(`/stays/${res.data?.id || id}/checkin`, {
            cageId: formData.cageId,
            assignedStaffId: formData.assignedStaffId || undefined,
          });
        }
        alert(isEdit ? '更新成功' : '办理入住成功');
        navigate('/stays');
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
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

  const getVaccineStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expiring':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'missing':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVaccineStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'expiring':
        return <Clock className="w-4 h-4" />;
      case 'expired':
      case 'missing':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getVaccineStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return '有效';
      case 'expiring':
        return '即将过期';
      case 'expired':
        return '已过期';
      case 'missing':
        return '缺失';
      default:
        return '未知';
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
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Home className="w-7 h-7 text-primary-600" />
            {isEdit ? '编辑寄养订单' : '办理入住'}
          </h1>
          <p className="text-gray-500">请按步骤填写信息完成入住办理</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                        isActive
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isActive
                            ? 'text-primary-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2',
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary-600" />
                  选择宠物
                </h2>

                {!showNewPetForm ? (
                  <>
                    <div className="flex gap-3 mb-4">
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
                        onClick={() => setShowNewPetForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        快速新建
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {filteredPets.map((pet) => {
                        const SpeciesIcon = getSpeciesIcon(pet.species);
                        const isSelected = formData.petId === pet.id;

                        return (
                          <div
                            key={pet.id}
                            onClick={() => selectPet(pet)}
                            className={cn(
                              'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                                {pet.photoUrl ? (
                                  <img
                                    src={pet.photoUrl}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <SpeciesIcon className="w-7 h-7 text-primary-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {pet.name}
                                  </h3>
                                  <span className="text-xs text-gray-400">
                                    {SPECIES_NAMES[pet.species]}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {pet.breed}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  主人: {pet.ownerName}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      新建宠物档案
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          宠物名称 *
                        </label>
                        <input
                          type="text"
                          value={formData.newPet.name || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: { ...prev.newPet, name: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          物种 *
                        </label>
                        <select
                          value={formData.newPet.species || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: {
                                ...prev.newPet,
                                species: e.target.value as Pet['species'],
                              },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">请选择</option>
                          <option value="dog">犬</option>
                          <option value="cat">猫</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          品种
                        </label>
                        <input
                          type="text"
                          value={formData.newPet.breed || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: { ...prev.newPet, breed: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          年龄
                        </label>
                        <input
                          type="number"
                          value={formData.newPet.age || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: {
                                ...prev.newPet,
                                age: parseFloat(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          主人姓名 *
                        </label>
                        <input
                          type="text"
                          value={formData.newPet.ownerName || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: {
                                ...prev.newPet,
                                ownerName: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          主人电话 *
                        </label>
                        <input
                          type="tel"
                          value={formData.newPet.ownerPhone || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              newPet: {
                                ...prev.newPet,
                                ownerPhone: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={createPet}
                        className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        确认创建
                      </button>
                      <button
                        onClick={() => {
                          setShowNewPetForm(false);
                          setFormData((prev) => ({ ...prev, newPet: {} }));
                        }}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {formData.pet && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">
                        已选择宠物: {formData.pet.name}
                      </p>
                      <p className="text-sm text-green-600">
                        {SPECIES_NAMES[formData.pet.species]} · {formData.pet.breed} · 主人: {formData.pet.ownerName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-primary-600" />
                  疫苗核验
                </h2>

                {formData.pet && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                      {formData.pet.photoUrl ? (
                        <img
                          src={formData.pet.photoUrl}
                          alt={formData.pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PawPrint className="w-8 h-8 text-primary-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {formData.pet.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {SPECIES_NAMES[formData.pet.species]} · {formData.pet.breed}
                      </p>
                    </div>
                  </div>
                )}

                {formData.vaccineCheckResult ? (
                  <>
                    <div
                      className={cn(
                        'p-6 rounded-xl mb-6',
                        formData.vaccineCheckResult.overallPass
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center',
                            formData.vaccineCheckResult.overallPass
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          )}
                        >
                          {formData.vaccineCheckResult.overallPass ? (
                            <Shield className="w-7 h-7 text-white" />
                          ) : (
                            <AlertTriangle className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <h3
                            className={cn(
                              'text-lg font-semibold',
                              formData.vaccineCheckResult.overallPass
                                ? 'text-green-800'
                                : 'text-red-800'
                            )}
                          >
                            {formData.vaccineCheckResult.overallPass
                              ? '疫苗核验通过'
                              : '疫苗核验未通过'}
                          </h3>
                          <p
                            className={cn(
                              'text-sm',
                              formData.vaccineCheckResult.overallPass
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {formData.vaccineCheckResult.overallPass
                              ? '所有必需疫苗均在有效期内，可以办理入住'
                              : '存在过期或缺失的疫苗，无法办理入住'}
                          </p>
                        </div>
                      </div>

                      {formData.vaccineCheckResult.warnings.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            注意事项:
                          </p>
                          <ul className="space-y-1">
                            {formData.vaccineCheckResult.warnings.map(
                              (warning, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-green-700 flex items-start gap-2"
                                >
                                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {warning}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {formData.vaccineCheckResult.missingDocuments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <p className="text-sm font-medium text-red-800 mb-2">
                            缺失材料:
                          </p>
                          <ul className="space-y-1">
                            {formData.vaccineCheckResult.missingDocuments.map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-red-700 flex items-start gap-2"
                                >
                                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">疫苗明细</h4>
                      {formData.vaccineCheckResult.checks.map((check, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center border',
                                getVaccineStatusColor(check.status)
                              )}
                            >
                              {getVaccineStatusIcon(check.status)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {check.name}
                                {check.required && (
                                  <span className="ml-2 text-xs text-red-500">
                                    (必需)
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                {check.message}
                              </p>
                              {check.expiryDate && (
                                <p className="text-xs text-gray-400">
                                  有效期至: {check.expiryDate}
                                  {check.daysRemaining !== undefined && (
                                    <span className="ml-2">
                                      (剩余 {check.daysRemaining} 天)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium border',
                              getVaccineStatusColor(check.status)
                            )}
                          >
                            {getVaccineStatusText(check.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">正在进行疫苗核验...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary-600" />
                  选择笼位
                </h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">可用</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">已占用</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-600">维护中</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600">隔离笼位</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {cages.map((cage) => {
                    const isSelected = formData.cageId === cage.id;
                    const isAvailable = cage.status === 'available';

                    return (
                      <div
                        key={cage.id}
                        onClick={() => isAvailable && setFormData((prev) => ({ ...prev, cageId: cage.id }))}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all duration-200',
                          isAvailable
                            ? isSelected
                              ? 'border-primary-500 bg-primary-50 cursor-pointer'
                              : cage.type === 'isolation'
                              ? 'border-orange-200 bg-orange-50 hover:border-orange-400 cursor-pointer'
                              : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 cursor-pointer'
                            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              cage.status === 'available'
                                ? cage.type === 'isolation'
                                  ? 'bg-orange-100'
                                  : 'bg-green-100'
                                : cage.status === 'occupied'
                                ? 'bg-red-100'
                                : 'bg-yellow-100'
                            )}
                          >
                            <Home
                              className={cn(
                                'w-5 h-5',
                                cage.status === 'available'
                                  ? cage.type === 'isolation'
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                  : cage.status === 'occupied'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              )}
                            />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{cage.name}</h3>
                        <p className="text-xs text-gray-500">{cage.code}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cage.type === 'isolation' && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              隔离
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {cage.size === 'small'
                              ? '小型'
                              : cage.size === 'medium'
                              ? '中型'
                              : '大型'}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {cage.suitableFor === 'both'
                              ? '通用'
                              : SPECIES_NAMES[cage.suitableFor]}
                          </span>
                        </div>
                        {cage.notes && (
                          <p className="text-xs text-gray-400 mt-2">{cage.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {formData.cageId && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          已选择笼位: {cages.find((c) => c.id === formData.cageId)?.name}
                        </p>
                        <p className="text-sm text-green-600">
                          {cages.find((c) => c.id === formData.cageId)?.code} ·{' '}
                          {cages.find((c) => c.id === formData.cageId)?.type === 'isolation'
                            ? '隔离笼位'
                            : '普通笼位'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  确认信息
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      入住日期 *
                    </label>
                    <input
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkInDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      退房日期 *
                    </label>
                    <input
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkOutDate: e.target.value,
                        }))
                      }
                      min={formData.checkInDate}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.requiresIsolation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requiresIsolation: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">需要隔离</p>
                      <p className="text-sm text-gray-500">
                        该宠物需要单独隔离照顾
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.highRisk}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          highRisk: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">高风险标记</p>
                      <p className="text-sm text-gray-500">
                        该宠物存在健康风险，需要特别关注
                      </p>
                    </div>
                  </label>

                  {formData.highRisk && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        高风险原因
                      </label>
                      <textarea
                        value={formData.highRiskReason}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            highRiskReason: e.target.value,
                          }))
                        }
                        placeholder="请说明高风险原因..."
                        rows={2}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    分配护理员
                  </label>
                  <select
                    value={formData.assignedStaffId || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedStaffId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">请选择护理员（可选）</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    备注
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="特殊要求、注意事项等..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">订单摘要</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">宠物</span>
                      <span className="font-medium text-gray-900">
                        {formData.pet?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">品种</span>
                      <span className="font-medium text-gray-900">
                        {formData.pet?.breed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">主人</span>
                      <span className="font-medium text-gray-900">
                        {formData.pet?.ownerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">笼位</span>
                      <span className="font-medium text-gray-900">
                        {cages.find((c) => c.id === formData.cageId)?.name || '未选择'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">入住日期</span>
                      <span className="font-medium text-gray-900">
                        {formData.checkInDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">退房日期</span>
                      <span className="font-medium text-gray-900">
                        {formData.checkOutDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">疫苗状态</span>
                      <StatusBadge
                        status={formData.vaccineCheckResult?.overallPass ? 'success' : 'danger'}
                      >
                        {formData.vaccineCheckResult?.overallPass ? '已通过' : '未通过'}
                      </StatusBadge>
                    </div>
                    {formData.requiresIsolation && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">隔离</span>
                        <StatusBadge status="warning">是</StatusBadge>
                      </div>
                    )}
                    {formData.highRisk && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">高风险</span>
                        <StatusBadge status="danger">是</StatusBadge>
                      </div>
                    )}
                    {formData.assignedStaffId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">护理员</span>
                        <span className="font-medium text-gray-900">
                          {staff.find((s) => s.id === formData.assignedStaffId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            上一步
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all',
                canProceed()
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={submitForm}
              disabled={!canProceed() || submitting}
              className={cn(
                'inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all',
                canProceed() && !submitting
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  确认提交
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
